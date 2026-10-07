import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { crops, dataReleases, formatNumber, funding, news, sections, site, standards, tools, totalAccessions } from "@/content";
import { CIRCLE, fmt, heroParams, seedParams, slotColor, toolShapes, type Params } from "./_components/gielis";
import { HeroShape } from "./_components/hero-shape";
import { NewsRow } from "./_components/news-row";
import { SeedAtlas } from "./_components/seed-atlas";
import { N, ParamTable, Shape } from "./_components/shape";

export const metadata: Metadata = { title: `Superformula | ${site.name}` };

/** The superformula set as a line of type. */
function Formula({ className }: { className?: string }) {
  return (
    <p className={className} aria-label="r of phi equals the sum of the absolute cosine of m phi over four, divided by a, to the n2, and the absolute sine of m phi over four, divided by b, to the n3, all to the power minus one over n1">
      <span className="whitespace-nowrap">r(φ) = (</span>{" "}
      <span className="whitespace-nowrap">
        |cos(mφ/4) / a|
        <sup>
          <N i={2} />
        </sup>
      </span>{" "}
      +{" "}
      <span className="whitespace-nowrap">
        |sin(mφ/4) / b|
        <sup>
          <N i={3} />
        </sup>{" "}
        )
        <sup>
          −1/
          <N i={1} />
        </sup>
      </span>
    </p>
  );
}

/** Section heading with the count the drawing below is built from, set like a parameter. */
function SectionTitle({ children, value, note }: { children: ReactNode; value: string; note: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b-2 border-foreground pb-4">
      <h2 className="text-6xl leading-[0.85] font-black tracking-tight sm:text-8xl">{children}</h2>
      <p className="text-right text-sm">
        <span className="text-2xl font-bold">{value}</span>
        <span className="ml-2 opacity-70">{note}</span>
      </p>
    </div>
  );
}

/** Small polygon-ish bullets: m = 3, 4, 5... one more lobe per line. */
const bullet = (i: number): Params => ({ m: i + 3, n1: 1.2, n2: 1.6, n3: 1.6 });

const statShapes: Params[] = [
  { m: dataReleases.filter((r) => !("superseded" in r)).length, ...CIRCLE, n1: 0.9 },
  { ...heroParams },
  { m: tools.length, n1: 1, n2: 1.6, n3: 1.6 },
];

// Gielis' superformula draws the whole page. One six-parameter rule makes the hero flower from the
// content, gives each tool its own shape, draws every data release as a seed outline whose area is
// its accessions, and steps news from a circle to the flower, one item at a time.
export default function SuperformulaDesign() {
  return (
    <PaletteProvider
      design="superformula"
      defaultId={274}
      shortlist={[274, 282, 257, 299, 315, 260, 322, 347, 252]}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <a href="#about" className="flex shrink-0 items-center gap-2">
            <Shape params={heroParams} fill="var(--p1)" stroke="currentColor" className="size-7" />
            <span className="text-lg font-bold tracking-tight">{site.name}</span>
          </a>
          <nav className="ml-auto hidden gap-6 text-sm font-medium sm:flex">
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
        <section id="about" className="pt-10 pb-24 sm:pt-14">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
            <div>
              <p className="text-sm font-semibold">The superformula, Gielis 2003</p>
              <Formula className="mt-3 text-2xl leading-snug font-bold tracking-tight sm:text-3xl [&_sup]:text-[0.6em]" />
              <h1 className="mt-10 text-5xl leading-[0.95] font-black tracking-tight sm:text-6xl">{site.tagline}</h1>
              <p className="mt-8 max-w-lg text-base leading-relaxed opacity-80">
                Six numbers draw every shape on this page. The flower starts as the circle the formula always passes
                through and grows into the shape our content gives it: one petal for each of the {crops.length} crops we
                have released.
              </p>
            </div>
            <HeroShape />
          </div>

          <div className="mt-24 grid gap-12 border-t-2 border-foreground pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="space-y-6 text-lg leading-relaxed">
              <p>{site.summary}</p>
              <p className="text-2xl leading-snug font-bold">{site.goal}</p>
            </div>
            <div>
              <dl className="grid gap-px sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
                {site.stats.map((s, i) => (
                  <div key={s.label} className="flex flex-col border-t border-foreground/20 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                    <Shape stroke="currentColor" params={statShapes[i]} fill={slotColor(i)} className="size-12" />
                    <dt className="order-last mt-1 text-sm opacity-70">{s.label}</dt>
                    <dd className="mt-4 text-5xl font-black tracking-tight sm:text-5xl xl:text-6xl">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-14 grid gap-4">
                {site.objectives.map((o, i) => (
                  <li key={o} className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 border-t border-foreground/20 pt-4">
                    <Shape stroke="currentColor" params={bullet(i)} fill={slotColor(i + 1)} className="mt-0.5 size-5" />
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="tools" className="pb-24">
          <SectionTitle value={String(tools.length)} note="shapes, one per tool">
            Tools
          </SectionTitle>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed opacity-70">
            Each tool has its own parameter set. m is the number of things it does, so its shape has one lobe per
            capability; <N i={1} />, <N i={2} /> and <N i={3} /> are drawn from a seed of the tool&apos;s name, so the same tool always grows the same
            shape.
          </p>
          <div className="mt-6 grid gap-x-12 lg:grid-cols-2">
            {toolShapes.map(({ tool, slot, params }) => (
              <article key={tool.slug} className="border-b border-foreground/20 py-12">
                <div className="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-6 sm:grid-cols-[11rem_minmax(0,1fr)]">
                  <Shape params={params} fill={slotColor(slot)} stroke="currentColor" label={`${tool.name} shape`} className="w-full" />
                  <ParamTable params={params} notes={{ m: "capabilities", n1: "from the name" }} />
                </div>
                <h3 className="mt-8 text-5xl font-black tracking-tight">{tool.name}</h3>
                <p className="mt-3 text-xl leading-snug font-semibold">{tool.summary}</p>
                <p className="mt-4 leading-relaxed opacity-80">{tool.description}</p>
                <ul className="mt-6 grid gap-2 text-sm">
                  {tool.capabilities.map((c) => (
                    <li key={c} className="flex gap-3">
                      <Shape stroke="currentColor" params={params} fill={slotColor(slot)} className="mt-0.5 size-3.5 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
                <a
                  href={tool.url}
                  className="mt-6 inline-flex items-center gap-1 border-b-2 border-foreground pb-0.5 text-sm font-semibold hover:border-(--p1)"
                >
                  Open {tool.name} <ArrowUpRightIcon className="size-4" />
                </a>
                <div className="mt-8">
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
          <SectionTitle value={formatNumber(totalAccessions)} note="accessions, as area">
            Data
          </SectionTitle>
          <div className="mt-6 mb-12 grid gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
            <p className="max-w-2xl text-sm leading-relaxed opacity-70">
              Every genotype release is drawn as a seed outline: a long grain for wheat, a pointed one for barley, a
              beaked chickpea, a round pea and a flattened lentil. Outline area is proportional to accessions, so the
              plate is a chart of the genebank&apos;s releases laid over each other.
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm">
              {crops.map((c, i) => (
                <li key={c} className="flex items-center gap-2">
                  <Shape stroke="currentColor" params={seedParams[c]} fill={slotColor(i)} className="size-5" />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <SeedAtlas />

          <h3 className="mt-24 text-4xl font-black tracking-tight">Mappings and standards</h3>
          <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name} className="border-t-2 border-foreground pt-4">
                <dt className="text-xl font-bold">{s.name}</dt>
                <dd className="mt-2 text-sm leading-relaxed opacity-80">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news" className="pb-24">
          <SectionTitle value={String(news.length)} note="steps from circle to flower">
            News
          </SectionTitle>
          <div className="mt-12">
            <NewsRow />
          </div>
        </section>

        <aside aria-labelledby="rule-title" className="grid gap-10 border-t-2 border-foreground py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 id="rule-title" className="text-4xl font-black tracking-tight">
              How the page is drawn
            </h2>
            <Formula className="mt-6 text-xl leading-snug font-bold [&_sup]:text-[0.6em]" />
          </div>
          <div className="grid gap-6 text-sm leading-relaxed sm:grid-cols-2">
            <p>
              Johan Gielis published the superformula in 2003 as a single equation for leaves, petals, stems and shells.
              m sets the symmetry, the number of lobes in a turn. a and b stretch the shape along its two axes, and the
              exponents <N i={1} />, <N i={2} /> and <N i={3} /> decide whether the lobes are fat or thin, round or pointed, straight or twisted.
            </p>
            <p>
              With a = b = 1 and all three exponents at 2, the bracket is cos² + sin², which is always 1, so the formula
              draws a circle whatever m is. That is where the hero and the news row both start.
            </p>
            <p>
              The hero flower takes m = {heroParams.m} from the crops released, <N i={1} /> = {fmt(heroParams.n1)} from {news.length}{" "}
              news items divided by ten, <N i={2} /> = {heroParams.n2} from the current releases and <N i={3} /> = {heroParams.n3} from every
              release including superseded ones. The gap between <N i={2} /> and <N i={3} /> twists the petals.
            </p>
            <p>
              Seed outlines in the data plate are each scaled so that ½∫r²dφ, the area inside the curve, is proportional to
              the release&apos;s accessions. Nothing is random except the tool shapes, which use a seed of the tool&apos;s
              name, so the same content always grows the same page.
            </p>
          </div>
        </aside>
      </main>

      <footer className="bg-foreground text-background dark:border-t-2 dark:border-foreground dark:bg-background dark:text-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <p className="text-2xl leading-snug font-bold">{funding.acknowledgement}</p>
          <ul className="grid content-start gap-3 text-sm">
            {funding.partners.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <Shape stroke="currentColor" params={bullet(i)} fill={slotColor(i)} className="size-5 shrink-0" />
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
