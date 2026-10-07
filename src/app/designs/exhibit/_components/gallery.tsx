"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

// Must match the media query in exhibit.css that turns the wall sideways.
const WIDE = "(min-width: 768px) and (min-height: 600px)";

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True when an element between `start` and `track` can still scroll vertically in direction `dy`. */
function innerScrolls(start: Element | null, track: HTMLElement, dy: number) {
  for (let el = start; el && el !== track; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1) {
      if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
    }
  }
  return false;
}

/**
 * The gallery visit. On wide screens the rooms sit side by side on one long wall that scrolls
 * sideways: the vertical wheel, arrow keys, Page Up/Down, Space, Home and End all walk along it,
 * and the header's arrows step from one stop to the next. At either end of the wall the page
 * scrolls normally, so the palette picker below stays reachable. Narrow screens get a vertical walk.
 */
export function Gallery({ header, children }: { header: ReactNode; children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const wide = matchMedia(WIDE);

    const atEnd = (dx: number) =>
      dx > 0 ? track.scrollLeft + track.clientWidth >= track.scrollWidth - 1 : track.scrollLeft <= 0;

    const onWheel = (e: WheelEvent) => {
      if (!wide.matches || e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? track.clientWidth : 1);
      // The page itself is scrolled (looking at the picker), a room scrolls, or the wall ends: let it be.
      if (window.scrollY > 2 || innerScrolls(e.target as Element, track, dy) || atEnd(dy)) return;
      e.preventDefault();
      track.scrollBy({ left: dy, behavior: "instant" });
    };

    const onKey = (e: KeyboardEvent) => {
      if (!wide.matches || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target !== document.body && !track.contains(target)) return;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      const page = track.clientWidth * 0.8;
      let dx: number;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          dx = 160;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          dx = -160;
          break;
        case "PageDown":
          dx = page;
          break;
        case "PageUp":
          dx = -page;
          break;
        case " ":
          if (target.closest("button, a, summary")) return;
          dx = e.shiftKey ? -page : page;
          break;
        case "Home":
          dx = -track.scrollLeft;
          break;
        case "End":
          dx = track.scrollWidth;
          break;
        default:
          return;
      }
      if (e.shiftKey && e.key !== " ") return;
      if (window.scrollY > 2 || atEnd(dx)) return;
      e.preventDefault();
      track.scrollBy({ left: dx, behavior: reducedMotion() ? "instant" : "smooth" });
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      track.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const here = track.scrollLeft;
    const origin = track.getBoundingClientRect().left;
    const stops = [...track.querySelectorAll<HTMLElement>("[data-stop]")]
      .map((el) => Math.round(el.getBoundingClientRect().left - origin + here))
      .sort((a, b) => a - b);
    const next = dir > 0 ? stops.find((x) => x > here + 8) : stops.findLast((x) => x < here - 8);
    track.scrollTo({ left: next ?? (dir > 0 ? track.scrollWidth : 0), behavior: reducedMotion() ? "instant" : "smooth" });
  };

  return (
    <div className="exhibit-visit">
      <header className="sticky top-0 z-20 border-b bg-background text-foreground">
        <div className="flex h-14 items-center gap-4 px-4 sm:gap-6 sm:px-6">
          {header}
          <div className="exhibit-wide-only items-center gap-1">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous stop"
              className="grid size-9 place-items-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next stop"
              className="grid size-9 place-items-center hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>
        </div>
      </header>
      <div ref={trackRef} tabIndex={0} aria-label="Gallery wall" role="region" className="exhibit-track">
        {children}
      </div>
    </div>
  );
}
