import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Mounting materials shared by every sheet: paper, gummed tape, rubber stamps and printed labels.
// Palette roles: --p1 stamp ink, --p2 tape, --p3 drawing accents, --p4 label rules.

/** Text in stamp ink: darkened on paper, lightened on black so any combination stays legible. */
export const stampInk = "text-[color-mix(in_oklab,var(--p1)_82%,black)] dark:text-[color-mix(in_oklab,var(--p1)_62%,white)]";
/** Label rule colour, adjusted the same way for each theme. */
export const ruleInk = "border-[color-mix(in_oklab,var(--p4)_85%,black)] dark:border-[color-mix(in_oklab,var(--p4)_60%,white)]";

/** A mounting sheet. Cream archival board in light mode, black board with a hairline in dark mode. */
export function Sheet({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "@container relative bg-[#fbf8f0] shadow-[0_1px_0_#0000000d,0_12px_32px_-18px_#3b2f1a40] ring-1 ring-[#2a24170f] dark:bg-black dark:shadow-none dark:ring-white/20",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Strip of gummed linen tape holding a stem down. Position it absolutely with `style`
 * (top/left in %, width, and `rotate`).
 */
export function Tape({ style }: { style: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={style}
      className="pointer-events-none absolute h-3.5 bg-(--p2) opacity-80 mix-blend-multiply [clip-path:polygon(2%_0,100%_8%,98%_100%,0_92%)] dark:opacity-70 dark:mix-blend-normal"
    />
  );
}

type TapeSpot = { top: number; left: number; width: number; rotate: number };

/** Default strapping: one strip across the crown, one across the stems at mid height. */
export const standardTapes: readonly TapeSpot[] = [
  { top: 83, left: 30, width: 40, rotate: -6 },
  { top: 54, left: 37, width: 28, rotate: 9 },
];

/**
 * A drawing mounted at the viewBox's own aspect ratio, so tape positions (percent of the
 * 300 x 620 plate) land on the same stems at any size. Give it a height via className.
 */
export function Specimen({ drawing, tapes, className }: { drawing: ReactNode; tapes: readonly TapeSpot[]; className?: string }) {
  return (
    <div className={cn("relative mx-auto aspect-[300/620] max-w-full", className)}>
      {drawing}
      {tapes.map((t, i) => (
        <Tape key={i} style={{ top: `${t.top}%`, left: `${t.left}%`, width: `${t.width}%`, rotate: `${t.rotate}deg` }} />
      ))}
    </div>
  );
}

/** Rotated rubber stamp, the herbarium's accession mark. */
export function Stamp({ top, bottom, className }: { top: ReactNode; bottom: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex -rotate-6 flex-col items-center border-2 border-current px-3 py-1.5 font-(family-name:--hb-type) uppercase opacity-90 outline outline-1 outline-offset-2 outline-current",
        stampInk,
        className,
      )}
    >
      <span className="text-[10px] tracking-[0.25em]">{top}</span>
      <span className="text-lg leading-tight font-bold tracking-wider tabular-nums">{bottom}</span>
    </div>
  );
}

/** Printed determination label with a double rule border, as glued to the lower right of a sheet. */
export function Label({ heading, className, children }: { heading: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={cn("border bg-[#fffdf7] p-1 dark:bg-black", ruleInk, className)}>
      <div className={cn("border px-4 py-3", ruleInk)}>
        <p className="border-b border-current/20 pb-1.5 text-center font-(family-name:--hb-type) text-[10px] tracking-[0.3em] uppercase">
          {heading}
        </p>
        {children}
      </div>
    </div>
  );
}

/** Typewritten "field: value" line on a label. */
export function Field({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 font-(family-name:--hb-type) text-[12px] leading-snug">
      <dt className="opacity-60">{name}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  );
}

/** Pencilled annotation in the collector's hand. */
export function Pencil({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cn("font-(family-name:--hb-hand) text-sm leading-relaxed opacity-75", className)}>{children}</p>;
}

/** Five centimetre scale bar printed on every scanned sheet. */
export function ScaleBar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 104 16" aria-hidden className={cn("h-4 w-28", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={2 + i * 20} y={2} width={20} height={4} fill={i % 2 ? "none" : "currentColor"} stroke="currentColor" strokeWidth={0.6} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <text key={i} x={2 + i * 20} y={14} fontSize={5} textAnchor="middle" fill="currentColor" className="font-(family-name:--hb-type)">
          {i === 5 ? "5 cm" : i}
        </text>
      ))}
    </svg>
  );
}
