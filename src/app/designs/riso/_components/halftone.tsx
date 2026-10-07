"use client";

import { useEffect, useRef } from "react";
import { usePalette } from "@/components/palette";
import { cn } from "@/lib/utils";

// Halftoned "photo" of scattered grain, drawn as two ink layers on rotated dot screens
// (15° and 75°, as on a riso), the second layer printed slightly out of register.

type Blob = { x: number; y: number; rx: number; ry: number; a: number };

const rng = (seed: string) => {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

// Grain-shaped ellipses scattered across a unit square.
const scatter = (seed: string, n: number): Blob[] => {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const big = 0.08 + r() * 0.1;
    return { x: 0.08 + r() * 0.84, y: 0.1 + r() * 0.8, rx: big, ry: big * (0.45 + r() * 0.2), a: r() * Math.PI };
  });
};

const field = (blobs: Blob[], x: number, y: number) => {
  let v = 0;
  for (const b of blobs) {
    const dx = x - b.x;
    const dy = y - b.y;
    const u = (dx * Math.cos(b.a) + dy * Math.sin(b.a)) / b.rx;
    const w = (-dx * Math.sin(b.a) + dy * Math.cos(b.a)) / b.ry;
    const d = u * u + w * w;
    // Bright rim, darker core: reads like a lit seed.
    if (d < 1.4) v = Math.max(v, Math.min(1, (1.4 - d) * 1.1) * (0.55 + 0.45 * d));
  }
  return v;
};

function drawScreen(
  canvas: HTMLCanvasElement,
  color: string,
  angle: number,
  cell: number,
  value: (x: number, y: number) => number,
) {
  const { width: cw, height: ch } = canvas.getBoundingClientRect();
  if (!cw || !ch) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = color;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const reach = Math.ceil(Math.hypot(cw, ch) / cell / 2) + 1;
  ctx.beginPath();
  for (let i = -reach; i <= reach; i++) {
    for (let j = -reach; j <= reach; j++) {
      const x = cw / 2 + (i * cos - j * sin) * cell;
      const y = ch / 2 + (i * sin + j * cos) * cell;
      if (x < -cell || y < -cell || x > cw + cell || y > ch + cell) continue;
      const v = value(x / cw, y / ch);
      if (v < 0.04) continue;
      const r = Math.sqrt(v) * cell * 0.62;
      ctx.moveTo(x + r, y);
      ctx.arc(x, y, r, 0, Math.PI * 2);
    }
  }
  ctx.fill();
}

type HalftoneProps = {
  seed: string;
  /** Palette slots (0 to 3) for the two drums. */
  inks?: readonly [number, number];
  /** Alt text; without it the image is decorative. */
  label?: string;
  className?: string;
};

export function Halftone({ seed, inks = [0, 1], label, className }: HalftoneProps) {
  const { colors } = usePalette();
  const a = useRef<HTMLCanvasElement>(null);
  const b = useRef<HTMLCanvasElement>(null);
  const colorA = colors[inks[0]];
  const colorB = colors[inks[1]];

  useEffect(() => {
    const grains = scatter(seed, 7);
    const shadows = grains.map((g) => ({ ...g, x: g.x + 0.035, y: g.y + 0.05 }));
    const draw = () => {
      if (a.current) drawScreen(a.current, colorA, Math.PI / 12, 7, (x, y) => field(grains, x, y));
      if (b.current)
        drawScreen(b.current, colorB, (5 * Math.PI) / 12, 7, (x, y) => {
          // Soft falloff across the frame plus the shadow each grain casts.
          const ground = 0.05 + 0.25 * y * (1 - 0.6 * x);
          return Math.min(1, Math.max(ground * (1 - field(grains, x, y)), field(shadows, x, y) * 0.8));
        });
    };
    draw();
    const observer = new ResizeObserver(draw);
    if (a.current) observer.observe(a.current);
    return () => observer.disconnect();
  }, [seed, colorA, colorB]);

  return (
    <div role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} className={cn("relative isolate overflow-hidden", className)}>
      <canvas ref={b} aria-hidden className="riso-ink riso-shift absolute inset-0 size-full" />
      <canvas ref={a} aria-hidden className="riso-ink absolute inset-0 size-full" />
    </div>
  );
}
