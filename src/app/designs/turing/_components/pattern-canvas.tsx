"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { usePalette } from "@/components/palette";
import type { Hex } from "@/content";
import { cn } from "@/lib/utils";
import { createField, step, type Field, type Plate } from "./gray-scott";

/**
 * A colour stop on the concentration ramp: the page ground, the page ink, a palette slot (p1..p4),
 * a palette colour ranked by contrast with the ground (c0 most, c3 least), or black or white,
 * whichever reads better on a palette slot (f1..f4, the same as --p1-fg..--p4-fg).
 */
export type Stop = "ground" | "ink" | "p1" | "p2" | "p3" | "p4" | "c0" | "c1" | "c2" | "c3" | "f1" | "f2" | "f3" | "f4";

/** Frames the growth is spread over. The step count, and so the final picture, never changes. */
const FRAMES = 140;

/** Ramp position of live ground with no pattern on it. */
const FLOOR = 0.2;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const luminance = (hex: Hex) =>
  rgb(hex)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);

/** 256-entry RGB lookup from evenly spaced stops. */
function buildRamp(stops: readonly string[]) {
  const ramp = new Uint8ClampedArray(256 * 3);
  const cols = stops.map(rgb);
  for (let i = 0; i < 256; i++) {
    const t = (i / 255) * (cols.length - 1);
    const a = Math.min(Math.floor(t), cols.length - 2);
    const f = t - a;
    for (let c = 0; c < 3; c++) ramp[i * 3 + c] = cols[a][c] + (cols[a + 1][c] - cols[a][c]) * f;
  }
  return ramp;
}

/**
 * Paints the field: colour is the substrate used up, 1 − u, read through the ramp. The grid is
 * upsampled bilinearly by `scale` before colouring, so edges stay crisp when the canvas stretches it.
 */
function paint(ctx: CanvasRenderingContext2D, field: Field, ramp: Uint8ClampedArray, scale: number) {
  const { w, h, u, live } = field;
  const W = w * scale;
  const H = h * scale;
  const image = ctx.createImageData(W, H);
  const px = image.data;
  for (let Y = 0; Y < H; Y++) {
    const gy = Math.min((Y + 0.5) / scale - 0.5, h - 1);
    const y0 = Math.max(0, Math.floor(gy));
    const y1 = Math.min(h - 1, y0 + 1);
    const fy = Math.max(0, gy - y0);
    for (let X = 0; X < W; X++) {
      const gx = Math.min((X + 0.5) / scale - 0.5, w - 1);
      const x0 = Math.max(0, Math.floor(gx));
      const x1 = Math.min(w - 1, x0 + 1);
      const fx = Math.max(0, gx - x0);
      const top = u[y0 * w + x0] * (1 - fx) + u[y0 * w + x1] * fx;
      const bottom = u[y1 * w + x0] * (1 - fx) + u[y1 * w + x1] * fx;
      const mTop = live[y0 * w + x0] * (1 - fx) + live[y0 * w + x1] * fx;
      const mBottom = live[y1 * w + x0] * (1 - fx) + live[y1 * w + x1] * fx;
      const mask = mTop * (1 - fy) + mBottom * fy;
      const s = Math.min(1, Math.max(0, (1 - (top * (1 - fy) + bottom * fy)) / 0.7));
      // A gentle S-curve sharpens the boundary between pattern and ground; live ground gets a
      // faint floor so the shape the data allowed is visible even where nothing has grown yet.
      const t = Math.max(s * s * (3 - 2 * s), mask * FLOOR);
      const k = Math.round(t * 255) * 3;
      const o = (Y * W + X) * 4;
      px[o] = ramp[k];
      px[o + 1] = ramp[k + 1];
      px[o + 2] = ramp[k + 2];
      px[o + 3] = 255;
    }
  }
  if (ctx.canvas.width !== W || ctx.canvas.height !== H) {
    ctx.canvas.width = W;
    ctx.canvas.height = H;
  }
  ctx.putImageData(image, 0, 0);
}

type PatternCanvasProps = {
  plate: Plate;
  stops: readonly Stop[];
  label: string;
  className?: string;
  /** Bilinear upsampling before colouring. 2 or 3 for large canvases, 1 for small ones. */
  scale?: number;
};

/**
 * Grows one plate the first time it scrolls into view, a few dozen steps a frame, then stops.
 * Palette or theme changes recolour the frozen field without running it again.
 */
export function PatternCanvas({ plate, stops, label, className, scale = 2 }: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<{ key: string; field: Field } | null>(null);
  const [seen, setSeen] = useState(false);
  const { colors } = usePalette();
  const dark = useTheme().resolvedTheme === "dark";

  const ground: Hex = dark ? "#000000" : "#ffffff";
  const ink: Hex = dark ? "#ffffff" : "#000000";
  const ranked = [...colors].sort((a, b) => (dark ? luminance(b) - luminance(a) : luminance(a) - luminance(b)));
  const hexes = stops.map((s) => {
    if (s === "ground") return ground;
    if (s === "ink") return ink;
    const n = Number(s[1]);
    if (s[0] === "p") return colors[n - 1];
    if (s[0] === "f") return luminance(colors[n - 1]) > 0.179 ? "#000000" : "#ffffff";
    return ranked[n];
  });
  const rampKey = hexes.join(",");

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The latest ramp for the running animation, without restarting it.
  const rampRef = useRef(hexes);
  useEffect(() => {
    rampRef.current = hexes;
  });

  // Grow. Runs once per plate; the field lives in a ref so recolouring never re-simulates.
  const plateKey = `${plate.key}:${plate.w}x${plate.h}:${plate.steps}`;
  useEffect(() => {
    if (!seen) return;
    if (fieldRef.current?.key === plateKey) return;
    const field = createField(plate);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      step(field, plate.steps);
      fieldRef.current = { key: plateKey, field };
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) paint(ctx, field, buildRamp(rampRef.current), scale);
      return;
    }
    const chunk = Math.ceil(plate.steps / FRAMES);
    let done = 0;
    let frame = 0;
    const run = () => {
      const n = Math.min(chunk, plate.steps - done);
      step(field, n);
      done += n;
      if (done >= plate.steps) fieldRef.current = { key: plateKey, field };
      else frame = requestAnimationFrame(run);
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) paint(ctx, field, buildRamp(rampRef.current), scale);
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
    // plate is described fully by plateKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen, plateKey, scale]);

  // Recolour the finished field.
  useEffect(() => {
    const done = fieldRef.current;
    const ctx = canvasRef.current?.getContext("2d");
    if (!done || done.key !== plateKey || !ctx) return;
    paint(ctx, done.field, buildRamp(rampKey.split(",")), scale);
  }, [rampKey, plateKey, scale]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={label}
      width={plate.w}
      height={plate.h}
      style={{ aspectRatio: `${plate.w} / ${plate.h}` }}
      className={cn("block h-auto w-full", className)}
    />
  );
}
