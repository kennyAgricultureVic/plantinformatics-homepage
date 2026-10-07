import type { Metadata } from "next";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { funding, site } from "@/content";
import { CoverageTrack } from "./_components/coverage-track";
import { GeneTrack } from "./_components/gene-track";
import { paletteVar, tint } from "./_components/genome";
import { IdeogramHeader } from "./_components/ideogram";
import { NewsTrack } from "./_components/news-track";
import { GutterLabel, Track, TrackRow } from "./_components/track";

export const metadata: Metadata = { title: `Genome browser | ${site.name}` };

// Read arrows in the objectives pileup sit at staggered offsets, like aligned reads.
const readOffsets = ["md:ml-0", "md:ml-[8%]", "md:ml-[16%]"];

/**
 * The homepage as a genome browser. The sticky ideogram is the navigation, each section is a
 * track on chrPI (a chromosome as long as the genotypes released), and the palette stains the tracks.
 */
export default function ChromosomeDesign() {
  return (
    <PaletteProvider design="chromosome" defaultId={257} shortlist={[257, 252, 267, 286, 312, 347, 260, 322]} className="overflow-x-clip">
      <IdeogramHeader />

      <main>
        <Track id="about" title="About" kind="summary">
          <TrackRow className="border-b border-foreground/20" label={<GutterLabel kind="feature" name="tagline" />}>
            <h1 className="max-w-5xl font-(family-name:--font-martian) text-[clamp(1.6rem,4.6vw,4rem)] leading-[1.08] font-bold tracking-tight">
              {site.tagline}
            </h1>
          </TrackRow>

          <TrackRow className="border-b border-foreground/20" label={<GutterLabel kind="feature" name="summary" />}>
            <div className="grid gap-6 lg:grid-cols-2">
              <p className="text-lg leading-relaxed">{site.summary}</p>
              <p className="border-l-4 pl-4 text-xl leading-snug font-medium" style={{ borderColor: paletteVar(0) }}>
                {site.goal}
              </p>
            </div>
          </TrackRow>

          <TrackRow className="border-b border-foreground/20" label={<GutterLabel kind="variants" name="headline stats" />}>
            <dl className="grid gap-8 sm:grid-cols-3">
              {site.stats.map((s, i) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-2 font-(family-name:--font-martian) text-[11px] text-muted-foreground">{s.label}</dt>
                  <dd className="font-(family-name:--font-martian) text-5xl font-bold tracking-tighter tabular-nums">{s.value}</dd>
                  <span
                    aria-hidden
                    className="mb-3 size-0 border-x-[9px] border-t-[12px] border-x-transparent"
                    style={{ borderTopColor: paletteVar(i) }}
                  />
                </div>
              ))}
            </dl>
          </TrackRow>

          <TrackRow label={<GutterLabel kind="alignments" name="objectives" />}>
            <ol className="grid gap-2">
              {site.objectives.map((o, i) => (
                <li
                  key={o}
                  className={`${readOffsets[i % readOffsets.length]} max-w-3xl py-3 pr-10 pl-4 text-sm leading-snug [clip-path:polygon(0_0,calc(100%-1.25rem)_0,100%_50%,calc(100%-1.25rem)_100%,0_100%)]`}
                  style={{ background: tint(paletteVar(i), 28), borderLeft: `4px solid ${paletteVar(i)}` }}
                >
                  {o}
                </li>
              ))}
            </ol>
          </TrackRow>
        </Track>

        <Track id="tools" title="Tools" kind="genes">
          <GeneTrack />
        </Track>

        <Track id="data" title="Data" kind="coverage">
          <CoverageTrack />
        </Track>

        <Track id="news" title="News" kind="features">
          <NewsTrack />
        </Track>
      </main>

      <footer>
        <TrackRow label={<GutterLabel kind="telomere" name="funding" />}>
          <p className="max-w-3xl leading-relaxed">{funding.acknowledgement}</p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-(family-name:--font-martian) text-[11px]">
            {funding.partners.map((p, i) => (
              <li key={p} className="flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-5" style={{ background: paletteVar(i) }} />
                {p}
              </li>
            ))}
          </ul>
        </TrackRow>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
