"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRightIcon, ChevronRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { formatNumber, tools } from "@/content";
import { cn } from "@/lib/utils";
import { bandFor, paletteVar, seeded, tint } from "./genome";
import { TrackRow } from "./track";

// Each tool is a gene on the tools band. Exons are capabilities (wider for longer text),
// introns get seeded lengths, and gene loci tile the band end to end.
const band = bandFor("tools");
const genes = tools.map((tool, t) => {
  const rand = seeded(tool.name.length * 977 + t);
  const parts = tool.capabilities.flatMap((cap, i) => {
    const exon = { kind: "exon" as const, index: i, grow: 4 + cap.length / 9 };
    return i === 0 ? [exon] : [{ kind: "intron" as const, index: i, grow: 3 + rand() * 7 }, exon];
  });
  const span = (band.end - band.start) / tools.length;
  const start = Math.round(band.start + t * span + span * 0.08);
  return { tool, color: paletteVar(t), fg: `var(--p${(t % 4) + 1}-fg)`, parts, start, end: Math.round(start + span * 0.84) };
});

/** Exon-intron drawing for one tool. Hovering or focusing an exon highlights its capability. */
function GeneModel({ gene, active, onActive }: { gene: (typeof genes)[number]; active: number | null; onActive: (i: number | null) => void }) {
  return (
    <div className="flex h-10 items-center" onMouseLeave={() => onActive(null)}>
      <span className="h-3.5 basis-6 shrink-0" style={{ background: tint(gene.color, 55) }} />
      {gene.parts.map((part) =>
        part.kind === "intron" ? (
          <span key={`i${part.index}`} className="relative flex h-full items-center justify-center" style={{ flexGrow: part.grow, flexBasis: 0 }}>
            <span className="absolute inset-x-0 top-1/2 h-px bg-foreground" />
            <ChevronRightIcon className="relative size-3 bg-background max-sm:hidden" strokeWidth={2.5} />
          </span>
        ) : (
          <button
            key={`e${part.index}`}
            type="button"
            aria-label={`Exon ${part.index + 1}: ${gene.tool.capabilities[part.index]}`}
            onMouseEnter={() => onActive(part.index)}
            onFocus={() => onActive(part.index)}
            onBlur={() => onActive(null)}
            className={cn(
              "flex h-full min-w-3 items-center justify-center font-(family-name:--font-martian) text-[10px] font-bold outline-offset-2 transition-opacity focus-visible:outline-2 focus-visible:outline-foreground",
              active !== null && active !== part.index && "opacity-35",
              active === part.index && "outline-2 outline-foreground",
            )}
            style={{ flexGrow: part.grow, flexBasis: 0, background: gene.color, color: gene.fg }}
          >
            <span className="max-sm:hidden">E{part.index + 1}</span>
          </button>
        ),
      )}
      <span className="h-3.5 basis-10 shrink-0" style={{ background: tint(gene.color, 55) }} />
      <span
        className="size-0 shrink-0 border-y-[7px] border-l-[9px] border-y-transparent"
        style={{ borderLeftColor: tint(gene.color, 55) }}
      />
    </div>
  );
}

/** One tool as a gene annotation row: locus in the gutter, model, then description and exon list. */
function Gene({ gene }: { gene: (typeof genes)[number] }) {
  const [active, setActive] = useState<number | null>(null);
  const { tool } = gene;

  return (
    <TrackRow
      className="border-b border-foreground/20 last:border-b-0"
      label={
        <div>
          <p className="text-muted-foreground">gene model / + strand</p>
          <h3 className="mt-1 text-2xl font-bold italic tracking-tight">{tool.name}</h3>
          <p className="mt-1 tabular-nums text-muted-foreground">
            chrPI:{formatNumber(gene.start)}-{formatNumber(gene.end)}
          </p>
          <a href={tool.url} className="mt-3 inline-flex items-center gap-1 font-bold underline-offset-4 hover:underline">
            Open {tool.name}
            <ArrowUpRightIcon className="size-3.5" />
          </a>
        </div>
      }
    >
      <GeneModel gene={gene} active={active} onActive={setActive} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div>
          <p className="max-w-prose text-lg leading-relaxed">{tool.description}</p>
          <ol className="mt-6 border-t border-foreground/20" onMouseLeave={() => setActive(null)}>
            {tool.capabilities.map((cap, i) => (
              <li
                key={cap}
                onMouseEnter={() => setActive(i)}
                className="grid grid-cols-[3rem_1fr] gap-2 border-b border-foreground/20 py-2 text-sm transition-colors"
                style={{ background: active === i ? tint(gene.color, 22) : undefined }}
              >
                <span className="pl-1 font-(family-name:--font-martian) text-[10px] leading-5 font-bold" style={{ color: active === i ? undefined : gene.color }}>
                  E{i + 1}
                </span>
                {cap}
              </li>
            ))}
          </ol>
        </div>
        {"image" in tool ? (
          <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="border border-foreground/20" />
        ) : (
          <ImagePlaceholder label={tool.name} className="border-foreground/30" />
        )}
      </div>
    </TrackRow>
  );
}

/** All tools stacked as gene annotation rows. */
export function GeneTrack() {
  return genes.map((gene) => <Gene key={gene.tool.slug} gene={gene} />);
}
