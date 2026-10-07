import { vogel } from "./vogel";

type SpiralGlyphProps = { count: number; color: string; className?: string };

/**
 * Small SVG sunflower of `count` florets, the spiral zoomed right in so each seed is visible.
 * Florets swell towards the rim like a real seed head.
 */
export function SpiralGlyph({ count, color, className }: SpiralGlyphProps) {
  const c = 0.92 / Math.sqrt(count);
  const florets = Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return { n, ...vogel(n, c), r: c * (0.3 + 0.32 * Math.sqrt(n / count)) };
  });

  return (
    <svg viewBox="-1 -1 2 2" className={className} aria-hidden>
      {florets.map((f) => (
        <circle key={f.n} cx={f.x} cy={f.y} r={f.r} fill={color} />
      ))}
    </svg>
  );
}
