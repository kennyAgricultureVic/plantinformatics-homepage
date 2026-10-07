import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDate, formatNumber, funding, news, sections, site, standards, tools, totalAccessions } from "@/content";
import { IfsCanvas } from "./_components/ifs-canvas";
import { HERO_POINTS, HERO_SEED, TOOL_POINTS, barnsley, chaosGame, inkRank, releasesNewestFirst, toolIfs, type Ifs } from "./_components/ifs";
import { Inks } from "./_components/inks";
import { MAX_TURNS, MIN_TURNS } from "./_components/fiddlehead";
import { Fiddlehead, NewsFrieze, kindInk } from "./_components/news-frieze";
import { Reveal } from "./_components/reveal";

export const metadata: Metadata = { title: `Fern | ${site.name}` };

/** Signed coefficient with a true minus sign, trailing zeros dropped. */
const coef = (v: number) => (v < 0 ? "−" : "") + String(Math.abs(v));

/** Exactly what the hero canvas will plot, counted here so the table can say how many points each map drew. */
const heroCounts = chaosGame(barnsley, HERO_POINTS, HERO_SEED).counts;
const heroRank = inkRank(barnsley);

const ink = (rank: number) => `var(--ink${rank})`;

/** Gloock draws + and = as hairlines, so operators borrow the body face at the same size. */
function Formula({ text }: { text: string }) {
  return text.split(/([=+−′])/).map((part, i) =>
    /^[=+−′]$/.test(part) ? (
      <span key={i} className="font-sans font-light">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

function Swatch({ rank }: { rank: number }) {
  return <span aria-hidden className="inline-block size-3 shrink-0" style={{ background: ink(rank) }} />;
}

function SectionTitle({ children, rule }: { children: ReactNode; rule: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-foreground pb-5">
      <h2 className="font-display text-6xl leading-[0.9] tracking-tight sm:text-8xl">{children}</h2>
      <p className="max-w-sm text-sm text-muted-foreground sm:text-right">{rule}</p>
    </div>
  );
}

/** The probabilities of an IFS as coloured cells, one per map, widths proportional to p. */
function ProbabilityBar({ ifs }: { ifs: Ifs }) {
  const rank = inkRank(ifs);
  return (
    <div>
      <div className="flex h-2 w-full gap-px" aria-hidden>
        {ifs.maps.map((m, k) => (
          <span key={k} style={{ flexGrow: m.p, background: ink(rank[k]) }} />
        ))}
      </div>
      <ul className="mt-3 grid gap-y-1 text-xs">
        {ifs.maps.map((m, k) => (
          <li key={k} className="flex items-center gap-2">
            <Swatch rank={rank[k]} />
            <span className="truncate">{ifs.roles[k]}</span>
            <span className="ml-auto tabular-nums text-muted-foreground">{m.p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Iterated function systems: four affine maps applied at random draw a fern. The hero plots one
// point per genotyped accession, each release is its own frond with as many points as accessions,
// each tool is a different set of maps, and news items are fiddleheads unrolling with age.
export default function FernDesign() {
  return (
    <PaletteProvider
      design="fern"
      defaultId={278}
      shortlist={[278, 245, 262, 270, 299, 312, 341, 247, 333]}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <Inks className="fern flex flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
            <a href="#about" className="flex shrink-0 items-center gap-2.5">
              <Fiddlehead date={news[0].date} kind="data" className="h-7 w-auto" />
              <span className="font-display text-xl">{site.name}</span>
            </a>
            <nav className="ml-auto hidden gap-6 text-sm sm:flex">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
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
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              <div className="order-2 min-w-0 lg:order-1">
                <p className="font-display text-[clamp(4.5rem,14vw,10rem)] leading-[0.85] tracking-tight tabular-nums">
                  {formatNumber(HERO_POINTS)}
                </p>
                <p className="mt-4 max-w-md text-muted-foreground">
                  points in the fern, one for every genotyped accession in the Australian Grains Genebank releases. Each
                  point is coloured by the map that put it there.
                </p>
                <h1 className="font-display mt-10 max-w-2xl text-3xl leading-[1.1] sm:text-5xl">{site.tagline}</h1>

                <div className="mt-12 border-t border-foreground pt-5">
                  <p className="font-display text-xl sm:text-2xl">
                    <Formula text="w(x, y) = (ax + by + e, cx + dy + f)" />
                  </p>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm tabular-nums sm:min-w-[34rem]">
                      <caption className="sr-only">The four maps of the Barnsley fern and the points each one drew</caption>
                      <thead>
                        <tr className="border-b border-foreground/20 text-left text-muted-foreground">
                          <th className="py-2 pr-3 font-normal">Map</th>
                          {["a", "b", "c", "d", "e", "f", "p"].map((h) => (
                            <th
                              key={h}
                              className={`font-display px-2 py-2 text-right text-base font-normal ${h === "p" ? "" : "hidden sm:table-cell"}`}
                            >
                              {h}
                            </th>
                          ))}
                          <th className="py-2 pl-3 text-right font-normal">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {barnsley.maps.map((m, k) => (
                          <tr key={k} className="border-b border-foreground/10">
                            <td className="py-2 pr-3">
                              <span className="flex items-center gap-2">
                                <Swatch rank={heroRank[k]} />
                                {barnsley.roles[k]}
                              </span>
                            </td>
                            {[m.a, m.b, m.c, m.d, m.e, m.f].map((v, j) => (
                              <td key={j} className="hidden px-2 py-2 text-right sm:table-cell">
                                {coef(v)}
                              </td>
                            ))}
                            <td className="px-2 py-2 text-right font-medium">{m.p}</td>
                            <td className="py-2 pl-3 text-right">{formatNumber(heroCounts[k])}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="order-1 min-w-0 lg:order-2">
                <div className="mx-auto [--hero-fern:30vh] lg:[--hero-fern:40vh]" style={{ maxWidth: "min(100%, var(--hero-fern))" }}>
                  <IfsCanvas
                    ifs={barnsley.id}
                    points={HERO_POINTS}
                    seed={HERO_SEED}
                    dot={1}
                    growMs={2600}
                    label={`Barnsley fern drawn with ${formatNumber(HERO_POINTS)} points, one per genotyped accession`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-20 grid gap-12 border-t border-foreground pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              <div className="space-y-6 text-lg leading-relaxed">
                <p>{site.summary}</p>
                <p className="font-display text-2xl leading-snug sm:text-3xl">{site.goal}</p>
              </div>
              <div>
                <dl>
                  {site.stats.map((s, i) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-foreground/15 py-3">
                      <dt className="flex items-center gap-3 text-sm">
                        <Swatch rank={i} />
                        {s.label}
                      </dt>
                      <dd className="font-display text-5xl tabular-nums sm:text-6xl">{s.value}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="mt-10 grid gap-4">
                  {site.objectives.map((o) => (
                    <li key={o} className="flex gap-3 border-t border-foreground/15 pt-4">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 bg-(--ink0)" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section id="tools" className="pb-24">
            <SectionTitle rule={`A different set of four maps for each tool, ${formatNumber(TOOL_POINTS)} points each.`}>
              Tools
            </SectionTitle>
            <div className="grid">
              {tools.map((tool, i) => {
                const ifs = toolIfs[i];
                return (
                  <article
                    key={tool.slug}
                    className="grid gap-8 border-b border-foreground/15 py-12 md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[16rem_minmax(0,1fr)_minmax(0,1fr)]"
                  >
                    <figure>
                      <IfsCanvas
                        ifs={ifs.id}
                        points={TOOL_POINTS}
                        seed={tool.slug}
                        dot={0.9}
                        fill
                        className="h-64"
                        label={`${ifs.name} drawn with ${formatNumber(TOOL_POINTS)} points`}
                      />
                      <figcaption className="mt-4">
                        <p className="font-display text-lg">
                          {ifs.name} <span className="text-muted-foreground">· {ifs.plant}</span>
                        </p>
                        <div className="mt-3">
                          <ProbabilityBar ifs={ifs} />
                        </div>
                      </figcaption>
                    </figure>
                    <div>
                      <h3 className="font-display text-5xl tracking-tight sm:text-6xl">{tool.name}</h3>
                      <p className="font-display mt-3 text-xl leading-snug">{tool.summary}</p>
                      <p className="mt-4 leading-relaxed text-muted-foreground">{tool.description}</p>
                      <ul className="mt-6 grid gap-2 text-sm">
                        {tool.capabilities.map((c) => (
                          <li key={c} className="flex gap-3">
                            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 bg-(--ink0)" />
                            {c}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={tool.url}
                        className="mt-6 inline-flex items-center gap-1 border-b border-foreground pb-0.5 text-sm font-medium hover:border-(--ink0) hover:text-(--ink0)"
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
            <SectionTitle rule="One frond per release, one point per accession. Every frond is the same size, so a fuller frond is a larger release.">
              Data
            </SectionTitle>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {releasesNewestFirst.map((r) => {
                const superseded = "superseded" in r;
                return (
                  <article key={r.doi} className="flex flex-col">
                    <IfsCanvas
                      ifs={barnsley.id}
                      points={r.accessions}
                      seed={r.doi}
                      dot={1}
                      faint={superseded}
                      growMs={1800}
                      label={`${r.crop} release of ${formatNumber(r.accessions)} accessions drawn as a fern with as many points`}
                      className="mx-auto max-w-[13rem]"
                    />
                    <div className="mt-4 border-t border-foreground pt-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-display text-2xl sm:text-3xl">{r.crop}</h3>
                        <p className="font-display text-xl tabular-nums sm:text-2xl">{formatNumber(r.accessions)}</p>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(r.released)} · {r.assembly}
                      </p>
                      {superseded && <p className="mt-1 text-sm text-muted-foreground">Included in a later release</p>}
                      <a
                        href={r.doi}
                        className="mt-2 inline-flex items-center gap-1 text-sm break-all underline-offset-4 hover:underline"
                      >
                        {r.doi.replace("https://doi.org/", "")}
                        <ArrowUpRightIcon className="size-3.5 shrink-0" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mt-10 text-sm text-muted-foreground">
              {formatNumber(totalAccessions)} unique accessions across current releases. Faded fronds are earlier releases
              whose accessions a later release includes.
            </p>

            <h3 className="font-display mt-20 text-4xl">Mappings and standards</h3>
            <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {standards.map((s) => (
                <div key={s.name} className="border-t border-foreground pt-4">
                  <dt className="font-display text-2xl"><Formula text={s.name} /></dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="news" className="pb-24">
            <SectionTitle rule="Each item a fiddlehead. The newest is still tightly curled; older news has had longer to unroll.">
              News
            </SectionTitle>
            <Reveal className="-mx-4 mt-12 overflow-x-auto px-4 pt-2 sm:mx-0 sm:overflow-visible sm:px-0">
              <NewsFrieze />
            </Reveal>
            <div className="mt-6 flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-6" style={{ background: kindInk("data") }} />
                Data release
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-6" style={{ background: kindInk("tool") }} />
                Tool release
              </span>
            </div>
            <ol className="mt-12 grid">
              {news.map((item) => (
                <li
                  key={`${item.date}${item.title}`}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-5 gap-y-1 border-t border-foreground/15 py-6 md:grid-cols-[9rem_4rem_minmax(0,1fr)]"
                >
                  <p className="col-span-2 text-sm text-muted-foreground tabular-nums md:col-span-1 md:pt-1">
                    {formatDate(item.date)}
                  </p>
                  <Fiddlehead date={item.date} kind={item.kind} className="row-span-2 h-14 w-auto justify-self-center md:row-span-1" />
                  <div>
                    <h3 className="font-display text-2xl leading-tight">{item.title}</h3>
                    <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <aside aria-labelledby="method-title" className="grid gap-10 border-t border-foreground py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div>
              <h2 id="method-title" className="font-display text-4xl sm:text-5xl">
                How the fern is drawn
              </h2>
              <p className="font-display mt-6 text-2xl leading-snug">
                <Formula text="x′ = ax + by + e" />
                <br />
                <Formula text="y′ = cx + dy + f" />
              </p>
            </div>
            <div className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
              <p>
                Start anywhere. Pick one of four affine maps at random, with the probabilities in the table, apply it to
                the point and plot the result. Repeat. Michael Barnsley showed in 1988 that this chaos game always settles
                onto the same shape, its attractor, and that four maps are enough for a black spleenwort.
              </p>
              <p>
                The busiest map makes a slightly smaller, slightly turned copy of the whole frond further up the stem; two
                more make the lowest pair of pinnae; the last squashes everything onto the stem. Each point takes the
                colour of the map that produced it.
              </p>
              <p>
                The hero runs the game exactly {formatNumber(totalAccessions)} times, one point per genotyped accession.
                Each release is the same fern run as many times as it has accessions, at the same scale, so the sparse
                chickpea frond and the dense wheat frond compare directly.
              </p>
              <p>
                Every drawing is seeded from its content, so the same data always grows the same fern. Fiddlehead turns
                fall linearly from {MAX_TURNS} for the newest news item to {MIN_TURNS} for the oldest.
              </p>
            </div>
          </aside>
        </main>

        <footer className="border-t border-foreground">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <p className="font-display text-2xl leading-snug">{funding.acknowledgement}</p>
            <ul className="grid content-start gap-2 text-sm">
              {funding.partners.map((p, i) => (
                <li key={p} className="flex items-center gap-3">
                  <Swatch rank={i} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </Inks>
      <PalettePicker />
    </PaletteProvider>
  );
}
