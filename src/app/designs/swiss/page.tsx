import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import { Hairline } from "@/components/hairline";
import { ThemeToggle } from "@/components/theme-toggle";
import { PalettePicker, PaletteProvider } from "@/components/palette";
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
} from "@/content";
import { cn } from "@/lib/utils";
import { GridOverlay, Row } from "./_components/grid";

export const metadata: Metadata = { title: `Swiss grid | ${site.name}` };

// The whole type scale: four sizes of one grotesque, nothing else.
const xl = "text-[clamp(3rem,8vw,7.5rem)] font-bold leading-[0.88] tracking-[-0.045em]";
const lg = "text-3xl font-bold leading-none tracking-tight md:text-4xl";
const md = "text-lg leading-snug";
const sm = "text-sm leading-snug";

const rule = "border-black dark:border-white";
const muted = "text-black/55 dark:text-white/55";

// Hairline strokes in the accent field's foreground, on the accent colour.
const figureColours = {
  "--hairline-plate": "var(--p1)",
  "--hairline-edge": "var(--p1-fg)",
  "--hairline-hi": "var(--p1-fg)",
  "--hairline-mid": "color-mix(in srgb, var(--p1-fg) 70%, var(--p1))",
  "--hairline-lo": "color-mix(in srgb, var(--p1-fg) 35%, var(--p1))",
  "--hairline-stroke": "1",
} as CSSProperties;

const host = (url: string) => new URL(url).host;
const [genotypes, cropCount, toolCount] = site.stats;

/** A section opens with a heavy rule and its heading set in a single palette colour field. */
function SectionHead({ id, accent, note }: { id: (typeof sections)[number]["id"]; accent: string; note?: ReactNode }) {
  const label = sections.find((s) => s.id === id)?.label;
  return (
    <div
      className={cn(
        "col-span-4 mb-10 flex min-h-36 flex-col justify-between p-4 md:col-span-3 md:mb-0 md:min-h-64",
        accent,
      )}
    >
      <p className={sm}>{note}</p>
      <h2 className={lg}>{label}</h2>
    </div>
  );
}

export default function SwissDesign() {
  return (
    <PaletteProvider design="swiss" defaultId={154} shortlist={[154, 39, 257, 22, 164, 179, 247, 267, 322]}>
      <div className="relative flex-1 bg-white text-black dark:bg-black dark:text-white">
        <GridOverlay />

        <header className={cn("sticky top-0 z-20 border-b bg-white dark:bg-black", rule)}>
          <Row className="items-center gap-y-1 py-3">
            <a href="#about" className={cn(sm, "col-span-3 font-bold md:col-span-3")}>
              {site.name}
            </a>
            <nav className={cn(sm, "col-span-4 row-start-2 flex gap-6 md:col-span-8 md:col-start-4 md:row-start-1")}>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="hover:underline hover:underline-offset-4">
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="col-span-1 col-start-4 -my-2 justify-self-end md:col-start-12 md:row-start-1">
              <ThemeToggle />
            </div>
          </Row>
        </header>

        <main className="relative z-10 [&>section]:scroll-mt-24 md:[&>section]:scroll-mt-16">
          <section id="about" className="pb-24 pt-10 md:pt-16">
            <Row className="gap-y-8">
              <h1 className={cn(xl, "col-span-4 md:col-span-8 md:row-start-1")}>{site.name}</h1>

              <figure
                className="col-span-4 flex flex-col justify-between bg-(--p1) text-(--p1-fg) md:col-span-4 md:col-start-9 md:row-span-3 md:row-start-1"
                style={figureColours}
              >
                <Hairline figure="wheat" intensity={0.55} className="w-full" />
                <figcaption className={cn(sm, "p-4")}>
                  <span className="font-bold">
                    {cropCount.value} {cropCount.label.toLowerCase()}
                  </span>
                  <br />
                  {crops.join(", ")}
                </figcaption>
              </figure>

              <p className={cn(md, "col-span-4 font-bold md:col-span-5 md:row-start-2")}>{site.tagline}</p>

              <div className="col-span-4 mt-8 md:col-span-5 md:col-start-4 md:row-start-3 md:mt-16">
                <p className={xl}>{genotypes.value}</p>
                <p className={cn(sm, "mt-3 border-t-2 pt-2", rule)}>{genotypes.label}</p>
              </div>
            </Row>

            <Row className="mt-20 gap-y-6">
              <p className={cn(md, "col-span-4 md:col-span-6 md:col-start-4")}>{site.summary}</p>
              <p className={cn(md, "col-span-4 font-bold md:col-span-6 md:col-start-4")}>{site.goal}</p>
            </Row>

            <Row className="mt-16 gap-y-6">
              <ul className="contents">
                {site.objectives.map((o, i) => (
                  <li
                    key={o}
                    className={cn(sm, "col-span-4 border-t-2 pt-3 md:col-span-3", i === 0 && "md:col-start-4", rule)}
                  >
                    {o}
                  </li>
                ))}
              </ul>
            </Row>
          </section>

          <section id="tools" className="pb-24">
            <Row className={cn("border-t-2 pt-6", rule)}>
              <SectionHead
                id="tools"
                accent="bg-(--p2) text-(--p2-fg)"
                note={`${toolCount.value} ${toolCount.label.toLowerCase()}`}
              />
              <ul className="col-span-4 md:col-span-9">
                {tools.map((tool) => (
                  <li key={tool.slug} className={cn("border-t first:border-t-0 md:first:border-t", rule)}>
                    <a
                      href={tool.url}
                      className="group grid grid-cols-4 gap-x-4 gap-y-1 py-4 md:grid-cols-9 md:gap-x-6 md:py-5"
                    >
                      <h3 className={cn(md, "col-span-4 font-bold md:col-span-2")}>{tool.name}</h3>
                      <p className={cn(md, "col-span-4 md:col-span-4")}>{tool.summary}</p>
                      <p
                        className={cn(
                          sm,
                          muted,
                          "col-span-4 flex items-start gap-1 break-words group-hover:text-black group-hover:underline group-hover:underline-offset-4 md:col-span-3 md:pt-0.5 dark:group-hover:text-white",
                        )}
                      >
                        {host(tool.url)}
                        <ArrowUpRightIcon className="mt-px size-4 shrink-0" />
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            </Row>
          </section>

          <section id="data" className="pb-24">
            <Row className={cn("border-t-2 pt-6", rule)}>
              <SectionHead
                id="data"
                accent="bg-(--p3) text-(--p3-fg)"
                note={`${dataReleases.length} releases, ${crops.length} crops`}
              />
              <div className="col-span-4 md:col-span-9">
                <table className={cn(sm, "w-full border-collapse text-left")}>
                  <thead>
                    <tr className={cn("border-b-2", rule)}>
                      <th className="py-2 pr-4 font-bold">Crop</th>
                      <th className="hidden py-2 pr-4 font-bold sm:table-cell">Reference assembly</th>
                      <th className="py-2 pr-4 font-bold">Released</th>
                      <th className="py-2 pr-4 text-right font-bold sm:pr-6">Accessions</th>
                      <th className="hidden py-2 font-bold sm:table-cell">DOI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataReleases.map((r) => {
                      const old = "superseded" in r;
                      return (
                        <tr key={r.doi} className={cn("border-b border-black/20 align-top dark:border-white/25", old && muted)}>
                          <td className="py-2.5 pr-4">
                            <a href={r.doi} className="font-bold hover:underline hover:underline-offset-4">
                              {r.crop}
                            </a>
                            {old && <span> (superseded)</span>}
                            <span className={cn("block sm:hidden", muted)}>{r.assembly}</span>
                          </td>
                          <td className="hidden py-2.5 pr-4 sm:table-cell">{r.assembly}</td>
                          <td className="whitespace-nowrap py-2.5 pr-4 tabular-nums">{formatDate(r.released)}</td>
                          <td className="py-2.5 pr-4 text-right tabular-nums sm:pr-6">{formatNumber(r.accessions)}</td>
                          <td className="hidden py-2.5 sm:table-cell">
                            <a href={r.doi} className="hover:underline hover:underline-offset-4">
                              {r.doi.replace("https://doi.org/", "")}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className={cn("border-t-2", rule)}>
                      <td colSpan={2} className="py-2.5 pr-4 font-bold sm:hidden">
                        {genotypes.label}
                      </td>
                      <td colSpan={3} className="hidden py-2.5 pr-4 font-bold sm:table-cell">
                        {genotypes.label}
                      </td>
                      <td className="py-2.5 pr-4 text-right font-bold tabular-nums sm:pr-6">{formatNumber(totalAccessions)}</td>
                      <td className="hidden sm:table-cell" />
                    </tr>
                  </tfoot>
                </table>

                <h3 className={cn(md, "mt-16 font-bold")}>Mappings and standards</h3>
                <dl className="mt-4 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                  {standards.map((s) => (
                    <div key={s.name} className={cn(sm, "border-t py-3", rule)}>
                      <dt className="font-bold">{s.name}</dt>
                      <dd className={cn("mt-1", muted)}>{s.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Row>
          </section>

          <section id="news" className="pb-24">
            <Row className={cn("border-t-2 pt-6", rule)}>
              <SectionHead id="news" accent="bg-(--p4) text-(--p4-fg)" note={formatDate(news[0].date)} />
              <ol className="col-span-4 md:col-span-9">
                {news.map((n) => (
                  <li
                    key={n.date + n.title}
                    className={cn(
                      "grid grid-cols-4 gap-x-4 gap-y-1 border-t py-4 first:border-t-0 md:grid-cols-9 md:gap-x-6 md:first:border-t",
                      rule,
                    )}
                  >
                    <div className={cn(sm, "col-span-4 md:col-span-2")}>
                      <time dateTime={n.date} className="tabular-nums">
                        {formatDate(n.date)}
                      </time>
                      <p className={muted}>{n.kind === "tool" ? "Tool release" : "Data release"}</p>
                    </div>
                    <h3 className={cn(md, "col-span-4 font-bold md:col-span-3")}>{n.title}</h3>
                    <p className={cn(sm, "col-span-4 md:col-span-4", muted)}>{n.body}</p>
                  </li>
                ))}
              </ol>
            </Row>
          </section>
        </main>

        <footer className="relative z-10 pb-32">
          <Row className={cn("gap-y-6 border-t-2 pt-6", rule)}>
            <p className={cn(sm, "col-span-4 font-bold md:col-span-3")}>{site.name}</p>
            <p className={cn(sm, "col-span-4 md:col-span-5 md:col-start-4")}>{funding.acknowledgement}</p>
            <ul className={cn(sm, "col-span-4 md:col-span-3 md:col-start-10")}>
              {funding.partners.map((p) => (
                <li key={p}>{p}</li>
              ))}
              <li className="mt-3">
                <a href={site.github} className="inline-flex items-center gap-1 hover:underline hover:underline-offset-4">
                  {site.github.replace("https://", "")}
                  <ArrowUpRightIcon className="size-4" />
                </a>
              </li>
            </ul>
          </Row>
        </footer>
      </div>
      <PalettePicker />
    </PaletteProvider>
  );
}
