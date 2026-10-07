import { TAU, annulus } from "./geometry";

/**
 * Small ring glyph with an arc swept to `value` (0 to 1), the plot's motif at text size.
 * Colour comes from `color` (a CSS colour, usually a palette var) or the current text colour.
 */
export function Gauge({ value, color, className }: { value: number; color?: string; className?: string }) {
  const sweep = Math.min(Math.max(value, 0.02), 0.999) * TAU;
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden>
      <circle r={40} fill="none" strokeWidth={4} className="stroke-foreground/15" />
      <path d={annulus(32, 48, 0, sweep)} style={{ fill: color ?? "currentColor" }} />
    </svg>
  );
}
