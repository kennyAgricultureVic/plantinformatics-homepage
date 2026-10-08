"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useInks } from "./inks";
import { useWindLines } from "./wind-lines";
import { windField, type Stem, type Streamline } from "./wind";

type WindCanvasProps = {
  stems?: readonly Stem[];
  lines?: readonly Streamline[];
  /** 0.2 is a breath, 1 the hero's gale. See windSpeed(). */
  speed: number;
  /** Seeds the weather. */
  seed: string;
  /** Tallest stem as a fraction of the canvas height. */
  stemHeight?: number;
  /** Depth of the sown band above the bottom edge, as a fraction of the height (back row to front row). */
  rows?: number;
  /** Stroke width multiplier for stems. */
  weight?: number;
  /** Streamline opacity and width. */
  lineAlpha?: number;
  lineWidth?: number;
  /** Id of an element whose top edge is the top of the field: stems fill from there to the bottom. */
  fieldFrom?: string;
  /** Listen for the pointer on the parent element and blow a gust where it moves. */
  gusty?: boolean;
  label: string;
  className?: string;
};

const GROW_MS = 1800;
/** Gust spring: stiffness and damping per second, so a pushed stem sways twice and settles. */
const STIFFNESS = 55;
const DAMPING = 5;
const GUST_RADIUS = 110;

/**
 * One canvas of field and weather. Stems are bent by the flow field at their base, streamlines
 * are traced through it. Grows once when scrolled into view, then sits still; a pointer gust
 * runs a damped spring per stem and stops the loop as soon as every stem is back at rest.
 */
export function WindCanvas({
  stems = [],
  lines = [],
  speed,
  seed,
  stemHeight = 0.5,
  rows = 0.18,
  weight = 1,
  lineAlpha = 0.55,
  lineWidth = 1,
  gusty = false,
  fieldFrom,
  label,
  className,
}: WindCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grown = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(false);
  const inks = useInks();
  const showLines = useWindLines();

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const resize = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setSize((s) => (s.w === w && s.h === h ? s : { w, h }));
    });
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          seen.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    resize.observe(wrap);
    seen.observe(wrap);
    return () => {
      resize.disconnect();
      seen.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const { w, h } = size;
    if (!canvas || !ctx || w === 0 || h === 0 || !visible) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";

    const field = windField(seed);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Stems in pixels, back row first so the front row paints over it.
    const ground = h - 2;
    const marker = fieldFrom ? document.getElementById(fieldFrom) : null;
    const fieldTop = marker ? marker.getBoundingClientRect().top - canvas.getBoundingClientRect().top : 0;
    const fieldH = marker ? h - fieldTop : h;
    const band = fieldH * rows;
    const tallest = fieldH * stemHeight;
    // Narrow screens hold the same number of stems, so each one is drawn finer.
    const fine = Math.min(1, Math.max(0.45, w / 1100));
    const placed = stems
      .map((s) => {
        const x = s.x * w;
        const y = ground - (1 - s.depth) * band;
        const height = tallest * s.h * (0.55 + 0.45 * s.depth);
        const wind = field(x, y - height / 2);
        return {
          ...s,
          px: x,
          py: y,
          height,
          lean: speed * 0.62 * wind.strength * Math.cos(wind.angle),
          width: (0.55 + 0.75 * s.depth) * weight * fine,
          alpha: 0.45 + 0.55 * s.depth,
        };
      })
      .toSorted((a, b) => a.depth - b.depth);

    // Streamlines traced with fixed steps; the wind runs faster where |w| is larger.
    const traced = (showLines ? lines : []).map((l) => {
      const points: number[] = [];
      let x = l.x * w;
      let y = l.y * h;
      const steps = Math.round(l.length / 4);
      for (let i = 0; i < steps && x < w + 20 && y > -20 && y < h + 20; i++) {
        points.push(x, y);
        const f = field(x, y);
        const step = 2.5 + 2 * f.strength * speed;
        x += Math.cos(f.angle) * step;
        y += Math.sin(f.angle) * step * 0.6;
      }
      return { points, slot: l.slot };
    });

    const angle = new Float32Array(placed.length);
    const velocity = new Float32Array(placed.length);

    const paint = (growth: number) => {
      ctx.clearRect(0, 0, w, h);

      ctx.globalAlpha = lineAlpha;
      ctx.lineWidth = lineWidth;
      for (const line of traced) {
        const n = Math.floor((line.points.length / 2) * Math.min(growth * 1.3, 1));
        if (n < 2) continue;
        ctx.strokeStyle = inks[line.slot];
        ctx.beginPath();
        ctx.moveTo(line.points[0], line.points[1]);
        for (let i = 1; i < n; i++) ctx.lineTo(line.points[2 * i], line.points[2 * i + 1]);
        ctx.stroke();
      }

      for (let i = 0; i < placed.length; i++) {
        const s = placed[i];
        // Stems rise in a wave that follows the wind from west to east.
        const g = Math.min(Math.max(growth * 1.5 - s.x * 0.5, 0), 1);
        if (g === 0) continue;
        const H = s.height * (1 - (1 - g) ** 2);
        const phi = Math.max(-1.25, Math.min(1.25, s.lean * g + angle[i]));
        const tipX = s.px + H * Math.sin(phi);
        const tipY = s.py - H * Math.cos(phi);
        const cx = s.px + H * 0.2 * Math.sin(phi);
        const cy = s.py - H * 0.62;
        ctx.globalAlpha = s.alpha;
        ctx.strokeStyle = inks[s.slot];
        ctx.lineWidth = s.width;
        ctx.beginPath();
        ctx.moveTo(s.px, s.py);
        ctx.quadraticCurveTo(cx, cy, tipX, tipY);
        ctx.stroke();

        // Head: an ear continuing the stem for cereals, a pod hanging off it for pulses.
        const tx = tipX - cx;
        const ty = tipY - cy;
        const len = Math.hypot(tx, ty) || 1;
        if (s.head === "ear") {
          const ear = H * 0.14 * g;
          ctx.lineWidth = s.width * 2;
          ctx.beginPath();
          ctx.moveTo(tipX - (tx / len) * ear * 0.3, tipY - (ty / len) * ear * 0.3);
          ctx.lineTo(tipX + (tx / len) * ear, tipY + (ty / len) * ear);
          ctx.stroke();
        } else {
          ctx.fillStyle = inks[s.slot];
          ctx.beginPath();
          ctx.arc(tipX, tipY, s.width * 1.5 * g + 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let frame = 0;

    // Gust: a damped spring per stem. The loop runs only while something is still moving.
    const settle = (() => {
      let last = 0;
      const tick = (now: number) => {
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        let moving = false;
        for (let i = 0; i < placed.length; i++) {
          if (angle[i] === 0 && velocity[i] === 0) continue;
          velocity[i] += (-STIFFNESS * angle[i] - DAMPING * velocity[i]) * dt;
          angle[i] += velocity[i] * dt;
          if (Math.abs(angle[i]) < 1e-3 && Math.abs(velocity[i]) < 1e-2) {
            angle[i] = 0;
            velocity[i] = 0;
          } else moving = true;
        }
        paint(1);
        frame = moving ? requestAnimationFrame(tick) : 0;
      };
      return () => {
        if (frame) return;
        last = performance.now();
        frame = requestAnimationFrame(tick);
      };
    })();

    let growing = false;
    if (grown.current || still) {
      grown.current = true;
      paint(1);
    } else {
      growing = true;
      const start = performance.now();
      const grow = (now: number) => {
        const t = Math.min((now - start) / GROW_MS, 1);
        paint(1 - (1 - t) ** 3);
        if (t < 1) frame = requestAnimationFrame(grow);
        else {
          frame = 0;
          growing = false;
          grown.current = true;
        }
      };
      frame = requestAnimationFrame(grow);
    }

    const target = gusty && !still ? wrapRef.current?.parentElement : null;
    let prev: { x: number; y: number } | null = null;
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (prev && !growing) {
        const push = Math.max(-30, Math.min(30, x - prev.x)) * 0.02;
        let touched = false;
        for (let i = 0; i < placed.length; i++) {
          const s = placed[i];
          const d = Math.hypot(s.px - x, s.py - s.height * 0.6 - y);
          if (d > GUST_RADIUS) continue;
          const falloff = 1 - d / GUST_RADIUS;
          velocity[i] += push * falloff * falloff * 6;
          touched = true;
        }
        if (touched) settle();
      }
      prev = { x, y };
    };
    const onLeave = () => (prev = null);
    target?.addEventListener("pointermove", onMove);
    target?.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      target?.removeEventListener("pointermove", onMove);
      target?.removeEventListener("pointerleave", onLeave);
    };
  }, [size, visible, inks, showLines, stems, lines, speed, seed, stemHeight, rows, weight, lineAlpha, lineWidth, gusty, fieldFrom]);

  return (
    <div ref={wrapRef} className={cn("relative w-full", className)}>
      <canvas ref={canvasRef} role="img" aria-label={label} className="absolute inset-0 size-full" />
    </div>
  );
}
