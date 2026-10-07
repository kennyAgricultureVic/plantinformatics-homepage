import type { CSSProperties, ElementType, ReactNode } from "react";
import { sections, type SectionId } from "@/content";
import { cn } from "@/lib/utils";

export const display = "font-(family-name:--font-riso-display)";

/** A palette slot as a CSS colour. */
export const ink = (slot: number) => `var(--p${(slot % 4) + 1})`;

/** Text printed twice from two drums, the second pass slightly out of register. */
export function Overprint({
  children,
  as: Tag = "span",
  inks = [0, 2],
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  inks?: readonly [number, number];
  className?: string;
}) {
  return (
    <Tag className={cn("relative block", className)}>
      <span className="riso-ink block" style={{ color: ink(inks[0]) }}>
        {children}
      </span>
      <span aria-hidden className="riso-ink riso-shift absolute inset-0" style={{ color: ink(inks[1]) }}>
        {children}
      </span>
    </Tag>
  );
}

// Fixed scatter so letters sit the same on server and client.
const tilt = [-4, 3, -2, 5, -3, 2, -5, 4];
const lift = [0, -6, 4, -3, 6, -2, 3, -5];

/** Section heading cut letter by letter from inked paper and pasted down. */
export function CutOutHeading({ id, offset = 0 }: { id: SectionId; offset?: number }) {
  const label = sections.find((s) => s.id === id)?.label ?? id;
  return (
    <h2 className="mb-10 flex flex-wrap gap-1.5 sm:mb-14 sm:gap-2">
      <span className="sr-only">{label}</span>
      {[...label].map((letter, i) => {
        const slot = (i + offset) % 3;
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              display,
              "riso-ink riso-cut inline-flex h-16 min-w-14 items-center justify-center px-3 text-5xl uppercase sm:h-24 sm:min-w-20 sm:text-7xl",
            )}
            style={{
              background: ink(slot),
              color: `var(--p${slot + 1}-fg)`,
              transform: `rotate(${tilt[i % tilt.length]}deg) translateY(${lift[i % lift.length]}px)`,
            }}
          >
            {letter}
          </span>
        );
      })}
    </h2>
  );
}

/** Registration target, printed once per drum so the misregistration shows. */
export function RegMark({ className }: { className?: string }) {
  const mark = (slot: number, extra?: string) => (
    <svg viewBox="0 0 24 24" className={cn("riso-ink absolute inset-0 size-full", extra)} style={{ color: ink(slot) }}>
      <circle cx="12" cy="12" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
  return (
    <span aria-hidden className={cn("pointer-events-none absolute size-5", className)}>
      {mark(0)}
      {mark(1, "riso-shift")}
      {mark(2, "riso-shift-b")}
    </span>
  );
}

/** A strip of translucent tape holding a print to the page. */
export function Tape({ className, slot = 3 }: { className?: string; slot?: number }) {
  return (
    <span
      aria-hidden
      className={cn("riso-ink riso-dots-fine pointer-events-none absolute z-10 h-7 w-24 opacity-80", className)}
      style={{ "--riso-dot": ink(slot), backgroundColor: `color-mix(in srgb, ${ink(slot)} 35%, transparent)` } as CSSProperties}
    />
  );
}

const crops = [
  "-top-3.5 left-0 h-2.5 w-px",
  "-left-3.5 top-0 h-px w-2.5",
  "-top-3.5 right-0 h-2.5 w-px",
  "-right-3.5 top-0 h-px w-2.5",
  "-bottom-3.5 left-0 h-2.5 w-px",
  "-left-3.5 bottom-0 h-px w-2.5",
  "-bottom-3.5 right-0 h-2.5 w-px",
  "-right-3.5 bottom-0 h-px w-2.5",
];

/** One printed sheet with crop marks. With `fold`, a two-page spread with a crease down the middle. */
export function Sheet({ children, fold = false, className }: { children: ReactNode; fold?: boolean; className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-6xl", className)}>
      {crops.map((c) => (
        <span key={c} aria-hidden className={cn("absolute bg-current opacity-60", c)} />
      ))}
      {fold && (
        <>
          <RegMark className="-top-8 left-1/2 hidden -translate-x-1/2 md:block" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-16 -translate-x-1/2 bg-linear-to-r from-transparent via-black/[0.07] to-transparent md:block dark:via-white/[0.09]"
          />
        </>
      )}
      <div className={cn("relative grid border border-black/15 dark:border-white/20", fold && "md:grid-cols-2")}>{children}</div>
    </div>
  );
}

/** One page of a spread. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative min-w-0 p-6 sm:p-10 lg:p-14", className)}>{children}</div>;
}
