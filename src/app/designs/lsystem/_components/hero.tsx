"use client";

import { useState, type ReactNode } from "react";
import { SproutIcon } from "lucide-react";
import { FIELD_GENERATIONS, Field } from "./field";
import { fieldCrops, productions } from "./grammars";
import { useGrowth, useInks, useSeen } from "./hooks";
import { hashSeed } from "./lsystem";

/**
 * Full-bleed field that regrows generation by generation on load, on palette change and on demand.
 * Children (header and headline) sit over the sky; the grammars that grew the field print beneath it.
 */
export function Hero({ children }: { children: ReactNode }) {
  const { paletteId } = useInks();
  const [sowing, setSowing] = useState(0);
  const seed = hashSeed("field", paletteId, sowing);
  const gen = useGrowth(FIELD_GENERATIONS + 1, seed);

  return (
    <div>
      <div className="relative h-[clamp(560px,80svh,940px)] sm:h-[clamp(600px,90svh,940px)]">
        <Field seed={seed} gen={gen} horizon={0.66} reach={0.38} className="absolute inset-0" />
        <div className="relative">{children}</div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-x-10 gap-y-8 px-4 py-8 font-grammar text-[10.5px] leading-relaxed sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="flex flex-col items-start gap-1">
          <p className="uppercase tracking-widest text-(--ink0)">Field</p>
          <p className="text-muted-foreground">seed {seed.toString(16).padStart(8, "0")}</p>
          <p className="text-muted-foreground" aria-live="polite">
            {gen > FIELD_GENERATIONS ? "flowered" : `generation ${gen} of ${FIELD_GENERATIONS}`}
          </p>
          <button
            type="button"
            onClick={() => setSowing((n) => n + 1)}
            className="mt-2 inline-flex items-center gap-2 border-b border-(--ink0) pb-0.5 uppercase tracking-widest hover:text-(--ink0)"
          >
            <SproutIcon className="size-3.5" />
            Sow again
          </button>
        </div>
        {fieldCrops.map(({ grammar, share }) => (
          <div key={grammar.name}>
            <p className="mb-1 uppercase tracking-widest text-(--ink0)">
              {grammar.name} · {Math.round(share * 100)}%
            </p>
            {productions(grammar).map((line) => (
              <p key={line} className="whitespace-pre text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A low strip of field that grows the first time it scrolls into view. */
export function FieldStrip({ salt, className }: { salt: string; className?: string }) {
  const { paletteId } = useInks();
  const [ref, seen] = useSeen<HTMLDivElement>();
  const seed = hashSeed(salt, paletteId);
  const gen = useGrowth(FIELD_GENERATIONS + 1, seed, seen);
  return (
    <div ref={ref} className={className}>
      <Field seed={seed} gen={gen} horizon={0.2} reach={0.75} className="size-full" />
    </div>
  );
}
