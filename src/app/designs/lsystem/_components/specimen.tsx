"use client";

import { useEffect, useMemo, useRef } from "react";
import { productions } from "./grammars";
import { useGrowth, useInks, useSeen, useSize } from "./hooks";
import { drawShape, grow, hashSeed, interpret, mulberry32, prepareCanvas, type Grammar } from "./lsystem";

type SpecimenProps = { grammar: Grammar; salt: string };

/**
 * One plant grown from `grammar`, fitted to its frame and grown generation by generation
 * the first time it scrolls into view. Its productions are printed underneath.
 */
export function Specimen({ grammar, salt }: SpecimenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [boxRef, { width, height }] = useSize<HTMLDivElement>();
  const [seenRef, seen] = useSeen<HTMLElement>();
  const { inks, paletteId } = useInks();
  const steps = grammar.generations + 1;
  const gen = useGrowth(steps, paletteId, seen);

  const gens = useMemo(() => {
    const seed = hashSeed(salt, paletteId);
    const opts = { angle: grammar.angle, jitter: 0.07, lean: 0 };
    return grow(grammar, mulberry32(seed)).map((s) => interpret(s, opts, mulberry32(seed ^ 0x9e37)));
  }, [grammar, salt, paletteId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !width || !height) return;
    const prepared = prepareCanvas(canvas, width, height);
    if (!prepared) return;
    // Fit the final plant so earlier generations grow into the frame rather than rescaling.
    const b = gens[gens.length - 1].bounds;
    const pad = 16;
    const scale = Math.min((width - pad * 2) / (b.maxX - b.minX || 1), (height - pad * 2) / (b.maxY - b.minY || 1));
    drawShape(
      prepared.ctx,
      gens[Math.min(gen, gens.length - 1)],
      {
        x: width / 2 - ((b.minX + b.maxX) / 2) * scale,
        y: height - pad - b.maxY * scale,
        scale,
        color: inks[0],
        accent: inks[1],
        alpha: 1,
        stemPx: Math.max(1, Math.min(2.2, scale * 0.09)),
      },
      prepared.dpr,
    );
  }, [gens, gen, width, height, inks]);

  return (
    <figure ref={seenRef} className="flex flex-col">
      <div ref={boxRef} className="relative aspect-[4/5] w-full border-b border-current/30">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
      </div>
      <figcaption className="mt-3 font-grammar text-[10.5px] leading-relaxed">
        <p className="mb-1 uppercase tracking-widest text-(--ink0)">
          {grammar.name} · gen {Math.min(gen, grammar.generations)}/{grammar.generations}
        </p>
        {productions(grammar).map((line) => (
          <p key={line} className="whitespace-pre text-muted-foreground">
            {line}
          </p>
        ))}
      </figcaption>
    </figure>
  );
}
