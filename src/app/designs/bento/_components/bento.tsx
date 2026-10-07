"use client";

import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import type { HairlineFigureName } from "@/components/hairline";
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
  type SectionId,
  type ToolSlug,
} from "@/content";
import { BentoBoard, Tile, type Tone } from "./tile";

const display = "font-(family-name:--font-bento-display)";
const label = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;

const cropFigure: Record<Crop, HairlineFigureName> = {
  Wheat: "wheat",
  Barley: "barley",
  Chickpea: "chickpea",
  "Field pea": "pea",
  Lentil: "lentil",
};

// A figure per tool, chosen for what the tool handles: Pretzel aligns genomes, Genolink joins collections
// (lupin is one of them), Fairybread scatters seed diversity, Brioche re-anchors the big cereal genomes.
const toolFigure: Record<ToolSlug, HairlineFigureName> = {
  pretzel: "dna",
  genolink: "lupin",
  fairybread: "lentil",
  brioche: "wheat",
};

const tones = [1, 2, 3, 4] as const;
const toneAt = (i: number): Tone => tones[i % tones.length];

/** Accessions per crop, skipping superseded releases, largest first. */
const byCrop = crops
  .map((crop) => ({
    crop,
    accessions: dataReleases.reduce((n, r) => (r.crop === crop && !("superseded" in r) ? n + r.accessions : n), 0),
  }))
  .sort((a, b) => b.accessions - a.accessions);

const grid =
  "grid grid-flow-row-dense auto-rows-[minmax(9.5rem,auto)] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

function SectionHeading({ id, children }: { id: SectionId; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-1">
      <h2 id={`${id}-heading`} className={`${display} text-2xl font-bold tracking-tight sm:text-3xl`}>
        {label(id)}
      </h2>
      {children && <p className="text-sm text-muted-foreground">{children}</p>}
    </div>
  );
}

function OutLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative z-20 inline-flex items-center gap-1 rounded-md border bento-rule px-3 py-1.5 text-sm font-medium hover:bg-(--f) hover:text-(--g)"
    >
      {children}
      <ArrowUpRightIcon className="size-4" />
    </a>
  );
}

export function Bento() {
  const current = dataReleases.filter((r) => !("superseded" in r));
  const superseded = dataReleases.filter((r) => "superseded" in r);
  const maxCrop = byCrop[0].accessions;

  return (
    <PaletteProvider design="bento" defaultId={284} shortlist={[284, 257, 247, 286, 299, 328, 347, 274, 316]}>
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
          <a href="#about" className={`${display} shrink-0 font-bold tracking-tight`}>
            {site.name}
          </a>
          <nav className="ml-auto flex gap-4 overflow-x-auto text-sm sm:gap-5">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                {s.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <BentoBoard>
        <main className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 [&>section]:scroll-mt-16 [&>section]:pt-8">
          {/* About: the hero tile leads with the accession total. */}
          <section id="about" aria-labelledby="about-heading">
            <h2 id="about-heading" className="sr-only">
              {label("about")}
            </h2>
            <div className={grid}>
              <Tile id="hero" tone={1} span="sm:col-span-2 lg:row-span-2" label={site.stats[0].label}>
                {({ open }) => (
                  <div className={open ? "grid gap-10 lg:grid-cols-2" : "flex h-full flex-col"}>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{site.stats[0].label}</p>
                      <p className={`${display} mt-2 text-6xl leading-none font-extrabold tracking-tighter tabular-nums sm:text-8xl`}>
                        {formatNumber(totalAccessions)}
                      </p>
                      <h1 className={`${display} mt-auto max-w-xl pt-8 text-2xl leading-tight font-semibold tracking-tight sm:text-3xl`}>
                        {site.tagline}
                      </h1>
                    </div>
                    {open && (
                      <ul className="space-y-3 self-end">
                        {byCrop.map(({ crop, accessions }) => (
                          <li key={crop}>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{crop}</span>
                              <span className="tabular-nums">{formatNumber(accessions)}</span>
                            </div>
                            <div className="mt-1 h-3 bg-(--f)/15">
                              <div className="h-full bg-(--f)" style={{ width: `${(accessions / maxCrop) * 100}%` }} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Tile>

              <Tile id="summary" tone={2} span="sm:col-span-2" label="About us">
                {({ open }) => (
                  <div className={open ? "grid gap-8 pr-10 lg:grid-cols-2" : ""}>
                    <div>
                      <p className={open ? "text-lg" : "line-clamp-4 sm:line-clamp-3"}>{site.summary}</p>
                      {open && <p className={`${display} mt-6 text-xl font-semibold`}>{site.goal}</p>}
                    </div>
                    {open && (
                      <ul className="divide-y bento-rule border-y">
                        {site.objectives.map((o) => (
                          <li key={o} className="bento-rule py-3">
                            {o}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Tile>

              <Tile id="crops" tone={3} label={site.stats[1].label}>
                {({ open }) => (
                  <div className="flex h-full flex-col">
                    <p className={`${display} text-5xl font-extrabold tracking-tighter`}>{site.stats[1].value}</p>
                    <p className="mt-auto pt-3 text-sm font-medium">{site.stats[1].label}</p>
                    {open && (
                      <ul className="mt-6 grid gap-x-8 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
                        {byCrop.map(({ crop, accessions }) => (
                          <li key={crop} className="border-t bento-rule pt-2">
                            <span className="font-medium">{crop}</span>
                            <span className="bento-muted block text-sm tabular-nums">{formatNumber(accessions)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Tile>

              <Tile id="tool-count" tone={4} label={site.stats[2].label}>
                {({ open }) => (
                  <div className="flex h-full flex-col">
                    <p className={`${display} text-5xl font-extrabold tracking-tighter`}>{site.stats[2].value}</p>
                    <p className="mt-auto pt-3 text-sm font-medium">{site.stats[2].label}</p>
                    {open && (
                      <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                        {tools.map((t) => (
                          <li key={t.slug} className="border-t bento-rule pt-2">
                            <span className="font-semibold">{t.name}</span>
                            <span className="bento-muted block text-sm">{t.summary}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Tile>
            </div>
          </section>

          <section id="tools" aria-labelledby="tools-heading">
            <SectionHeading id="tools">{site.github.replace("https://", "")}</SectionHeading>
            <div className={grid}>
              {tools.map((tool, i) => (
                <Tile key={tool.slug} id={tool.slug} tone={toneAt(i + 1)} span="row-span-2" label={tool.name} figure={toolFigure[tool.slug]}>
                  {({ open, figure }) =>
                    open ? (
                      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                        <div className="space-y-4">
                          {figure}
                          {"image" in tool ? (
                            <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="rounded-lg" />
                          ) : (
                            <ImagePlaceholder label={tool.name} />
                          )}
                        </div>
                        <div className="pr-10">
                          <h3 className={`${display} text-4xl font-bold tracking-tight`}>{tool.name}</h3>
                          <p className="mt-4 text-lg">{tool.description}</p>
                          <ul className="mt-6 divide-y bento-rule border-y">
                            {tool.capabilities.map((c) => (
                              <li key={c} className="bento-rule py-2.5 text-sm">
                                {c}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-6">
                            <OutLink href={tool.url}>Open {tool.name}</OutLink>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col">
                        <div className="mx-auto w-full max-w-64">{figure}</div>
                        <h3 className={`${display} mt-auto pt-2 text-2xl font-bold tracking-tight`}>{tool.name}</h3>
                        <p className="bento-muted mt-1 text-sm">{tool.summary}</p>
                      </div>
                    )
                  }
                </Tile>
              ))}
            </div>
          </section>

          <section id="data" aria-labelledby="data-heading">
            <SectionHeading id="data">
              {formatNumber(totalAccessions)} {site.stats[0].label.toLowerCase()}
            </SectionHeading>
            <div className={grid}>
              {current.map((r, i) => (
                <Tile key={r.doi} id={`release-${i}`} tone={toneAt(i)} span="row-span-2" label={`${r.crop} release, ${formatDate(r.released)}`} figure={cropFigure[r.crop]}>
                  {({ open, figure }) =>
                    open ? (
                      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                        <div className="max-w-md">{figure}</div>
                        <div className="pr-10">
                          <h3 className={`${display} text-4xl font-bold tracking-tight`}>{r.crop}</h3>
                          <p className={`${display} mt-2 text-6xl font-extrabold tracking-tighter tabular-nums`}>{formatNumber(r.accessions)}</p>
                          <dl className="mt-6 grid gap-4 border-t bento-rule pt-4 sm:grid-cols-2">
                            <div>
                              <dt className="bento-muted text-sm">Reference assembly</dt>
                              <dd className="font-medium">{r.assembly}</dd>
                            </div>
                            <div>
                              <dt className="bento-muted text-sm">Released</dt>
                              <dd className="font-medium">{formatDate(r.released)}</dd>
                            </div>
                          </dl>
                          <div className="mt-6 flex flex-wrap gap-3">
                            <OutLink href={r.doi}>{r.doi.replace("https://doi.org/", "")}</OutLink>
                            <OutLink href={tools[0].url}>Open in {tools[0].name}</OutLink>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col">
                        <div className="mx-auto w-full max-w-56">{figure}</div>
                        <h3 className={`${display} mt-auto pt-2 text-xl font-bold tracking-tight`}>{r.crop}</h3>
                        <p className={`${display} text-3xl font-extrabold tracking-tighter tabular-nums`}>{formatNumber(r.accessions)}</p>
                        <p className="bento-muted mt-1 text-sm">
                          {r.assembly}, {formatDate(r.released)}
                        </p>
                      </div>
                    )
                  }
                </Tile>
              ))}

              {superseded.map((r) => (
                <Tile key={r.doi} id={`superseded-${r.crop}`} tone={0} label={`${r.crop} release, ${formatDate(r.released)}`}>
                  {({ open }) => (
                    <div className="flex h-full flex-col">
                      <h3 className={`${display} text-lg font-bold tracking-tight`}>{r.crop}</h3>
                      <p className={`${display} text-2xl font-extrabold tracking-tighter tabular-nums`}>{formatNumber(r.accessions)}</p>
                      <p className="bento-muted mt-auto pt-2 text-sm">
                        {formatDate(r.released)}, included in a later release
                      </p>
                      {open && (
                        <div className="mt-4 flex flex-wrap items-center gap-4 border-t bento-rule pt-4">
                          <span className="text-sm">{r.assembly}</span>
                          <OutLink href={r.doi}>{r.doi.replace("https://doi.org/", "")}</OutLink>
                        </div>
                      )}
                    </div>
                  )}
                </Tile>
              ))}

              <Tile id="standards" tone={4} span="sm:col-span-2" label="Mappings and standards">
                {({ open }) => (
                  <div className={open ? "pr-10" : ""}>
                    <h3 className={`${display} text-xl font-bold tracking-tight`}>Mappings and standards</h3>
                    {open ? (
                      <dl className="mt-5 grid gap-6 sm:grid-cols-2">
                        {standards.map((s) => (
                          <div key={s.name} className="border-t bento-rule pt-3">
                            <dt className="font-semibold">{s.name}</dt>
                            <dd className="bento-muted mt-1 text-sm">{s.detail}</dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                        {standards.map((s) => (
                          <li key={s.name}>{s.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Tile>
            </div>
          </section>

          <section id="news" aria-labelledby="news-heading">
            <SectionHeading id="news">{news.length} updates</SectionHeading>
            <div className={grid}>
              <Tile id="latest" tone={2} span="lg:row-span-1" label={news[0].title}>
                {({ open }) => (
                  <div className={open ? "max-w-2xl pr-10" : "flex h-full flex-col"}>
                    <time dateTime={news[0].date} className="bento-muted text-sm">
                      {formatDate(news[0].date)}
                    </time>
                    <h3 className={`${display} mt-auto pt-2 text-lg leading-snug font-bold tracking-tight`}>{news[0].title}</h3>
                    {open && <p className="mt-3">{news[0].body}</p>}
                  </div>
                )}
              </Tile>

              <Tile id="ticker" tone={3} span="sm:col-span-2 lg:col-span-3" label="All news">
                {({ open }) =>
                  open ? (
                    <ol className="divide-y bento-rule pr-10">
                      {news.map((n) => (
                        <li key={n.date + n.title} className="grid gap-1 bento-rule py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                          <time dateTime={n.date} className="bento-muted text-sm">
                            {formatDate(n.date)}
                          </time>
                          <div>
                            <h3 className="font-semibold">{n.title}</h3>
                            <p className="bento-muted mt-1 text-sm">{n.body}</p>
                            <p className="mt-1 text-xs font-medium">{n.kind === "tool" ? "Tool release" : "Data release"}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="flex h-full flex-col justify-between gap-4">
                      <p className="text-sm font-medium">Recent updates</p>
                      <div className="-mx-5 overflow-hidden sm:-mx-6 motion-reduce:overflow-x-auto">
                        <div className="bento-ticker flex w-max">
                          {[0, 1].map((copy) => (
                            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0">
                              {news.map((n) => (
                                <li key={n.date + n.title} className="flex items-baseline gap-3 border-l bento-rule px-5 whitespace-nowrap sm:px-6">
                                  <time dateTime={n.date} className="bento-muted text-sm">
                                    {formatDate(n.date)}
                                  </time>
                                  <span className={`${display} text-lg font-semibold`}>{n.title}</span>
                                </li>
                              ))}
                            </ul>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
              </Tile>
            </div>
          </section>
        </main>

        <footer className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6">
          <div className={grid}>
            <Tile id="funding" tone={1} span="col-span-full">
              {() => (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <p className="max-w-2xl">{funding.acknowledgement}</p>
                  <ul className="space-y-1 text-sm font-semibold lg:text-right">
                    {funding.partners.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Tile>
          </div>
        </footer>
      </BentoBoard>
      <PalettePicker />
    </PaletteProvider>
  );
}
