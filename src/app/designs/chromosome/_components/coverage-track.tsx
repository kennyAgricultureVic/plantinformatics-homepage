import { crops, dataReleases, formatDate, formatNumber, standards } from "@/content";
import { paletteVar, seeded, tint } from "./genome";
import { GutterLabel, linearMarks, Ruler, TrackRow } from "./track";

const scaleMax = Math.ceil(Math.max(...dataReleases.map((r) => r.accessions)) / 5000) * 5000;

/**
 * Area path for a bigWig-style coverage signal in a 1000 x 40 box. The signal runs from 0 to the
 * release's accession count on the shared scale; its jagged height is seeded noise, purely texture.
 */
function coveragePath(accessions: number, seed: number) {
  const rand = seeded(seed);
  const end = (accessions / scaleMax) * 1000;
  const steps = Math.max(8, Math.round(end / 6));
  let level = 0.6;
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    level = Math.min(0.98, Math.max(0.25, level + (rand() - 0.5) * 0.28));
    return `L${((i / steps) * end).toFixed(1)},${(40 - level * 40).toFixed(1)}`;
  });
  return `M0,40 ${points.join(" ")} L${end.toFixed(1)},40 Z`;
}

/**
 * Data releases as stacked coverage tracks on one shared accession scale, then the mappings
 * and standards as a BED-style annotation track.
 */
export function CoverageTrack() {
  return (
    <>
      <TrackRow
        className="border-b border-foreground/20"
        label={<GutterLabel kind="scale" name="Accessions per release" />}
      >
        <Ruler marks={linearMarks(0, scaleMax, 7)} />
      </TrackRow>

      {dataReleases.map((r, i) => {
        const color = paletteVar(crops.indexOf(r.crop));
        const superseded = "superseded" in r;
        return (
          <TrackRow
            key={r.doi}
            className="border-b border-foreground/20"
            label={
              <GutterLabel kind={`bigWig / ${formatDate(r.released)}`} name={r.crop}>
                <p className="text-muted-foreground">{r.assembly}</p>
              </GutterLabel>
            }
          >
            <a href={r.doi} className="group block" aria-label={`${r.crop} release, ${formatNumber(r.accessions)} accessions, DOI`}>
              <svg viewBox="0 0 1000 40" preserveAspectRatio="none" className="block h-14 w-full" aria-hidden>
                <path
                  d={coveragePath(r.accessions, i * 131 + r.accessions)}
                  fill={superseded ? tint(color, 30) : color}
                  className="transition-opacity group-hover:opacity-80"
                />
                <line x1="0" x2="1000" y1="39.5" y2="39.5" stroke="currentColor" strokeOpacity="0.4" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1 font-(family-name:--font-martian) text-[11px]">
                <span className="text-base font-bold tabular-nums">{formatNumber(r.accessions)}</span>
                {superseded && <span className="text-muted-foreground">superseded by a later {r.crop.toLowerCase()} release</span>}
                <span className="break-all text-muted-foreground underline-offset-4 group-hover:text-foreground group-hover:underline">
                  {r.doi.replace("https://doi.org/", "doi:")}
                </span>
              </div>
            </a>
          </TrackRow>
        );
      })}

      <TrackRow label={<GutterLabel kind="bigBed / annotations" name="Mappings and standards" />}>
        <ul className="grid gap-7">
          {standards.map((s, i) => {
            const color = paletteVar(i);
            const rand = seeded(i * 53 + 7);
            const left = rand() * 30;
            return (
              <li key={s.name}>
                <div className="relative h-3" aria-hidden>
                  <span className="absolute inset-x-0 top-1/2 h-px bg-foreground/30" />
                  <span className="absolute inset-y-0" style={{ left: `${left}%`, width: `${35 + rand() * (60 - left)}%`, background: color }} />
                  <span className="absolute top-1/2 h-1 -translate-y-1/2" style={{ left: `${left * 0.5}%`, width: `${left * 0.5}%`, background: tint(color, 55) }} />
                </div>
                <h3 className="mt-3 font-(family-name:--font-martian) text-sm font-bold">{s.name}</h3>
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">{s.detail}</p>
              </li>
            );
          })}
        </ul>
      </TrackRow>
    </>
  );
}
