import type { CSSProperties, ReactNode } from "react";
import { sections, type SectionId } from "@/content";
import { cn } from "@/lib/utils";

/**
 * A palette slot, read as `var(--pN)`. Combinations with fewer than four colours repeat,
 * so only neighbouring slots (1-2, 2-3, 3-4) are guaranteed to differ. Every poster pairs
 * its field with a neighbouring slot for the dominant shape so it never disappears.
 */
export type Slot = 1 | 2 | 3 | 4;

export const ink = (slot: Slot) => `var(--p${slot})` as const;

/** Flat field of one slot with its readable foreground, for `style`. */
export const paint = (slot: Slot): CSSProperties => ({ background: ink(slot), color: `var(--p${slot}-fg)` });

/** Display face: heavy, condensed, uppercase. */
export const display = "font-(family-name:--font-poster-display) font-black uppercase leading-[0.85] tracking-tight";

export const sectionNumber = (id: SectionId) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, "0");
export const sectionLabel = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;

/** Full-viewport poster sheet: one flat palette field, with art and type layered on top. */
export function Sheet({ id, field, children }: { id: SectionId; field: Slot; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      style={paint(field)}
      className="relative isolate flex min-h-[calc(100svh-3rem)] scroll-mt-12 flex-col overflow-clip"
    >
      {children}
    </section>
  );
}

/** Poster corner mark: section number and label, like a print run index. Doubles as the section heading. */
export function Kicker({ id, className }: { id: SectionId; className?: string }) {
  const Heading = id === "about" ? "p" : "h2";
  return (
    <Heading
      id={id === "about" ? undefined : `${id}-title`}
      className={cn(display, "flex items-baseline gap-3 text-xl sm:text-2xl", className)}
    >
      <span className="border-2 border-current px-1.5 pt-0.5">{sectionNumber(id)}</span>
      {sectionLabel(id)}
    </Heading>
  );
}

/** Strict twelve column grid on plain paper that carries the detail content under each poster. */
export function Detail({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="border-b-8 border-current">
      <div className={cn("mx-auto grid w-full max-w-7xl grid-cols-4 gap-x-6 gap-y-12 px-4 py-16 sm:px-8 md:grid-cols-12 md:py-24", className)}>
        {children}
      </div>
    </div>
  );
}
