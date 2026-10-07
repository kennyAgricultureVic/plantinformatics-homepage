"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { fieldCrops } from "./grammars";
import { useInks, useSize } from "./hooks";
import { drawShape, grow, hashSeed, interpret, mulberry32, prepareCanvas } from "./lsystem";

const POOL = 260;

/** Most generations in the field mix. Step FIELD_GENERATIONS + 1 is the flowering pass. */
export const FIELD_GENERATIONS = Math.max(...fieldCrops.map((c) => c.grammar.generations));

/** Sows a deterministic pool of plants: species, position, depth and every generation's geometry. */
const sow = (seed: number) => {
  const rand = mulberry32(seed);
  const wind = (rand() - 0.5) * 0.05;
  const plants = Array.from({ length: POOL }, (_, rank) => {
    let r = rand();
    const crop = fieldCrops.find((c) => (r -= c.share) <= 0) ?? fieldCrops[0];
    const plantSeed = hashSeed(seed, rank);
    const opts = { angle: crop.grammar.angle, jitter: 0.09, lean: wind + (rand() - 0.5) * 0.02 };
    const gens = grow(crop.grammar, mulberry32(plantSeed)).map((s) => interpret(s, opts, mulberry32(plantSeed ^ 0x5bd1)));
    // Depth skews toward the horizon so far rows are dense and near rows sparse.
    return { rank, u: rand(), depth: rand() ** 1.5, size: crop.size * (0.8 + rand() * 0.35), shade: rand(), gens };
  });
  return plants.sort((a, b) => a.depth - b.depth);
};

type FieldProps = {
  seed: number;
  /** Generation to show; each plant clamps to its own last generation. */
  gen: number;
  /** Horizon line as a fraction of height from the top. */
  horizon: number;
  /** How tall the nearest plants are, as a fraction of the canvas height. */
  reach?: number;
  className?: string;
};

/**
 * A field of L-system crops in horizon perspective. Far rows are small, faint and drawn in the
 * lowest-contrast palette ink; near rows are large and use the highest-contrast ink.
 */
export function Field({ seed, gen, horizon, reach = 0.6, className }: FieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [boxRef, { width, height }] = useSize<HTMLDivElement>();
  const { inks } = useInks();
  const plants = useMemo(() => sow(seed), [seed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const prepared = prepareCanvas(canvas, width, height);
    if (!prepared) return;
    const { ctx, dpr } = prepared;

    const count = Math.min(POOL, Math.max(70, Math.round(width / 5.5)));
    // Narrow screens have short headlines and tall canvases, so raise the horizon and enlarge the crop.
    const narrow = width < 640;
    const horizonY = height * (narrow ? horizon * 0.8 : horizon);
    const unit = (height * reach * (narrow ? 1.25 : 1)) / 16;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = inks[2];
    ctx.fillRect(0, horizonY, width, 1);

    for (const p of plants) {
      if (p.rank >= count) continue;
      const persp = p.depth ** 1.4;
      const band = Math.min(3, Math.floor((1 - p.depth) * 4 + (p.shade - 0.5) * 0.9));
      const shape = p.gens[Math.min(gen, p.gens.length - 1)];
      const scale = unit * (0.12 + 0.88 * persp) * p.size;
      drawShape(
        ctx,
        shape,
        {
          x: p.u * (width + 40) - 20,
          y: horizonY + (height - horizonY) * persp + 6,
          scale,
          color: inks[Math.max(0, band)],
          accent: inks[Math.max(0, band - 1)],
          alpha: 0.45 + 0.55 * p.depth,
          stemPx: Math.max(0.5, scale * 0.13),
        },
        dpr,
      );
    }
  }, [plants, gen, width, height, horizon, reach, inks]);

  return (
    <div ref={boxRef} className={cn("relative overflow-hidden", className)}>
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
    </div>
  );
}
