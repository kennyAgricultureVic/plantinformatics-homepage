import type { ReactNode } from "react";
import { formatNumber, type SectionId } from "@/content";
import { cn } from "@/lib/utils";
import { bandFor } from "./genome";

export type Mark = { at: number; label: string };

/** Evenly spaced labelled marks between `start` and `end`, positioned 0..1. */
export const linearMarks = (start: number, end: number, count: number, format = formatNumber): Mark[] =>
  Array.from({ length: count + 1 }, (_, i) => ({ at: i / count, label: format(Math.round(start + ((end - start) * i) / count)) }));

/**
 * Coordinate ruler drawn along the top of a track. Labels on odd marks drop out on phones
 * so the numbers never collide.
 */
export function Ruler({ marks, minor = 5, className }: { marks: readonly Mark[]; minor?: number; className?: string }) {
  const minorTicks = Array.from({ length: (marks.length - 1) * minor + 1 }, (_, i) => i / ((marks.length - 1) * minor));
  return (
    <div aria-hidden className={cn("relative h-8 w-full font-(family-name:--font-martian) text-[10px] tabular-nums", className)}>
      <div className="absolute inset-x-0 bottom-0 h-px bg-foreground" />
      {minorTicks.map((at) => (
        <span key={at} className="absolute bottom-0 h-1 w-px bg-foreground/50" style={{ left: `${at * 100}%` }} />
      ))}
      {marks.map((m, i) => (
        <span key={m.at} className={cn("absolute bottom-0 h-2.5 w-px bg-foreground", i % 2 === 1 && marks.length > 5 && "max-sm:h-1.5")} style={{ left: `${m.at * 100}%` }}>
          <span
            className={cn(
              "absolute bottom-3 whitespace-nowrap",
              i === 0 ? "left-0" : i === marks.length - 1 ? "right-0" : "left-0 -translate-x-1/2",
              i % 2 === 1 && marks.length > 5 && "max-sm:hidden",
            )}
          >
            {m.label}
          </span>
        </span>
      ))}
    </div>
  );
}

/**
 * One row of the browser: a track-name gutter on the left (stacked on top on phones) and the
 * track body on the right. Every row shares the gutter width so the whole page lines up.
 */
export function TrackRow({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid md:grid-cols-[14rem_minmax(0,1fr)]", className)}>
      <div className="px-4 pt-5 font-(family-name:--font-martian) text-[11px] leading-relaxed md:border-r md:border-foreground/20 md:py-6 md:pr-5 md:pl-6">
        {label}
      </div>
      <div className="min-w-0 px-4 py-5 md:px-8 md:py-6">{children}</div>
    </div>
  );
}

/**
 * A page section drawn as a browser track: a header row with the section's cytoband, its
 * name and a coordinate ruler for its slice of chrPI, then the track rows passed as children.
 */
export function Track({ id, title, kind, children }: { id: SectionId; title: string; kind: string; children: ReactNode }) {
  const band = bandFor(id);
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28 border-b border-foreground/20">
      <TrackRow
        className="border-b border-foreground/20"
        label={
          <div className="flex items-start gap-3">
            <span className="mt-1 h-10 w-1.5 shrink-0" style={{ background: band.color }} />
            <div>
              <p className="text-muted-foreground">
                chrPI {band.band} / {kind}
              </p>
              <h2 id={`${id}-title`} className="mt-1 text-xl font-bold tracking-tight">
                {title}
              </h2>
            </div>
          </div>
        }
      >
        <div className="flex h-full flex-col justify-end">
          <Ruler marks={linearMarks(band.start, band.end, 8)} />
        </div>
      </TrackRow>
      {children}
    </section>
  );
}

/** Small mono label used in gutters: muted kind line over a bold name. */
export function GutterLabel({ kind, name, children }: { kind: string; name: ReactNode; children?: ReactNode }) {
  return (
    <div>
      <p className="text-muted-foreground">{kind}</p>
      <p className="mt-1 font-bold">{name}</p>
      {children}
    </div>
  );
}
