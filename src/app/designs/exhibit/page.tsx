import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import { Hairline, type HairlineFigureName } from "@/components/hairline";
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
  type Crop,
  type ToolSlug,
} from "@/content";
import { Gallery } from "./_components/gallery";

export const metadata: Metadata = { title: `Exhibit | ${site.name}` };

// Deep, saturated wall colours that a white plinth and a spotlight read well against.
const shortlist = [258, 245, 286, 297, 335, 343, 314, 299, 271];

// Which figure stands on each tool's plinth, and which object sits in the case for each crop.
const toolFigure: Record<ToolSlug, HairlineFigureName> = {
  pretzel: "dna",
  genolink: "lupin",
  fairybread: "lentil",
  brioche: "wheat",
};
const cropFigure: Record<Crop, HairlineFigureName> = {
  Wheat: "wheat",
  Barley: "barley",
  Chickpea: "chickpea",
  "Field pea": "pea",
  Lentil: "lentil",
};

// Acquisition numbers in the museum's style: year of release, then order of arrival within that year.
const catalogue = dataReleases.map((r) => {
  const year = r.released.slice(0, 4);
  const sameYear = dataReleases.filter((o) => o.released.startsWith(year));
  const order = [...sameYear].sort((a, b) => a.released.localeCompare(b.released) || a.doi.localeCompare(b.doi));
  return { ...r, acquisition: `AGG.${year}.${order.indexOf(r) + 1}` };
});

const label = (id: (typeof sections)[number]["id"]) => sections.find((s) => s.id === id)?.label ?? id;
const host = (url: string) => new URL(url).host;

export default function ExhibitDesign() {
  return (
    <PaletteProvider design="exhibit" defaultId={258} shortlist={shortlist} className="exhibit">
      <Gallery
        header={
          <>
            <a href="#about" className="font-display shrink-0 text-xl leading-none sm:text-2xl">
              {site.name}
            </a>
            <nav aria-label="Rooms" className="ml-auto flex gap-4 overflow-x-auto text-sm sm:gap-6">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                  {s.label}
                </a>
              ))}
            </nav>
            <ThemeToggle />
          </>
        }
      >
        {/* Entrance: the exhibition title in wall vinyl, with the curatorial statement. */}
        <section id="about" data-stop data-wall="1" className="exhibit-room">
          <div className="exhibit-row flex flex-col gap-12 px-6 py-16 md:gap-20 md:px-16 md:py-14">
            <div className="flex max-w-xl flex-col justify-center">
              <h1 className="font-display text-6xl leading-[0.95] sm:text-8xl">{site.name}</h1>
              <p className="font-display mt-6 text-2xl leading-snug sm:text-3xl">{site.tagline}</p>
              <p className="exhibit-muted mt-8 max-w-lg">{site.summary}</p>
              <p className="mt-4 max-w-lg">{site.goal}</p>
            </div>
            <div className="flex w-full max-w-sm flex-col justify-center gap-10">
              <dl className="grid gap-6">
                {site.stats.map((s) => (
                  <div key={s.label} className="exhibit-rule border-t pt-3">
                    <dd className="font-display text-5xl leading-none tabular-nums">{s.value}</dd>
                    <dt className="exhibit-muted mt-2 text-sm">{s.label}</dt>
                  </div>
                ))}
              </dl>
              <ul className="exhibit-placard exhibit-trim grid gap-3 p-5 text-sm">
                {site.objectives.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span aria-hidden className="exhibit-swatch mt-1.5 size-2 shrink-0" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Current exhibitions: the lobby board. */}
        <section id="news" data-stop data-wall="2" aria-labelledby="news-title" className="exhibit-room">
          <div className="flex h-full flex-col justify-center gap-8 px-6 py-16 md:px-16 md:py-14">
            <h2 id="news-title" className="font-display shrink-0 text-5xl leading-none sm:text-6xl">
              {label("news")}
            </h2>
            <ol className="exhibit-board exhibit-board-grid grid gap-x-8 gap-y-6 p-6 sm:p-8">
              {news.map((n) => (
                <li key={n.date + n.title} className="border-t border-white/25 pt-3">
                  <div className="flex items-center justify-between gap-3 text-xs text-white/70">
                    <time dateTime={n.date}>{formatDate(n.date)}</time>
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className={`size-2 outline outline-white/50 ${n.kind === "tool" ? "bg-(--p3)" : "bg-(--p4)"}`}
                      />
                      {n.kind === "tool" ? "Tool release" : "Data release"}
                    </span>
                  </div>
                  <h3 className="font-display mt-2 text-xl leading-tight">{n.title}</h3>
                  <p className="mt-1.5 text-sm text-white/75">{n.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The gallery: each tool on a plinth under its own light, with a placard and wall text. */}
        <section id="tools" data-stop data-wall="3" aria-labelledby="tools-title" className="exhibit-room">
          <div className="exhibit-row flex flex-col">
            <div className="flex shrink-0 flex-col justify-center px-6 pt-16 pb-4 md:w-72 md:px-16 md:py-14">
              <h2 id="tools-title" className="font-display text-5xl leading-none sm:text-6xl">
                {label("tools")}
              </h2>
              <p className="exhibit-muted mt-4 text-sm">{tools.length} works on display</p>
            </div>
            {tools.map((tool) => (
              <article
                key={tool.slug}
                data-stop
                aria-labelledby={`tool-${tool.slug}`}
                className="relative flex flex-col gap-8 px-6 pt-10 pb-16 md:flex-row md:items-stretch md:gap-10 md:px-12 md:pt-0 md:pb-0"
              >
                <div className="relative flex flex-col items-center md:pt-[max(4rem,22dvh)]">
                  <div className="exhibit-spot" />
                  <Hairline figure={toolFigure[tool.slug]} className="exhibit-figure relative z-10 w-full max-w-sm" />
                  <div className="exhibit-plinth exhibit-plinth-fill -mt-[9%] h-20 w-3/4 md:h-auto" />
                </div>
                <div className="flex w-full flex-col justify-center gap-6 md:w-[34rem] md:flex-row md:items-center md:py-14">
                  <div className="exhibit-placard exhibit-trim shrink-0 p-5 md:w-64">
                    <h3 id={`tool-${tool.slug}`} className="font-display text-3xl leading-none">
                      {tool.name}
                    </h3>
                    <p className="mt-3 text-sm">{tool.summary}</p>
                    <p className="mt-3 border-t border-current/15 pt-3 text-xs opacity-70">{host(tool.url)}</p>
                    <a
                      href={tool.url}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
                    >
                      Visit {tool.name} <ArrowUpRightIcon className="size-4" />
                    </a>
                  </div>
                  <div className="text-sm md:max-w-64">
                    <p>{tool.description}</p>
                    <ul className="exhibit-muted mt-4 grid gap-1.5">
                      {tool.capabilities.map((c) => (
                        <li key={c} className="exhibit-rule border-t pt-1.5">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* The vitrine: every data release as a catalogued object, plus the reference collection. */}
        <section id="data" data-stop data-wall="4" aria-labelledby="data-title" className="exhibit-room">
          <div className="exhibit-row flex flex-col gap-10 px-6 py-16 md:gap-14 md:px-16 md:py-14">
            <div className="flex shrink-0 flex-col justify-center gap-8">
              <h2 id="data-title" className="font-display text-5xl leading-none sm:text-6xl">
                {label("data")}
              </h2>
              <ol className="exhibit-case exhibit-case-grid grid grid-cols-2 gap-x-4 gap-y-8 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-4">
                {catalogue.map((r) => (
                  <li key={r.doi} className={"superseded" in r ? "opacity-60" : undefined}>
                    <Hairline figure={cropFigure[r.crop]} className="w-full" />
                    <div className="mt-2 border-t border-current/20 pt-2 text-xs leading-relaxed">
                      <p className="flex justify-between gap-2 opacity-70">
                        <span>{r.acquisition}</span>
                        {"superseded" in r && <span>Superseded</span>}
                      </p>
                      <h3 className="font-display mt-1 text-xl leading-tight">{r.crop}</h3>
                      <p>
                        <span className="tabular-nums">{formatNumber(r.accessions)}</span> accessions
                      </p>
                      <p className="opacity-70">{r.assembly}</p>
                      <p className="opacity-70">{formatDate(r.released)}</p>
                      <a href={r.doi} className="mt-1 inline-block break-all underline underline-offset-2">
                        {r.doi.replace("https://doi.org/", "")}
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <dl className="grid shrink-0 content-center gap-4 md:w-80">
              {standards.map((s) => (
                <div key={s.name} className="exhibit-placard exhibit-trim p-4">
                  <dt className="font-display text-xl leading-tight">{s.name}</dt>
                  <dd className="mt-1.5 text-sm opacity-75">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Exit: the donor wall. */}
        <footer data-stop data-wall="1" className="exhibit-room">
          <div className="exhibit-row flex flex-col justify-center gap-8 px-6 py-16 md:w-[40rem] md:px-16 md:py-14">
            <ul className="grid gap-2">
              {funding.partners.map((p) => (
                <li key={p} className="font-display text-4xl leading-tight sm:text-5xl">
                  {p}
                </li>
              ))}
            </ul>
            <p className="exhibit-muted max-w-md text-sm">{funding.acknowledgement}</p>
            <p className="flex flex-wrap gap-6 text-sm">
              <a href={site.github} className="inline-flex items-center gap-1 underline underline-offset-4">
                GitHub <ArrowUpRightIcon className="size-4" />
              </a>
              <a href="#about" className="underline underline-offset-4">
                Back to the entrance
              </a>
            </p>
          </div>
        </footer>
      </Gallery>
      <PalettePicker />
    </PaletteProvider>
  );
}
