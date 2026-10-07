import { formatNumber } from "@/content";
import { DitherDefs, Sky, Sprite } from "./sprite";
import { cloud, cropFill, cropSprites, harvest, moon, sun } from "./sprites";

const W = 200;
const H = 116;
const horizon = 44;
const rowH = 14;
const plantsX = 50;
const spacing = 6;
const maxPlants = 19;
const max = Math.max(...harvest.map((h) => h.accessions));
const stars = [[12, 4], [30, 14], [47, 7], [70, 3], [88, 18], [104, 9], [131, 5], [149, 16], [166, 8], [183, 13], [194, 4], [60, 24]] as const;

const rows = harvest.map((h, row) => ({
  crop: h.crop,
  base: horizon + 4 + row * rowH + 10,
  n: Math.max(1, Math.round((h.accessions / max) * maxPlants)),
  count: formatNumber(h.accessions),
}));

// Rough Pixelify Sans advance at 6 units: enough to size the label plates.
const textWidth = (s: string) => s.length * 3.4 + 4;

/**
 * Hero: a pixel field with one crop row per crop, each row as long as its accession count.
 * Sun by day, moon and stars by night, both driven by the theme class.
 */
export function HeroField() {
  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`px-crisp block h-auto w-full`}
        role="img"
        aria-label={`Crop field: ${harvest.map((h) => `${h.crop} ${formatNumber(h.accessions)} accessions`).join(", ")}`}
      >
        <DitherDefs prefix="hero" />
        <Sky prefix="hero" width={W} height={horizon} stars={stars} twinkleClassName="px-twinkle" />
        <Sprite rows={sun} x={170} y={6} className="dark:hidden" />
        <Sprite rows={cloud} x={24} y={10} className="dark:hidden" />
        <Sprite rows={cloud} x={112} y={18} className="dark:hidden" />
        <Sprite rows={moon} x={172} y={6} className="hidden dark:inline" />

        {/* Distant hills, stepped. */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const h = [3, 5, 6, 5, 3, 4, 7, 8, 6, 4][i];
          return <rect key={i} x={i * 20} y={horizon - h} width={20} height={h} className="fill-black" />;
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const h = [2, 4, 5, 4, 2, 3, 6, 7, 5, 3][i];
          return <rect key={i} x={i * 20 + 1} y={horizon - h + 1} width={18} height={h} fill="url(#hero-p3-50)" />;
        })}

        <rect y={horizon} width={W} height={H - horizon} className="fill-(--p3)" />

        {rows.map(({ crop, base, n }, row) => (
          <g key={crop}>
            <rect y={base - 1} width={W} height={3} fill="url(#hero-k-50)" />
            {Array.from({ length: n }, (_, i) => (
              // The animation sets a CSS transform, so it goes on a wrapper, not the translated sprite.
              <g key={i} className="px-grow" style={{ animationDelay: `${row * 0.15 + i * 0.05}s` }}>
                <Sprite rows={cropSprites[crop]} x={plantsX + i * spacing} y={base - 8} colors={{ a: cropFill(crop), s: "fill-black" }} />
              </g>
            ))}
          </g>
        ))}

        {/* Night: a 50% black dither over the land; the label plates sit above it. */}
        <rect y={horizon - 8} width={W} height={H - horizon + 8} fill="url(#hero-k-50)" className="hidden dark:inline" />

        {rows.map(({ crop, base, n, count }) => {
          const countX = plantsX + n * spacing + 2;
          return (
            <g key={crop} className="font-(family-name:--font-pixel-display)">
              <rect x={2} y={base - 9} width={44} height={9} className="fill-black" />
              <text x={5} y={base - 2.5} className="fill-white" fontSize={6}>
                {crop}
              </text>
              <rect x={countX} y={base - 9} width={textWidth(count)} height={9} className="fill-white" />
              <text x={countX + 2} y={base - 2.5} className="fill-black font-sans font-semibold" fontSize={5.5}>
                {count}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
