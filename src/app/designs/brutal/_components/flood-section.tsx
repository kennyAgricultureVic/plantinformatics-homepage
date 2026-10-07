import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FitText } from "./fit-text";
import { display, mono } from "./type";

// Each tone binds the section's local --flood (paper) and --ink (text) to one palette slot.
const tones = {
  1: "[--flood:var(--p1)] [--ink:var(--p1-fg)]",
  2: "[--flood:var(--p2)] [--ink:var(--p2-fg)]",
  3: "[--flood:var(--p3)] [--ink:var(--p3-fg)]",
  4: "[--flood:var(--p4)] [--ink:var(--p4-fg)]",
} as const;

type FloodSectionProps = {
  id: string;
  /** Wordmark-sized section name, set to fill the full width. Omit for the hero. */
  title?: string;
  index: number;
  tone: keyof typeof tones;
  children: ReactNode;
};

/**
 * A full-bleed section flooded with one palette colour in light mode. Dark mode flips it:
 * black paper with the palette colour as ink for the giant title and rules.
 */
export function FloodSection({ id, title, index, tone, children }: FloodSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        tones[tone],
        "@container scroll-mt-24 border-b-2 border-(--ink) bg-(--flood) px-4 pt-6 pb-16 text-(--ink) sm:px-6 md:scroll-mt-14",
        "dark:border-(--flood) dark:bg-black dark:text-white",
      )}
    >
      {title && (
        <>
          <p className={cn(mono, "flex justify-between text-xs font-bold tracking-widest uppercase")}>
            <span>{String(index).padStart(2, "0")}</span>
            <span>{title}</span>
          </p>
          <FitText as="h2" className={cn(display, "leading-[0.8] dark:text-(--flood)")}>
            {title}
          </FitText>
        </>
      )}
      {children}
    </section>
  );
}

/** Raw 2px rule in the section's ink (or flood colour in dark mode). */
export const rule = "border-(--ink) dark:border-(--flood)";
