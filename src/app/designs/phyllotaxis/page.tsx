import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDate, formatNumber, funding, news, sections, site, standards, tools, totalAccessions } from "@/content";
import { HeroFlower } from "./_components/hero-flower";
import { NewsSpiral } from "./_components/news-spiral";
import { SpiralGlyph } from "./_components/spiral-glyph";
import { SunflowerCanvas } from "./_components/sunflower-canvas";
import { GOLDEN_ANGLE_DEGREES, cropTotals, slotColor } from "./_components/vogel";

export const metadata: Metadata = { title: `Phyllotaxis | ${site.name}` };

const display = "font-(family-name:--font-phyllo-display)";
const mono = "font-(family-name:--font-phyllo-mono)";

/** Fibonacci seed counts for the tool glyphs, one step further out per tool. */
const toolSeeds = [34, 55, 89, 144];
const largestCrop = cropTotals[0].count;

/** Section title with the floret count it draws, set like an equation on the right. */
function SectionTitle({ children, n }: { children: ReactNode; n: number }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-foreground pb-4">
      <h2 className={`${display} text-6xl italic leading-[0.85] tracking-tight sm:text-8xl lg:text-9xl`}>{children}</h2>
      <p className={`${mono} text-sm tabular-nums`}>n = {formatNumber(n)}</p>
    </div>
  );
}

// Phyllotaxis: every accession is a floret on Vogel's golden angle spiral. The hero shows all of them,
// the data section splits them into one flower per crop at the same spacing, tools and news reuse
// the spiral at a much larger scale.
export default function PhyllotaxisDesign() {
  return (
    <PaletteProvider
      design="phyllotaxis"
      defaultId={286}
      shortlist={[286, 247, 257, 267, 284, 299, 312, 319, 333]}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <a href="#about" className="flex shrink-0 items-center gap-2">
            <SpiralGlyph count={34} color="var(--p1)" className="size-7" />
            <span className={`${display} text-lg italic`}>{site.name}</span>
          </a>
          <nav className={`${mono} ml-auto hidden gap-5 text-xs uppercase tracking-widest sm:flex`}>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="opacity-60 hover:opacity-100">
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 [&>section]:scroll-mt-20">
        <section id="about" className="pt-10 pb-24 sm:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div>
              <p className={`${display} text-[clamp(4.5rem,15vw,11rem)] leading-[0.8] tracking-tighter`}>
                {formatNumber(totalAccessions)}
              </p>
              <p className={`${mono} mt-4 text-xs tracking-widest`}>
                florets, one per genotyped accession ·{" "}
                <span className="whitespace-nowrap">θ = n × {GOLDEN_ANGLE_DEGREES.toFixed(3)}°</span>
              </p>
              <h1 className={`${display} mt-10 text-3xl leading-tight sm:text-5xl`}>{site.tagline}</h1>
            </div>
            <HeroFlower />
          </div>

          <div className="mt-20 grid gap-12 border-t border-foreground pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="space-y-6 text-lg leading-relaxed">
              <p>{site.summary}</p>
              <p className={`${display} text-2xl italic`}>{site.goal}</p>
            </div>
            <div>
              <dl className="grid">
                {site.stats.map((s, i) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-foreground/15 py-3">
                    <dt className={`${mono} flex items-center gap-3 text-xs`}>
                      <span className="size-2.5 shrink-0 rounded-full" style={{ background: slotColor(i) }} />
                      {s.label}
                    </dt>
                    <dd className={`${display} text-5xl tabular-nums sm:text-6xl`}>{s.value}</dd>
                  </div>
                ))}
              </dl>
              <ol className="mt-12 grid gap-4">
                {site.objectives.map((o, i) => (
                  <li key={o} className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-t border-foreground/15 pt-4">
                    <span className={`${mono} text-sm`}>{["1", "2", "3", "5", "8"][i]}</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="tools" className="pb-24">
          <SectionTitle n={tools.length}>Tools</SectionTitle>
          <div className="grid">
            {tools.map((tool, i) => (
              <article
                key={tool.slug}
                className="grid gap-8 border-b border-foreground/15 py-12 md:grid-cols-[8rem_minmax(0,1fr)] lg:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)]"
              >
                <div className="flex items-start gap-4 md:flex-col">
                  <SpiralGlyph count={toolSeeds[i]} color={slotColor(i)} className="size-20 md:size-32 lg:size-40" />
                  <p className={`${mono} text-xs tabular-nums opacity-60`}>{toolSeeds[i]} florets</p>
                </div>
                <div>
                  <h3 className={`${display} text-5xl tracking-tight sm:text-6xl`}>{tool.name}</h3>
                  <p className={`${display} mt-3 text-xl italic`}>{tool.summary}</p>
                  <p className="mt-4 leading-relaxed opacity-80">{tool.description}</p>
                  <ul className="mt-6 grid gap-2 text-sm">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: slotColor(i) }} />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.url}
                    className={`${mono} mt-6 inline-flex items-center gap-1 text-sm uppercase tracking-widest underline-offset-4 hover:underline`}
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </div>
                <div className="md:col-start-2 lg:col-start-auto">
                  {"image" in tool ? (
                    <Image
                      src={tool.image}
                      alt={`${tool.name} screenshot`}
                      width={1421}
                      height={876}
                      className="border border-foreground/15"
                    />
                  ) : (
                    <ImagePlaceholder label={tool.name} className="border-foreground/30" />
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="data" className="pb-24">
          <SectionTitle n={totalAccessions}>Data</SectionTitle>
          <div className="grid">
            {cropTotals.map((t) => (
              <article
                key={t.crop}
                className="grid items-center gap-8 border-b border-foreground/15 py-12 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
              >
                <div className="mx-auto w-full max-w-xs md:max-w-md">
                  <div className="mx-auto" style={{ width: `${Math.sqrt(t.count / largestCrop) * 100}%` }}>
                    <SunflowerCanvas
                      groups={[{ count: t.count, slot: t.slot, label: t.crop }]}
                      label={`${t.crop}: ${formatNumber(t.count)} florets`}
                      dot={0.85}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6">
                    <h3 className={`${display} flex items-center gap-3 text-5xl italic`}>
                      <span className="size-4 rounded-full" style={{ background: slotColor(t.slot) }} />
                      {t.crop}
                    </h3>
                    <p className={`${mono} text-2xl tabular-nums`}>{formatNumber(t.count)}</p>
                  </div>
                  <ul className="mt-6 grid gap-4">
                    {t.releases.map((r) => (
                      <li
                        key={r.doi}
                        className={`${mono} grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-t border-foreground/15 pt-3 text-xs`}
                      >
                        <span className="tabular-nums">
                          {formatNumber(r.accessions)} accessions · {formatDate(r.released)}
                        </span>
                        <a href={r.doi} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                          {r.doi.replace("https://doi.org/", "")}
                          <ArrowUpRightIcon className="size-3" />
                        </a>
                        <span className="col-span-2 opacity-60">
                          {r.assembly}
                          {"superseded" in r && " · superseded by a later release"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <h3 className={`${display} mt-20 text-4xl italic`}>Mappings and standards</h3>
          <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name} className="border-t border-foreground pt-4">
                <dt className={`${display} text-2xl`}>{s.name}</dt>
                <dd className="mt-2 text-sm leading-relaxed opacity-80">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news" className="pb-24">
          <SectionTitle n={news.length}>News</SectionTitle>
          <div className="mt-12">
            <NewsSpiral />
          </div>
        </section>

        <aside aria-labelledby="maths-title" className="grid gap-10 border-t border-foreground py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <div>
            <h2 id="maths-title" className={`${mono} text-xs uppercase tracking-widest`}>
              Footnote on the maths
            </h2>
            <p className={`${display} mt-6 text-4xl italic leading-snug sm:text-5xl`}>
              r = c√n
              <br />θ = n × {GOLDEN_ANGLE_DEGREES.toFixed(3)}°
            </p>
          </div>
          <div className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
            <p>
              Vogel&apos;s 1979 model places floret n at distance c√n from the centre, turned n golden angles round. Because
              the area inside radius r grows with r², every floret claims the same area, so a ring of florets is exactly
              as large as the count it stands for.
            </p>
            <p>
              The golden angle is 360° / φ², where φ = (1 + √5) / 2. Being the most irrational turn there is, it never
              lines florets up into straight spokes, and the eye instead finds spiral arms in Fibonacci counts: 21, 34, 55,
              89, 144.
            </p>
            <p>
              Floret n points in the direction set by the fractional part of n·φ, which spreads evenly round the circle.
              Colouring by that fraction is what turns the Sectors view into an honest pie chart.
            </p>
            <p>
              The flowers in the data section share one spacing c, so their areas compare directly: one floret, one
              accession, in every drawing on this page.
            </p>
          </div>
        </aside>
      </main>

      <footer className="bg-foreground text-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <p className={`${display} text-2xl leading-snug`}>{funding.acknowledgement}</p>
          <ul className={`${mono} grid content-start gap-2 text-xs uppercase tracking-widest`}>
            {funding.partners.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <span className="size-2.5 rounded-full" style={{ background: slotColor(i) }} />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
