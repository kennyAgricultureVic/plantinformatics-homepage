import { slotColor, slotDeep, slotTint, type HeadNode } from "./seed-head";

/** Px per seed radius, shared by every crop in the key so their areas compare directly. */
const UNIT = 4.6;

/** One crop zone from the hero head, redrawn on its own at a fixed scale. */
export function CropKey({ crop }: { crop: HeadNode }) {
  if (crop.data.kind !== "crop") return null;
  const { slot } = crop.data;
  const size = crop.r * 2 * UNIT;
  return (
    <svg
      viewBox={`${crop.x - crop.r - 0.5} ${crop.y - crop.r - 0.5} ${crop.r * 2 + 1} ${crop.r * 2 + 1}`}
      width={size}
      height={size}
      className="block max-w-full shrink-0"
      aria-hidden
    >
      <circle cx={crop.x} cy={crop.y} r={crop.r} fill={slotTint(slot)} stroke={slotColor(slot)} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      {crop.children?.map((release, r) => (
        <g key={r}>
          <circle
            cx={release.x}
            cy={release.y}
            r={release.r}
            fill="none"
            stroke="var(--foreground)"
            strokeOpacity={0.35}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
          {release.children?.map((seed, s) => (
            <circle
              key={s}
              cx={seed.x}
              cy={seed.y}
              r={seed.r}
              fill={seed.data.kind === "seed" && seed.data.carriedFrom ? slotDeep(slot) : slotColor(slot)}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
