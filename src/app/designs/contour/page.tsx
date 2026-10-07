import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { dataReleases, formatDate, formatNumber, funding, news, sections, site, standards, type SectionId } from "@/content";
import { SurveyMap } from "./_components/survey-map";
import { gridRef, stations, trail } from "./_components/terrain";

export const metadata: Metadata = { title: `Topographic survey | ${site.name}` };

const display = "font-(family-name:--font-contour-display)";
const label = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;

// Small map symbols reused in the text column so it reads as the sheet's key.
const Trig = ({ className = "" }: { className?: string }) => (
  <svg viewBox="-10 -10 20 20" className={`size-5 shrink-0 ${className}`} aria-hidden>
    <circle r={8.5} fill="none" stroke="currentColor" strokeWidth={1.5} />
    <path d="M0,-5L4.5,3.2L-4.5,3.2Z" fill="var(--p4)" stroke="currentColor" strokeWidth={0.8} />
  </svg>
);
const Spot = ({ className = "" }: { className?: string }) => (
  <svg viewBox="-6 -6 12 12" className={`size-3 shrink-0 ${className}`} aria-hidden>
    <path d="M0,-5L5,4L-5,4Z" fill="currentColor" />
  </svg>
);

function SectionHead({ id, legend }: { id: Exclude<SectionId, "about">; legend: string }) {
  return (
    <header className="mb-10 border-t border-foreground pt-4">
      <p className="text-sm text-muted-foreground">{legend}</p>
      <h2 className={`${display} mt-1 text-3xl font-semibold tracking-tight sm:text-4xl`}>{label(id)}</h2>
    </header>
  );
}

// Topographic survey: a contour map built from the data releases, held beside the page while each section pans it to a waypoint.
export default function ContourDesign() {
  return (
    <PaletteProvider design="contour" defaultId={278} shortlist={[278, 310, 318, 319, 305, 243, 306, 247, 334]}>
      <header className="sticky top-0 z-20 border-b border-foreground/20 bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-4 px-4 sm:gap-6 sm:px-6">
          <a href="#about" className={`${display} flex min-w-0 items-center gap-2 font-semibold`}>
            <Trig />
            <span className="hidden truncate sm:inline">{site.name}</span>
          </a>
          <nav className="ml-auto flex gap-4 text-sm sm:gap-6">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="underline-offset-4 hover:underline">
                {s.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <div className="grid overflow-x-clip lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="border-b border-foreground/20 lg:sticky lg:top-14 lg:h-[calc(100svh-3.5rem)] lg:border-r lg:border-b-0">
          <SurveyMap className="aspect-[10/9] w-full lg:aspect-auto lg:h-full" />
        </div>

        <main className="min-w-0 px-4 sm:px-8 lg:px-12 [&>section]:scroll-mt-20 [&>section]:py-16 lg:[&>section]:py-24">
          <section id="about" data-waypoint="about">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spot /> Trailhead, grid ref {gridRef(trail.start)}
            </p>
            <h1 className={`${display} mt-4 text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl`}>{site.tagline}</h1>
            <p className="mt-8 text-lg">{site.summary}</p>
            <p className="mt-4 text-lg text-muted-foreground">{site.goal}</p>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-foreground/20 py-6">
              {site.stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                  <dd className={`${display} flex items-center gap-2 text-xl font-semibold tabular-nums sm:text-3xl`}>
                    <Spot className="hidden sm:block" />
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <ul className="mt-10 space-y-4">
              {site.objectives.map((o) => (
                <li key={o} className="flex gap-3">
                  <span className="mt-2.5 h-0.5 w-6 shrink-0 bg-foreground" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          <section id="tools">
            <SectionHead id="tools" legend="Survey stations along the route" />
            <div className="grid gap-16">
              {stations.map(({ tool, ...at }) => (
                <article key={tool.slug} data-waypoint={`station-${tool.slug}`}>
                  <div className="flex items-center gap-3">
                    <Trig className="size-7" />
                    <div>
                      <h3 className={`${display} text-2xl font-semibold`}>{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">Station at grid ref {gridRef(at)}</p>
                    </div>
                  </div>
                  <p className="mt-5">{tool.description}</p>
                  {"image" in tool ? (
                    <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="mt-6 border border-foreground/20" />
                  ) : (
                    <ImagePlaceholder label={tool.name} className="mt-6" />
                  )}
                  <ul className="mt-6 space-y-2 text-sm">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-1.5 size-1.5 shrink-0 bg-foreground" aria-hidden />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.url}
                    className="mt-6 inline-flex items-center gap-1.5 border border-foreground px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section id="data" data-waypoint="data">
            <SectionHead id="data" legend="Spot heights, one summit per release" />
            <ol className="divide-y divide-foreground/20 border-y border-foreground/20">
              {dataReleases.map((r, i) => (
                <li
                  key={r.doi}
                  data-release={i}
                  className={`grid grid-cols-[7rem_minmax(0,1fr)] gap-x-4 gap-y-1 py-5 transition-colors hover:bg-foreground/5 sm:grid-cols-[8.5rem_minmax(0,1fr)] ${"superseded" in r ? "text-muted-foreground" : ""}`}
                >
                  <p className={`${display} row-span-2 flex items-start gap-2 text-xl font-semibold sm:text-2xl tabular-nums`}>
                    <Spot className="mt-2.5" />
                    {formatNumber(r.accessions)}
                  </p>
                  <div>
                    <h3 className="font-medium">
                      {r.crop}
                      {"superseded" in r && <span className="ml-2 text-sm font-normal">superseded</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">{r.assembly}</p>
                  </div>
                  <div className="col-start-2 flex flex-wrap gap-x-4 text-sm">
                    <time dateTime={r.released}>{formatDate(r.released)}</time>
                    <a href={r.doi} className="break-all underline-offset-4 hover:underline">
                      {r.doi.replace("https://doi.org/", "")}
                    </a>
                  </div>
                </li>
              ))}
            </ol>
            <h3 className={`${display} mt-14 text-xl font-semibold`}>Mappings and standards</h3>
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              {standards.map((s) => (
                <div key={s.name} className="border-l-2 border-foreground/40 pl-4">
                  <dt className="font-medium">{s.name}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="news" data-waypoint="news">
            <SectionHead id="news" legend={`Field log, camp at grid ref ${gridRef(trail.end)}`} />
            <ol className="border-l-2 border-dashed border-foreground/50">
              {news.map((n) => (
                <li key={n.date + n.title} className="relative pb-8 pl-6 last:pb-0">
                  <span
                    className={`absolute top-1.5 -left-[7px] size-3 border border-foreground ${n.kind === "tool" ? "bg-(--p2)" : "bg-(--p4)"}`}
                    aria-hidden
                  />
                  <p className="text-sm text-muted-foreground">
                    <time dateTime={n.date}>{formatDate(n.date)}</time>, {n.kind === "tool" ? "Tool release" : "Data release"}
                  </p>
                  <h3 className="mt-1 font-medium">{n.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </main>
      </div>

      <footer className="border-t border-foreground">
        <div className="grid gap-6 px-4 py-10 text-sm sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <p className={`${display} font-semibold`}>{site.name}</p>
          <div>
            <p>{funding.acknowledgement}</p>
            <p className="mt-4 text-muted-foreground">{funding.partners.join(" · ")}</p>
          </div>
        </div>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
