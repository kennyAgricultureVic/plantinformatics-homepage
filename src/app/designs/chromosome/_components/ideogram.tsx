"use client";

import { useEffect, useState } from "react";
import { formatNumber, site } from "@/content";
import { ThemeToggle } from "@/components/theme-toggle";
import { bands, chromosomeLength, seeded, tint } from "./genome";

// Giemsa-style sub-bands inside each section band: [relative width, stain strength %].
const stains = bands.map((_, i) => {
  const rand = seeded(17 + i * 101);
  return Array.from({ length: 6 }, (_, j) => [0.6 + rand() * 1.4, j % 2 === 0 ? 100 : 15 + Math.round(rand() * 45)] as const);
});

type View = { top: number; bottom: number; active: number };

/** Map a document y position to a chrPI coordinate, piecewise across the four sections. */
function locate(y: number, spans: readonly { top: number; bottom: number }[]) {
  const quarter = 1 / spans.length;
  for (const [i, s] of spans.entries()) {
    if (y < s.bottom || i === spans.length - 1) {
      const local = Math.min(1, Math.max(0, (y - s.top) / (s.bottom - s.top)));
      return (i + local) * quarter;
    }
  }
  return 0;
}

/** Tracks the visible slice of the page as fractions of the chromosome, updated once per frame on scroll. */
function useView(): View {
  const [view, setView] = useState<View>({ top: 0, bottom: 0.08, active: 0 });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const spans = bands.map((b) => {
        const rect = document.getElementById(b.id)?.getBoundingClientRect();
        return rect ? { top: rect.top + scrollY, bottom: rect.bottom + scrollY } : { top: 0, bottom: 1 };
      });
      const header = document.getElementById("chromosome-header")?.offsetHeight ?? 0;
      const top = locate(scrollY + header, spans);
      const bottom = locate(scrollY + innerHeight, spans);
      // The active band is judged a little below the header, so an anchor jump lands on its own band.
      const probe = locate(scrollY + header + 48, spans);
      setView({ top, bottom: Math.max(bottom, top + 0.01), active: Math.min(bands.length - 1, Math.floor(probe * bands.length)) });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, []);

  return view;
}

/**
 * Sticky header: wordmark, a live locus readout, and the chromosome ideogram that doubles as
 * navigation. Each section is a cytoband (p arm: about, tools; q arm: data, news) and the
 * outlined window shows which slice of the page is on screen.
 */
export function IdeogramHeader() {
  const view = useView();
  const coord = (f: number) => formatNumber(Math.max(1, Math.round(f * chromosomeLength)));
  const arms = [bands.slice(0, 2), bands.slice(2)];

  return (
    <header id="chromosome-header" className="sticky top-0 z-30 border-b border-foreground/20 bg-background">
      <div className="flex h-12 items-center gap-3 px-4 md:px-6">
        <a href="#about" className="font-(family-name:--font-martian) text-xs font-bold tracking-tight sm:text-sm">
          {site.name}
        </a>
        <p className="ml-auto truncate font-(family-name:--font-martian) text-[10px] tabular-nums sm:text-xs" aria-live="off">
          <span className="text-muted-foreground max-sm:hidden">locus </span>
          chrPI:{coord(view.top)}-{coord(view.bottom)}
          <span className="text-muted-foreground max-sm:hidden"> / {bands[view.active].band}</span>
        </p>
        <ThemeToggle />
      </div>

      <nav aria-label="Sections" className="px-4 pb-2 md:px-6">
        <div className="relative">
          <div className="flex h-5 gap-1">
            {arms.map((arm, a) => (
              <div key={a} className="flex flex-1 overflow-hidden rounded-full border border-foreground/60">
                {arm.map((b) => {
                  const i = bands.indexOf(b);
                  return (
                    <a key={b.id} href={`#${b.id}`} aria-label={b.label} className="group flex flex-1">
                      {stains[i].map(([w, strength], j) => (
                        <span
                          key={j}
                          className="h-full transition-opacity group-hover:opacity-70"
                          style={{ flexGrow: w, background: tint(b.color, strength) }}
                        />
                      ))}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-y-1 border-2 border-foreground"
            style={{ left: `calc(${view.top * 100}% - 2px)`, width: `calc(${(view.bottom - view.top) * 100}% + 4px)` }}
          />
        </div>
        <div className="mt-1.5 flex gap-1 font-(family-name:--font-martian) text-[10px]">
          {bands.map((b, i) => (
            <a
              key={b.id}
              href={`#${b.id}`}
              className={`flex-1 truncate hover:underline ${i === view.active ? "font-bold" : "text-muted-foreground"}`}
            >
              <span className="max-sm:hidden">{b.band} </span>
              {b.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
