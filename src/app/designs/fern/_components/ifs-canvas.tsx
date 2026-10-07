"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { boundsOf, chaosGame, ifsById, inkRank } from "./ifs";
import { useInks } from "./inks";

type IfsCanvasProps = {
  /** Key into `ifsById`. Plain strings cross the server/client boundary. */
  ifs: string;
  /** Exactly this many points are plotted. */
  points: number;
  seed: string;
  label: string;
  /** Point side in CSS pixels. Keep it equal across drawings that are compared. */
  dot?: number;
  /** Faded drawing, for superseded releases. */
  faint?: boolean;
  growMs?: number;
  /** Fill a box sized by className instead of taking the attractor's aspect ratio. */
  fill?: boolean;
  className?: string;
};

const PAD = 0.03;

/**
 * One canvas, one chaos game. The points arrive in the order the game produced them the first
 * time the canvas scrolls into view, so the frond fills in evenly, then the loop stops. Palette,
 * theme and size changes repaint the finished frond at once.
 */
export function IfsCanvas({ ifs: id, points, seed, label, dot = 1, faint, growMs = 2000, fill, className }: IfsCanvasProps) {
  const ifs = ifsById[id];
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grown = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(false);
  const { inks } = useInks();

  const plot = useMemo(() => chaosGame(ifs, points, seed), [ifs, points, seed]);
  const bounds = boundsOf(ifs);
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const resize = new ResizeObserver(([entry]) =>
      setSize({ w: Math.round(entry.contentRect.width), h: Math.round(entry.contentRect.height) }),
    );
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          seen.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    resize.observe(wrap);
    seen.observe(wrap);
    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || size.w === 0 || !visible) return;

    const dpr = window.devicePixelRatio || 1;
    const W = Math.round(size.w * dpr);
    const H = Math.round(size.h * dpr);
    ctx.canvas.width = W;
    ctx.canvas.height = H;

    const scale = Math.min(W / (bw * (1 + 2 * PAD)), H / (bh * (1 + 2 * PAD)));
    const ox = W / 2 - ((bounds.minX + bounds.maxX) / 2) * scale;
    const oy = H / 2 + ((bounds.minY + bounds.maxY) / 2) * scale;
    const s = Math.max(dot * dpr, 1);
    const rank = inkRank(ifs);
    const { xs, ys, by } = plot;

    // One pass per map so fillStyle changes four times per batch, not once per point.
    const paint = (from: number, to: number) => {
      ctx.globalAlpha = faint ? 0.45 : 1;
      for (let k = 0; k < ifs.maps.length; k++) {
        ctx.fillStyle = inks[rank[k]] ?? inks[0];
        for (let i = from; i < to; i++) {
          if (by[i] !== k) continue;
          ctx.fillRect(ox + xs[i] * scale - s / 2, oy - ys[i] * scale - s / 2, s, s);
        }
      }
    };

    ctx.clearRect(0, 0, W, H);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (grown.current || still) {
      grown.current = true;
      paint(0, points);
      return;
    }

    grown.current = true;
    let frame = 0;
    let drawn = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / growMs, 1);
      const next = Math.round(points * (1 - (1 - t) ** 2));
      paint(drawn, next);
      drawn = next;
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      // An interrupted growth repaints in full next time rather than starting over.
    };
  }, [size, visible, inks, plot, ifs, bounds, bw, bh, dot, faint, points, growMs]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative w-full", className)}
      style={fill ? undefined : { aspectRatio: `${(bw * (1 + 2 * PAD)).toFixed(3)} / ${(bh * (1 + 2 * PAD)).toFixed(3)}` }}
    >
      <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 size-full" />
    </div>
  );
}
