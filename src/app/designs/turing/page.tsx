import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  crops,
  dataReleases,
  formatDate,
  formatNumber,
  funding,
  news,
  sections,
  site,
  standards,
  tools,
  totalAccessions,
  type Crop,
} from "@/content";
import { BARREN, regimes, type Regime, type RegimeKey } from "./_components/gray-scott";
import { PatternCanvas, type Stop } from "./_components/pattern-canvas";
import {
  ACCESSIONS_PER_CELL,
  CELLS_PER_ACCESSION,
  bandPlate,
  heroDiscs,
  heroPlate,
  heroRegimes,
  newsPlate,
  newsX,
  releasePlate,
  toolPlate,
  toolRegime,
} from "./_components/plates";

export const metadata: Metadata = { title: `Turing | ${site.name}` };

const display = "font-(family-name:--font-turing-display)";

/** Five crops on a four colour palette: the fifth takes the page ink. */
const cropStop = (crop: Crop): Stop => (["p1", "p2", "p3", "p4", "ink"] as const)[crops.indexOf(crop)] ?? "ink";
const cropColor = (crop: Crop) => {
  const i = crops.indexOf(crop);
  return i < 4 ? `var(--p${i + 1})` : "var(--foreground)";
};

/** 1 January of each year inside the news timeline, as fractions across it. */
const yearTicks = [...new Set(news.map((n) => n.date.slice(0, 4)))]
  .map((year) => ({ year, x: newsX(`${year}-01-01`) }))
  .filter((t) => t.x >= 0 && t.x <= 1);

/** The face has no ∇, so set it in the body sans rather than a heavy fallback. */
const Nabla = () => <span className="font-serif font-normal">∇</span>;

const fk = (r: Regime) => `F = ${r.F} · k = ${r.k}`;

/** Regime label, set like a parameter line. */
function Params({ regime, className }: { regime: Regime; className?: string }) {
  return (
    <p className={`text-sm tabular-nums ${className ?? ""}`}>
      <span className="font-semibold">{regime.name}</span>
      <span className="opacity-60"> · {fk(regime)}</span>
    </p>
  );
}

/** Each section opens on a band of its own regime, so the pattern changes down the page. */
function SectionHead({ regime, title, note }: { regime: RegimeKey; title: ReactNode; note: ReactNode }) {
  return (
    <div className="mb-12">
      <PatternCanvas plate={bandPlate(regime)} stops={["ground", "c2", "c0"]} label={`${regimes[regime].name} pattern band`} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
        <h2 className={`${display} text-7xl leading-[0.8] font-black tracking-tight sm:text-9xl`}>{title}</h2>
        <div className="max-w-sm pb-2">
          <Params regime={regimes[regime]} />
          <p className="mt-1 text-sm opacity-70">{note}</p>
        </div>
      </div>
    </div>
  );
}

// Reaction-diffusion: one Gray-Scott rule grows every picture on the page. The data decides where
// the feed is high enough for pattern to form, and each section picks its own (F, k) regime.
export default function TuringDesign() {
  return (
    <PaletteProvider
      design="turing"
      defaultId={263}
      shortlist={[263, 323, 310, 255, 303, 271, 325, 344, 295]}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <a href="#about" className={`${display} text-2xl leading-none font-black tracking-tight`}>
            {site.name}
          </a>
          <nav className="ml-auto hidden gap-6 text-sm sm:flex">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="opacity-70 hover:opacity-100">
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
          <h1 className={`${display} max-w-5xl text-5xl leading-[0.85] font-black tracking-tight sm:text-7xl lg:text-8xl`}>
            {site.tagline}
          </h1>

          <figure className="mt-10">
            <div className="relative">
              <PatternCanvas
                plate={heroPlate}
                stops={["ground", "c3", "c2", "c1", "c0"]}
                scale={3}
                label={`Reaction-diffusion pattern grown in one disc per current data release, ${formatNumber(totalAccessions)} accessions in all`}
              />
              <ul aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
                {heroDiscs.map(({ release, x, y }) => (
                  <li
                    key={release.doi}
                    className="absolute -translate-x-1/2 -translate-y-1/2 bg-background/85 px-1.5 py-0.5 text-center leading-tight"
                    style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                  >
                    <span className={`${display} block text-xl font-black`}>{release.crop}</span>
                    <span className="block text-xs tabular-nums">{formatNumber(release.accessions)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <figcaption className="mt-6 grid gap-8 border-t border-foreground pt-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div>
                <p className={`${display} text-3xl leading-tight font-semibold sm:text-4xl`}>
                  ∂u/∂t = D<sub>u</sub><Nabla />²u − uv² + F(1 − u)
                  <br />
                  ∂v/∂t = D<sub>v</sub><Nabla />²v + uv² − (F + k)v
                </p>
                <div className="mt-4 grid gap-1">
                  <Params regime={heroRegimes.current} />
                  <Params regime={heroRegimes.superseded} />
                  <Params regime={BARREN} />
                </div>
              </div>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  Each disc is a current data release, with one grid cell of area for every{" "}
                  {formatNumber(Math.round(1 / CELLS_PER_ACCESSION))} accessions. Inside a disc the feed rate is high enough
                  for coral to grow; inside the inner disc, the accessions an earlier release already covered, the pair is
                  tuned for spots. Everywhere else the feed is too low and the activator dies back.
                </p>
                <p className="opacity-70">
                  {heroPlate.steps.toLocaleString("en-AU")} steps on a {heroPlate.w} × {heroPlate.h} grid, D<sub>u</sub> = 0.5,
                  D<sub>v</sub> = 0.25, then frozen. Colour is the substrate used up, 1 − u, from the ground through the
                  four palette colours.
                </p>
              </div>
            </figcaption>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:hidden">
              {heroDiscs.map(({ release }) => (
                <li key={release.doi} className="flex items-baseline justify-between gap-2 border-t border-foreground/15 pt-2">
                  <span className="font-semibold">{release.crop}</span>
                  <span className="tabular-nums">{formatNumber(release.accessions)}</span>
                </li>
              ))}
            </ul>
          </figure>

          <div className="mt-20 grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">{site.summary}</p>
              <p className={`${display} text-3xl leading-tight font-semibold`}>{site.goal}</p>
            </div>
            <div>
              <dl className="grid">
                {site.stats.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-foreground/15 py-3">
                    <dt className="text-sm">{s.label}</dt>
                    <dd className={`${display} text-6xl leading-none font-black tabular-nums`}>{s.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-10 grid gap-3">
                {site.objectives.map((o) => (
                  <li key={o} className="flex gap-3 border-t border-foreground/15 pt-3 text-sm">
                    <span className="mt-1.5 size-2 shrink-0 bg-(--p1)" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="tools" className="pb-24">
          <SectionHead
            regime="labyrinth"
            title="Tools"
            note={`${tools.length} open source tools, each a swatch of its own regime.`}
          />
          <div className="grid">
            {tools.map((tool, i) => {
              const regime = regimes[toolRegime[tool.slug]];
              return (
                <article
                  key={tool.slug}
                  className="grid gap-8 border-t border-foreground/15 py-12 md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1fr)]"
                >
                  <div className="flex items-start gap-4 md:flex-col">
                    <PatternCanvas
                      plate={toolPlate(tool.slug)}
                      stops={[`p${(i % 4) + 1}`, `f${(i % 4) + 1}`] as Stop[]}
                      scale={3}
                      label={`${regime.name} pattern for ${tool.name}`}
                      className="w-28 md:w-full"
                    />
                    <Params regime={regime} />
                  </div>
                  <div>
                    <h3 className={`${display} text-6xl leading-[0.85] font-black tracking-tight`}>{tool.name}</h3>
                    <p className={`${display} mt-3 text-2xl leading-tight font-semibold`}>{tool.summary}</p>
                    <p className="mt-4 leading-relaxed opacity-80">{tool.description}</p>
                    <ul className="mt-6 grid gap-2 text-sm">
                      {tool.capabilities.map((c) => (
                        <li key={c} className="flex gap-3">
                          <span className="mt-1.5 size-2 shrink-0" style={{ background: `var(--p${(i % 4) + 1})` }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={tool.url}
                      className="mt-6 inline-flex items-center gap-1 border-b border-foreground pb-0.5 text-sm font-medium"
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
              );
            })}
          </div>
        </section>

        <section id="data" className="pb-24">
          <SectionHead
            regime="spots"
            title="Data"
            note={`Each strip feeds spots along a bar as long as its release: one grid cell per ${formatNumber(Math.round(ACCESSIONS_PER_CELL))} accessions.`}
          />
          <ol className="grid">
            {dataReleases.map((r) => (
              <li
                key={r.doi}
                className="grid gap-x-8 gap-y-3 border-t border-foreground/15 py-6 md:grid-cols-[9rem_minmax(0,1fr)_14rem]"
              >
                <div className="flex items-baseline justify-between gap-4 md:block">
                  <h3 className={`${display} flex items-center gap-2 text-3xl leading-none font-black`}>
                    <span className="size-3 shrink-0" style={{ background: cropColor(r.crop) }} />
                    {r.crop}
                  </h3>
                  <p className={`${display} text-3xl leading-none font-semibold tabular-nums md:mt-2`}>
                    {formatNumber(r.accessions)}
                  </p>
                </div>
                <div className="self-center">
                  <PatternCanvas
                    plate={releasePlate(r)}
                    stops={["ground", cropStop(r.crop), "ink"]}
                    label={`${r.crop}: ${formatNumber(r.accessions)} accessions as a strip of spots`}
                  />
                </div>
                <div className="text-sm">
                  <p>{r.assembly}</p>
                  <p className="opacity-70">
                    {formatDate(r.released)}
                    {"superseded" in r && " · included in a later release"}
                  </p>
                  <a href={r.doi} className="mt-1 inline-flex items-center gap-1 underline-offset-4 hover:underline">
                    {r.doi.replace("https://doi.org/", "")}
                    <ArrowUpRightIcon className="size-3" />
                  </a>
                </div>
              </li>
            ))}
          </ol>

          <h3 className={`${display} mt-20 text-5xl leading-none font-black`}>Mappings and standards</h3>
          <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name} className="border-t border-foreground pt-4">
                <dt className={`${display} text-2xl leading-tight font-black`}>{s.name}</dt>
                <dd className="mt-2 text-sm leading-relaxed opacity-80">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news" className="pb-24">
          <SectionHead
            regime="stripes"
            title="News"
            note={`${news.length} items on a timeline: coral discs for data releases, smaller striped discs for tool releases.`}
          />
          <div className="relative">
            <PatternCanvas
              plate={newsPlate}
              stops={["ground", "c3", "c1", "c0"]}
              scale={3}
              label={`Timeline of ${news.length} news items grown as pattern discs`}
            />
            <ul aria-hidden className="relative mt-2 h-5 text-xs tabular-nums opacity-70">
              {yearTicks.map(({ year, x }) => (
                <li key={year} className="absolute border-l border-foreground/40 pl-1" style={{ left: `${x * 100}%` }}>
                  {year}
                </li>
              ))}
            </ul>
          </div>
          <ol className="mt-10 grid gap-x-12 md:grid-cols-2">
            {news.map((n) => (
              <li key={n.date + n.title} className="border-t border-foreground/15 py-5">
                <div className="flex items-center gap-3 text-sm">
                  <time dateTime={n.date} className="tabular-nums">
                    {formatDate(n.date)}
                  </time>
                  <span className="opacity-60">{n.kind === "tool" ? "Tool release" : "Data release"}</span>
                </div>
                <h3 className={`${display} mt-1 text-3xl leading-tight font-black`}>{n.title}</h3>
                <p className="mt-1 text-sm leading-relaxed opacity-80">{n.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <aside aria-labelledby="rule-title" className="grid gap-10 border-t border-foreground py-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <h2 id="rule-title" className={`${display} text-5xl leading-none font-black`}>
            The rule
          </h2>
          <div className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
            <p>
              In 1952 Alan Turing showed that two chemicals reacting and diffusing at different rates can turn an even
              mixture into spots and stripes. The Gray-Scott model is one such pair: a substrate u is fed in at rate F, an
              activator v eats it to make more of itself, and v is removed at rate F + k.
            </p>
            <p>
              Because v diffuses at half the speed of u, a patch of activator starves its surroundings and is stopped from
              spreading evenly. Small changes to F and k move the result from spots to stripes to labyrinths, the same
              family of marks found on leaves, petals and seed coats.
            </p>
            <p>
              Every picture here starts from the same seeded scatter of activator, so the same content grows the same
              picture every time. Each runs a fixed number of steps when it first scrolls into view, then stops.
            </p>
            <p>
              The data sets the feed map: where a release, a tool or a news item lives, F and k sit inside a pattern
              regime; everywhere else they sit in the barren corner where nothing can form.
            </p>
          </div>
        </aside>
      </main>

      <footer className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
        <PatternCanvas plate={bandPlate("holes")} stops={["ground", "c2", "c0"]} label="Holes pattern band" />
        <div className="grid gap-8 pt-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div>
            <p className={`${display} text-3xl leading-tight font-semibold`}>{funding.acknowledgement}</p>
            <Params regime={regimes.holes} className="mt-6" />
          </div>
          <ul className="grid content-start gap-2 text-sm">
            {funding.partners.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <span className="size-2.5 shrink-0" style={{ background: `var(--p${i + 1})` }} />
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
