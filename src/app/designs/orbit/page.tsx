import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
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
import { clusters, cropCss } from "./_components/geometry";
import { OrbitHero } from "./_components/orbit-hero";
import { ToolThumb } from "./_components/tool-thumb";

export const metadata: Metadata = { title: `Orbit | ${site.name}` };

const display = "font-(family-name:--font-orbit-display)";
const label = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;
const cropIndex = (crop: string) => clusters.find((c) => c.crop === crop)?.index ?? 0;

function Heading({ id }: { id: Exclude<SectionId, "about"> }) {
  return <h2 className={`${display} text-4xl font-semibold tracking-tight sm:text-5xl`}>{label(id)}</h2>;
}

// Orbit design: a live 3D grain head circled by the genebank's accessions, with plain sections below.
export default function OrbitDesign() {
  return (
    <PaletteProvider
      design="orbit"
      defaultId={286}
      shortlist={[286, 247, 257, 267, 284, 299, 252, 278, 316]}
      className="overflow-x-clip"
    >
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <a href="#about" className={`${display} flex items-center gap-2 text-lg font-semibold tracking-tight`}>
            <span className="relative size-4 rounded-full border-2 border-(--p1)" aria-hidden>
              <span className="absolute -top-1 -right-1 size-1.5 rounded-full bg-(--p3)" />
            </span>
            {site.name}
          </a>
          <nav className="ml-auto hidden gap-5 text-sm sm:flex">
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

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 [&>section]:scroll-mt-14">
        <section id="about" className="pt-10 pb-20 sm:pt-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div className="lg:pt-10">
              <h1 className={`${display} text-4xl font-semibold tracking-tight text-balance sm:text-6xl`}>{site.tagline}</h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">{site.summary}</p>
              <dl className="mt-10 grid grid-cols-3 gap-4 border-t pt-6">
                {site.stats.map((s, i) => (
                  <div key={s.label}>
                    <dd className={`${display} text-3xl font-semibold tabular-nums sm:text-4xl`}>{s.value}</dd>
                    <dt className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 size-2 shrink-0" style={{ background: `var(--p${i + 1})` }} />
                      {s.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>
            <OrbitHero />
          </div>

          <div className="mt-20 grid gap-10 border-t pt-10 md:grid-cols-[1fr_2fr]">
            <p className={`${display} text-2xl font-medium tracking-tight`}>{site.goal}</p>
            <ul className="grid gap-6 sm:grid-cols-3">
              {site.objectives.map((o, i) => (
                <li key={o} className="border-t-2 pt-3 text-sm" style={{ borderColor: `var(--p${i + 1})` }}>
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="tools" className="border-t py-20">
          <Heading id="tools" />
          <div className="mt-12 grid gap-x-12 gap-y-16 md:grid-cols-2">
            {tools.map((tool, i) => (
              <article key={tool.slug} className="grid grid-cols-[6rem_1fr] gap-5 sm:grid-cols-[8rem_1fr]">
                <div className="self-start border bg-muted/40">
                  <ToolThumb slug={tool.slug} index={i} />
                </div>
                <div className="min-w-0">
                  <h3 className={`${display} text-2xl font-semibold tracking-tight`}>{tool.name}</h3>
                  <p className="mt-2 font-medium">{tool.summary}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{tool.description}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="flex gap-2">
                        <span className="mt-2 size-1.5 shrink-0" style={{ background: `var(--p${(i % 4) + 1})` }} />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.url}
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 hover:no-underline"
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="data" className="border-t py-20">
          <Heading id="data" />
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-xl text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Crop</th>
                  <th className="py-2 pr-4 text-right font-medium">Accessions</th>
                  <th className="py-2 pr-4 font-medium">Reference assembly</th>
                  <th className="py-2 pr-4 font-medium">Released</th>
                  <th className="py-2 font-medium">DOI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dataReleases.map((r) => (
                  <tr key={r.doi} className={"superseded" in r ? "text-muted-foreground" : undefined}>
                    <td className="py-2.5 pr-4">
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 shrink-0" style={{ background: cropCss(cropIndex(r.crop)) }} />
                        {r.crop}
                        {"superseded" in r && <span className="text-xs">(superseded)</span>}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{formatNumber(r.accessions)}</td>
                    <td className="py-2.5 pr-4">{r.assembly}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{formatDate(r.released)}</td>
                    <td className="py-2.5">
                      <a href={r.doi} className="underline-offset-4 hover:underline">
                        {r.doi.replace("https://doi.org/", "")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className={`${display} mt-16 text-2xl font-semibold tracking-tight`}>Mappings and standards</h3>
          <dl className="mt-6 grid gap-8 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name} className="border-l-2 border-(--p2) pl-4">
                <dt className="font-medium">{s.name}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news" className="border-t py-20">
          <Heading id="news" />
          <ol className="mt-10 divide-y border-y">
            {news.map((n) => (
              <li key={n.date + n.title} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
                <time dateTime={n.date} className="text-sm text-muted-foreground tabular-nums">
                  {formatDate(n.date)}
                </time>
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-medium">{n.title}</h3>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={n.kind === "tool" ? "size-2 bg-(--p2)" : "size-2 bg-(--p3)"} />
                      {n.kind === "tool" ? "Tool release" : "Data release"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <p className={`${display} max-w-3xl text-lg`}>{funding.acknowledgement}</p>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
            {funding.partners.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
