import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  dataReleases,
  formatDate,
  formatNumber,
  funding,
  news,
  sections,
  site,
  standards,
  tools,
  type SectionId,
} from "@/content";
import { ArcDivider } from "./_components/arc-divider";
import { CircosPlot } from "./_components/circos-plot";
import { Gauge } from "./_components/gauge";
import { maxRelease, newsTicks, releaseId, servedBy, toolColor } from "./_components/geometry";

export const metadata: Metadata = { title: `Circos | ${site.name}` };

const display = "font-(family-name:--font-circos-display)";
const mono = "font-(family-name:--font-circos-mono)";
const label = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;

// Section opener: the unrolled ring with this section's segments lit, then the heading.
function SectionHead({ id, index }: { id: Exclude<SectionId, "about">; index: number }) {
  return (
    <header className="mb-12">
      <ArcDivider section={id} />
      <div className="mt-6 flex items-baseline gap-4">
        <span className={`${mono} text-sm tabular-nums`}>{String(index).padStart(2, "0")}</span>
        <h2 className={`${display} text-4xl font-semibold tracking-tight sm:text-6xl`}>{label(id)}</h2>
      </div>
    </header>
  );
}

// Circos design: the homepage as a Circos plot of crops, releases, tools and news, with quiet sections below.
export default function CircosDesign() {
  return (
    <PaletteProvider design="circos" defaultId={257} shortlist={[257, 286, 252, 299, 312, 274, 347, 322, 244]}>
      <div className="overflow-x-clip">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4 sm:px-8">
          <a href="#about" className={`${display} flex items-center gap-2 text-lg font-semibold`}>
            <Gauge value={0.75} color="var(--p1)" className="size-6" />
            {site.name}
          </a>
          <nav className={`${mono} order-last flex w-full gap-5 text-sm sm:order-none sm:ml-auto sm:w-auto`}>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="underline-offset-4 hover:underline">
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </div>

        <main className="mx-auto w-full max-w-7xl px-4 sm:px-8 [&>section]:scroll-mt-4 [&_article]:scroll-mt-4 [&_li]:scroll-mt-4">
          <section id="about" className="pt-6 pb-24 sm:pt-10">
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <div>
                <h1 className={`${display} text-[2rem] leading-[1.1] font-semibold tracking-tight sm:text-5xl xl:text-6xl`}>
                  {site.tagline}
                </h1>
                <p className="mt-8 max-w-xl text-lg">{site.summary}</p>
                <dl className="mt-10 grid grid-cols-[1.5fr_1fr_1fr] gap-4 sm:gap-8">
                  {site.stats.map((s, i) => (
                    <div key={s.label} className="flex flex-col-reverse">
                      <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                      <dd className={`${display} flex items-center gap-2 text-xl font-semibold sm:text-3xl`}>
                        <Gauge value={(i + 1) / site.stats.length} color={`var(--p${i + 1})`} className="size-5 shrink-0 sm:size-7" />
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <CircosPlot />
            </div>

            <div className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <p className={`${display} text-xl leading-snug font-medium sm:text-2xl`}>{site.goal}</p>
              <ol className="grid gap-6 sm:grid-cols-3">
                {site.objectives.map((o, i) => (
                  <li key={o} className="text-sm">
                    <Gauge value={(i + 1) / site.objectives.length} color={`var(--p${i + 1})`} className="mb-3 size-8" />
                    {o}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section id="tools" className="pb-24">
            <SectionHead id="tools" index={1} />
            <div className="grid gap-20">
              {tools.map((tool) => (
                <article key={tool.slug} id={`tool-${tool.slug}`} className="grid gap-8 md:grid-cols-2 md:gap-12">
                  <div className="border-t-8 pt-6" style={{ borderColor: toolColor(tool.slug) }}>
                    <h3 className={`${display} text-3xl font-semibold tracking-tight sm:text-4xl`}>{tool.name}</h3>
                    <p className="mt-4 text-lg">{tool.summary}</p>
                    <p className="mt-3 text-muted-foreground">{tool.description}</p>
                    <ul className="mt-6 space-y-2 text-sm">
                      {tool.capabilities.map((c) => (
                        <li key={c} className="grid grid-cols-[1.25rem_1fr] items-baseline">
                          <span className="h-2.5 w-1.5" style={{ background: toolColor(tool.slug) }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <p className={`${mono} mt-6 text-xs text-muted-foreground`}>
                      Links to {servedBy[tool.slug].join(", ")}
                    </p>
                    <a
                      href={tool.url}
                      className={`${mono} mt-4 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4`}
                    >
                      Open {tool.name} <ArrowUpRightIcon className="size-4" />
                    </a>
                  </div>
                  {"image" in tool ? (
                    <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="h-auto w-full" />
                  ) : (
                    <ImagePlaceholder label={tool.name} />
                  )}
                </article>
              ))}
            </div>
          </section>

          <section id="data" className="pb-24">
            <SectionHead id="data" index={2} />
            <ol className="border-t">
              {dataReleases.map((r) => (
                <li
                  key={r.doi}
                  id={releaseId(r)}
                  className={`grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b py-5 sm:grid-cols-[4rem_10rem_minmax(0,1fr)_auto] sm:gap-x-8 ${"superseded" in r ? "text-muted-foreground" : ""}`}
                >
                  <Gauge value={r.accessions / maxRelease} className="row-span-2 size-12 sm:row-span-1 sm:size-14" />
                  <div>
                    <p className={`${display} text-lg font-semibold`}>{r.crop}</p>
                    <p className={`${mono} text-2xl tabular-nums`}>{formatNumber(r.accessions)}</p>
                  </div>
                  <p className="col-start-2 text-sm sm:col-start-auto">
                    {r.assembly}
                    <span className="block text-muted-foreground">
                      {formatDate(r.released)}
                      {"superseded" in r && ", included in a later release"}
                    </span>
                  </p>
                  <a href={r.doi} className={`${mono} col-start-2 text-xs underline underline-offset-4 sm:col-start-auto`}>
                    {r.doi.replace("https://doi.org/", "doi:")}
                  </a>
                </li>
              ))}
            </ol>

            <h3 className={`${display} mt-20 text-2xl font-semibold`}>Mappings and standards</h3>
            <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {standards.map((s, i) => (
                <div key={s.name} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
                  <Gauge value={(i + 1) / standards.length} color={`var(--p${i + 1})`} className="size-6" />
                  <div>
                    <dt className="font-semibold">{s.name}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{s.detail}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section id="news" className="pb-24">
            <SectionHead id="news" index={3} />
            <ol className="border-t">
              {news.map((n, i) => {
                const { owner, color } = newsTicks[i];
                return (
                  <li key={n.date + n.title} className="grid gap-x-8 gap-y-2 border-b py-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    <div className={`${mono} flex items-center gap-3 text-sm sm:flex-col sm:items-start sm:gap-1`}>
                      <time dateTime={n.date}>{formatDate(n.date)}</time>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className="h-3.5 w-1 rounded-full"
                          style={{ background: color ?? "var(--foreground)" }}
                        />
                        {owner.label}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{n.title}</h3>
                      <p className="mt-1 max-w-2xl text-muted-foreground">{n.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </main>

        <footer className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-8">
          <div className="grid gap-8 border-t-8 border-foreground pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <p className={`${display} text-lg font-medium`}>{funding.acknowledgement}</p>
            <ul className={`${mono} space-y-2 text-sm`}>
              {funding.partners.map((p, i) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="size-2.5 shrink-0" style={{ background: `var(--p${i + 1})` }} />
                  {p}
                </li>
              ))}
              <li className="pt-4">
                <a href={site.github} className="inline-flex items-center gap-1 underline underline-offset-4">
                  GitHub <ArrowUpRightIcon className="size-4" />
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
      <PalettePicker />
    </PaletteProvider>
  );
}
