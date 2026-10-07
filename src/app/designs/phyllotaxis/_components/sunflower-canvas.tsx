"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useTheme } from "next-themes";
import { usePalette } from "@/components/palette";
import { cn } from "@/lib/utils";
import { GOLDEN_ANGLE, assignGroups, type FloretGroup, type SpiralLayout } from "./vogel";

export type FloretHit = { n: number; group: number; x: number; y: number };

type SunflowerCanvasProps = {
  groups: readonly FloretGroup[];
  layout?: SpiralLayout;
  /** Floret disc radius as a fraction of the spacing c. Each floret owns πc² of area, so 1 would just touch. */
  dot?: number;
  label: string;
  className?: string;
  onHover?: (hit: FloretHit | null) => void;
};

const GROW_MS = 2200;

/**
 * One canvas, one floret per accession. Grows outward from the centre the first time it scrolls
 * into view (r grows linearly, so n grows with t²), then redraws instantly on resize, palette or
 * theme change. No loop runs once the growth finishes.
 */
export function SunflowerCanvas({ groups, layout = "rings", dot = 0.8, label, className, onHover }: SunflowerCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grownFor = useRef<string | null>(null);
  const [size, setSize] = useState(0);
  const [visible, setVisible] = useState(false);
  const { colors } = usePalette();
  const { resolvedTheme } = useTheme();
  const ink = resolvedTheme === "dark" ? "#fff" : "#000";

  const owner = useMemo(() => assignGroups(groups, layout), [groups, layout]);
  const total = owner.length;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const resize = new ResizeObserver(([entry]) => setSize(Math.round(entry.contentRect.width)));
    const seen = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), { threshold: 0.15 });
    resize.observe(wrap);
    seen.observe(wrap);
    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || size === 0 || !visible) return;

    const dpr = window.devicePixelRatio || 1;
    const px = Math.round(size * dpr);
    ctx.canvas.width = px;
    ctx.canvas.height = px;

    const fills = [...colors, ink];
    const half = px / 2;
    const c = (half * 0.97) / Math.sqrt(total);
    const radius = Math.max(c * dot, 0.6);

    // Draws florets [from, to) as one Path2D per group, so a full redraw is a handful of fills.
    const paint = (from: number, to: number) => {
      const paths = groups.map(() => new Path2D());
      for (let i = from; i < to; i++) {
        const n = i + 1;
        const r = c * Math.sqrt(n);
        const x = half + r * Math.cos(n * GOLDEN_ANGLE);
        const y = half + r * Math.sin(n * GOLDEN_ANGLE);
        const path = paths[owner[i]];
        path.moveTo(x + radius, y);
        path.arc(x, y, radius, 0, Math.PI * 2);
      }
      paths.forEach((path, g) => {
        ctx.fillStyle = fills[groups[g].slot] ?? ink;
        ctx.fill(path);
      });
    };

    ctx.clearRect(0, 0, px, px);
    const key = `${layout}:${total}`;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (grownFor.current === key || still) {
      grownFor.current = key;
      paint(0, total);
      return;
    }

    grownFor.current = key;
    let frame = 0;
    let drawn = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / GROW_MS, 1);
      const eased = 1 - (1 - t) ** 3;
      const next = Math.round(total * eased * eased);
      paint(drawn, next);
      drawn = next;
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [size, visible, colors, ink, groups, owner, total, layout, dot]);

  // Nearest floret to the pointer: only florets within two spacings of the pointer's radius can match.
  const hitTest = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!onHover || size === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const half = size / 2;
    const c = (half * 0.97) / Math.sqrt(total);
    const dx = event.clientX - rect.left - half;
    const dy = event.clientY - rect.top - half;
    const r = Math.hypot(dx, dy);
    const lo = Math.max(1, Math.floor(((r - 2 * c) / c) ** 2));
    const hi = Math.min(total, Math.ceil(((r + 2 * c) / c) ** 2));
    let best = { n: 0, d: Infinity, x: 0, y: 0 };
    for (let n = r < 2 * c ? 1 : lo; n <= hi; n++) {
      const x = c * Math.sqrt(n) * Math.cos(n * GOLDEN_ANGLE);
      const y = c * Math.sqrt(n) * Math.sin(n * GOLDEN_ANGLE);
      const d = Math.hypot(x - dx, y - dy);
      if (d < best.d) best = { n, d, x, y };
    }
    onHover(best.d < Math.max(c, 3) ? { n: best.n, group: owner[best.n - 1], x: best.x + half, y: best.y + half } : null);
  };

  return (
    <div ref={wrapRef} className={cn("relative aspect-square w-full", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="absolute inset-0 size-full"
        onPointerMove={onHover ? hitTest : undefined}
        onPointerLeave={onHover ? () => onHover(null) : undefined}
      />
    </div>
  );
}
