"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePalette } from "@/components/palette";

/** Replays the misregistration wobble whenever the palette (the set of ink drums) changes. */
export function Press({ children }: { children: ReactNode }) {
  const { combination } = usePalette();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    el.classList.remove("riso-reprint");
    void el.offsetWidth; // restart the animation
    el.classList.add("riso-reprint");
  }, [combination.id]);

  return (
    <div ref={ref} className="relative flex flex-1 flex-col">
      {children}
    </div>
  );
}

/** The inks loaded for this print run, named from the Wada combination. */
export function InkList() {
  const { combination } = usePalette();
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      {combination.colors.map((c) => (
        <li key={c.hex} className="flex items-center gap-2 text-sm">
          <span className="riso-ink size-5 riso-cut" style={{ background: c.hex }} />
          {c.name}
        </li>
      ))}
    </ul>
  );
}
