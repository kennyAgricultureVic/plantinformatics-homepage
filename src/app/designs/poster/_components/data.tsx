import { crops, dataReleases, formatDate, formatNumber, standards, type Crop } from "@/content";
import { Detail, Kicker, Sheet, display, ink, type Slot } from "./print";

// Field is slot 3, so crops lead with its neighbours 4 and 2, which always differ from it.
const cropSlots = [4, 2, 1] as const satisfies readonly Slot[];
const slotFor = (crop: Crop) => cropSlots[crops.indexOf(crop) % cropSlots.length];

const releases = [...dataReleases].sort((a, b) => a.released.localeCompare(b.released));
const maxAccessions = Math.max(...releases.map((r) => r.accessions));

/** Circles with area proportional to accessions, chained along one axis with a slight overprint. */
function chain(axis: "x" | "y") {
  const radii = releases.map((r) => Math.sqrt(r.accessions));
  const maxR = Math.max(...radii);
  let along = 0;
  const circles = releases.map((release, i) => {
    const r = radii[i];
    along += i === 0 ? r : (radii[i - 1] + r) * 0.86;
    const across = maxR * 2 - r; // shared baseline (bottom edge, or left edge when vertical)
    return { release, r, cx: axis === "x" ? along : maxR * 2 - across, cy: axis === "x" ? across : along, slot: slotFor(release.crop) };
  });
  const length = along + radii[radii.length - 1];
  return { circles, length, depth: maxR * 2 };
}

/**
 * Release chart drawn as flat discs. Superseded releases print as rings. Large discs carry
 * their own label; small ones are labelled beside them.
 */
function ReleaseDiscs({ axis, className }: { axis: "x" | "y"; className?: string }) {
  const { circles, length, depth } = chain(axis);
  const pad = 24;
  const labelRoom = 150;
  const width = axis === "x" ? length + pad * 2 : depth + labelRoom + pad * 2;
  const height = axis === "x" ? depth + labelRoom + pad * 2 : length + pad * 2;

  return (
    <svg
      viewBox={`${-pad} ${axis === "x" ? -labelRoom - pad : -pad} ${width} ${height}`}
      className={className}
      role="img"
      aria-label="Data releases as discs sized by accession count"
    >
      <g style={{ isolation: "isolate" }}>
        {circles.map(({ release, r, cx, cy, slot }) => (
          <circle
            key={release.doi}
            cx={cx}
            cy={cy}
            r={"superseded" in release ? r - 4 : r}
            style={
              "superseded" in release
                ? { fill: "none", stroke: ink(slot), strokeWidth: 8 }
                : { fill: ink(slot), mixBlendMode: "multiply" }
            }
          />
        ))}
      </g>
      <g className="font-(family-name:--font-poster-display) font-black uppercase">
        {circles.map(({ release, r, cx, cy, slot }) => {
          const inside = r >= 100;
          const fg = inside && !("superseded" in release) ? `var(--p${slot}-fg)` : "currentColor";
          const x = inside ? cx : axis === "x" ? cx : cx + r + 14;
          const y = inside ? cy : axis === "x" ? cy - r - 52 : cy;
          const size = inside ? r * 0.3 : 30;
          return (
            <text key={release.doi} x={x} y={y} textAnchor={inside || axis === "x" ? "middle" : "start"} style={{ fill: fg }}>
              <tspan x={x} fontSize={size}>
                {release.crop}
              </tspan>
              <tspan x={x} dy={size * 0.9} fontSize={size * 0.75}>
                {formatNumber(release.accessions)}
              </tspan>
            </text>
          );
        })}
      </g>
    </svg>
  );
}

/** Data poster: crop names stacked as the headline over a chain of discs, one per release. */
export function Data() {
  return (
    <>
      <Sheet id="data" field={3}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-full w-[12vw] max-w-72 md:w-[22vw]" style={{ background: ink(2) }} />
        </div>

        <div className="relative flex flex-1 flex-col gap-8 px-4 pt-6 sm:px-8 md:pt-10">
          <Kicker id="data" />
          <ul className={`${display} text-[clamp(3rem,min(8vw,10vh),7rem)] leading-[0.82]`}>
            {crops.map((crop, i) => (
              <li key={crop} style={{ marginLeft: `${i * 0.35}em` }} className="flex items-center gap-[0.15em]">
                <span aria-hidden className="inline-block size-[0.4em] rounded-full" style={{ background: ink(slotFor(crop)) }} />
                {crop}
              </li>
            ))}
          </ul>
          <div className="mt-auto pb-10 md:-mt-[22vh] md:ml-auto md:w-[80%] md:-rotate-[6deg] md:pb-12">
            <ReleaseDiscs axis="x" className="hidden w-full md:block" />
            <ReleaseDiscs axis="y" className="mx-auto w-full max-w-md md:hidden" />
          </div>
        </div>
      </Sheet>

      <Detail>
        <ol className="col-span-4 md:col-span-12">
          {dataReleases.map((r) => (
            <li
              key={r.doi}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-t-4 border-current py-4 md:grid-cols-[9rem_minmax(0,1fr)_13rem_8rem_10rem]"
            >
              <span className={`${display} text-3xl`}>
                {r.crop}
                {"superseded" in r && <span className="ml-2 align-middle text-sm">(superseded)</span>}
              </span>
              <span className="order-first col-span-2 flex items-center gap-3 md:order-none md:col-span-1">
                <span
                  aria-hidden
                  className="h-5 border-2 border-current"
                  style={{
                    width: `${(r.accessions / maxAccessions) * 100}%`,
                    background: "superseded" in r ? "transparent" : ink(slotFor(r.crop)),
                  }}
                />
                <span className={`${display} text-2xl tabular-nums`}>{formatNumber(r.accessions)}</span>
              </span>
              <span className="text-sm md:text-base">{r.assembly}</span>
              <time dateTime={r.released} className="text-sm md:text-base">
                {formatDate(r.released)}
              </time>
              <a href={r.doi} className="text-sm underline underline-offset-4 md:text-base">
                {r.doi.replace("https://doi.org/", "")}
              </a>
            </li>
          ))}
        </ol>

        <h3 className={`${display} col-span-4 border-t-8 border-current pt-6 text-5xl md:col-span-12 md:text-7xl`}>
          Mappings and standards
        </h3>
        {standards.map((s, i) => (
          <div key={s.name} className="col-span-4 md:col-span-3">
            <span
              aria-hidden
              className={`mb-4 block size-10 border-2 border-current ${i % 2 ? "rounded-full" : "rounded-tr-full"}`}
              style={{ background: ink(([2, 3, 4, 1] as const)[i]) }}
            />
            <p className={`${display} text-3xl`}>{s.name}</p>
            <p className="mt-2 leading-relaxed">{s.detail}</p>
          </div>
        ))}
      </Detail>
    </>
  );
}
