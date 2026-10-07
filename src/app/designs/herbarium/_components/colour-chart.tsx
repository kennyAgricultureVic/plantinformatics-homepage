"use client";

import { usePalette } from "@/components/palette";
import { cn } from "@/lib/utils";

/**
 * Colour calibration strip, as photographed beside every scanned herbarium sheet.
 * Its patches are the live palette, so it doubles as a legend for the picker.
 */
export function ColourChart({ className }: { className?: string }) {
  const { combination, colors } = usePalette();
  const names = combination.colors.map((c) => c.name);

  return (
    <figure className={cn("font-(family-name:--hb-type) text-[10px]", className)}>
      <div className="flex border border-current/40">
        {colors.map((hex, i) => (
          <span key={i} title={names[i % names.length]} className="h-6 flex-1" style={{ background: hex }} />
        ))}
        <span className="h-6 flex-1 bg-white" />
        <span className="h-6 flex-1 bg-black" />
      </div>
      <figcaption className="mt-1 flex justify-between gap-2 uppercase tracking-widest opacity-70">
        <span>Wada {combination.id}</span>
        <span className="truncate normal-case tracking-normal">{names.join(" / ")}</span>
      </figcaption>
    </figure>
  );
}
