import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import type { HairlineFigureName } from "@/components/hairline";
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
  totalAccessions,
} from "@/content";
import { DimH, DimV, Drawing, H, Leader, M, W } from "./_components/drawing";
import { BlueprintInk } from "./_components/ink";
import { display, lettering, revision, Sheet } from "./_components/sheet";

export const metadata: Metadata = { title: `Blueprint | ${site.name}` };

const letter = (i: number) => String.fromCharCode(65 + i);

// Which line drawing stands in for each tool.
const toolFigure: Record<(typeof tools)[number]["slug"], HairlineFigureName> = {
  pretzel: "dna",
  genolink: "pea",
  fairybread: "lentil",
  brioche: "wheat",
};

// Balloon positions in the margins and the points their leaders land on, in drawing units.
const balloons: [number, number][] = [
  [20, 70],
  [460, 100],
  [20, 210],
  [460, 280],
  [20, 340],
];
const targets: [number, number][] = [
  [175, 175],
  [290, 180],
  [195, 215],
  [300, 225],
  [240, 245],
];

const maxQty = Math.max(...dataReleases.map((r) => r.accessions));

const buttonClass = `${display} inline-flex h-10 items-center gap-2 border-2 border-(--bp-ink) px-4 text-sm font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-(--bp-ink) hover:text-(--bp-ground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--bp-accent)`;

export default function BlueprintDesign() {
  const [genotypes, cropCount, toolCount] = site.stats;

  return (
    <PaletteProvider design="blueprint" defaultId={218} shortlist={[218, 187, 106, 161, 121, 157, 38, 57]}>
      <BlueprintInk>
        <header className="sticky top-0 z-20 border-b-2 border-(--bp-ink) bg-(--bp-ground)">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
            <a href="#about" className={`${display} shrink-0 text-lg font-bold uppercase tracking-[0.18em]`}>
              {site.name}
            </a>
            <nav aria-label="Sheets" className="ml-auto flex min-w-0 gap-4 overflow-x-auto sm:gap-6">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`${lettering} py-1 text-(--bp-soft) underline-offset-[6px] hover:text-(--bp-ink) hover:underline`}
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1">
          {/* About: the general arrangement, with the headline numbers drawn as dimensions. */}
          <Sheet id="about" sheet={1} title="General arrangement" revisions={news.slice(0, 3)}>
            <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,30rem)]">
              <div>
                <h1 className={`${display} text-4xl leading-[1.02] font-semibold uppercase sm:text-6xl`}>{site.tagline}</h1>
                <p className="mt-6 max-w-xl text-lg text-(--bp-soft)">{site.summary}</p>
                <p className="mt-4 max-w-xl border-l-4 border-(--bp-accent) pl-4 text-lg">{site.goal}</p>
              </div>
              <Drawing figure="wheat" label="Isometric view">
                <DimH x1={M} x2={W - M} y={18} from={M} text={`${toolCount.value} ${toolCount.label}`} />
                <DimV y1={M} y2={H - M} x={462} from={W - M} text={`${cropCount.value} ${cropCount.label}`} />
                <DimH x1={M} x2={W - M} y={H - 16} from={H - M} text={`${genotypes.value} ${genotypes.label}`} />
              </Drawing>
            </div>
            <dl className="sr-only">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-12 border-2 border-(--bp-ink)">
              <h3 className={`${lettering} border-b border-(--bp-ink) px-3 py-1.5`}>General notes</h3>
              <ul className="grid sm:grid-cols-3">
                {site.objectives.map((o, i) => (
                  <li key={o} className="flex gap-3 border-(--bp-ink) p-4 not-first:border-t sm:not-first:border-t-0 sm:not-first:border-l">
                    <span className={`${display} text-lg leading-6 font-bold text-(--bp-accent)`}>{letter(i)}</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Sheet>

          {/* Tools: each tool is a view of a part with lettered callouts for what it does. */}
          <Sheet id="tools" sheet={2} title="Tool assemblies" scale="Full size" revisions={news.filter((n) => n.kind === "tool").slice(0, 4)}>
            <div className="mt-8 grid gap-16">
              {tools.map((tool, t) => (
                <article key={tool.slug} className="grid items-start gap-8 border-t-2 border-(--bp-ink) pt-8 first:border-0 first:pt-0 md:grid-cols-2">
                  <div className={t % 2 ? "md:order-2" : ""}>
                    <Drawing figure={toolFigure[tool.slug]} intensity={0.5} label={`View ${letter(t)}: ${tool.name}`}>
                      {tool.capabilities.slice(0, balloons.length).map((c, i) => (
                        <Leader key={c} at={balloons[i]} to={targets[i]} letter={letter(i)} />
                      ))}
                    </Drawing>
                    {"image" in tool ? (
                      <figure className="mt-8 border-2 border-(--bp-ink) p-2">
                        <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="w-full" />
                        <figcaption className={`${lettering} mt-2 text-center`}>Detail, {tool.name} in use</figcaption>
                      </figure>
                    ) : null}
                  </div>
                  <div>
                    <h3 className={`${display} text-4xl font-bold uppercase tracking-wide sm:text-5xl`}>{tool.name}</h3>
                    <p className="mt-3 text-lg font-medium">{tool.summary}</p>
                    <p className="mt-3 text-(--bp-soft)">{tool.description}</p>
                    <ul className="mt-6 border-2 border-(--bp-ink)">
                      {tool.capabilities.map((c, i) => (
                        <li key={c} className="flex gap-3 border-(--bp-faint) px-3 py-2 not-first:border-t text-sm">
                          <span
                            aria-hidden
                            className={`${display} grid size-6 shrink-0 place-items-center rounded-full border-[1.4px] border-(--bp-accent) text-sm font-bold`}
                          >
                            {letter(i)}
                          </span>
                          <span className="pt-0.5">{c}</span>
                        </li>
                      ))}
                    </ul>
                    <a href={tool.url} className={`${buttonClass} mt-6`}>
                      Open {tool.name} <ArrowUpRightIcon className="size-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </Sheet>

          {/* Data: a bill of materials, accession counts as quantities. */}
          <Sheet id="data" sheet={3} title="Parts list" revisions={news.filter((n) => n.kind === "data").slice(0, 4)}>
            <p className={`${display} mt-3 text-3xl font-semibold uppercase sm:text-4xl`}>Genotype data releases</p>
            <div className="mt-8 overflow-x-auto border-2 border-(--bp-ink)">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead className={lettering}>
                  <tr className="border-b-2 border-(--bp-ink) [&>th]:border-r [&>th]:border-(--bp-ink) [&>th]:px-3 [&>th]:py-2 [&>th]:font-medium [&>th:last-child]:border-r-0">
                    <th>Part</th>
                    <th>Crop</th>
                    <th className="text-right">Qty</th>
                    <th className="w-40">Accessions</th>
                    <th>Reference assembly</th>
                    <th>Released</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {dataReleases.map((r, i) => {
                    const old = "superseded" in r;
                    return (
                      <tr
                        key={r.doi}
                        className={`border-b border-(--bp-faint) [&>td]:border-r [&>td]:border-(--bp-ink) [&>td]:px-3 [&>td]:py-2 [&>td:last-child]:border-r-0 ${old ? "text-(--bp-soft)" : ""}`}
                      >
                        <td className={`${display} font-bold text-(--bp-accent)`}>{letter(i)}</td>
                        <td className="font-medium whitespace-nowrap">
                          {r.crop}
                          {old ? <span className={`${lettering} ml-2 text-[0.65rem]`}>Superseded</span> : null}
                        </td>
                        <td className="text-right tabular-nums">{formatNumber(r.accessions)}</td>
                        <td aria-hidden>
                          <span
                            className={`block h-3 border border-(--bp-accent) ${old ? "" : "bg-[repeating-linear-gradient(-45deg,var(--bp-accent)_0_1.5px,transparent_1.5px_5px)]"}`}
                            style={{ width: `${(r.accessions / maxQty) * 100}%` }}
                          />
                        </td>
                        <td>{r.assembly}</td>
                        <td className="whitespace-nowrap">{formatDate(r.released)}</td>
                        <td>
                          <a href={r.doi} className="underline-offset-4 hover:underline">
                            {r.doi.replace("https://doi.org/", "")}
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-(--bp-ink) [&>td]:px-3 [&>td]:py-2">
                    <td colSpan={2} className={lettering}>
                      {genotypes.label}
                    </td>
                    <td className={`${display} text-right text-lg font-bold tabular-nums`}>{formatNumber(totalAccessions)}</td>
                    <td colSpan={4} className="text-(--bp-soft)">
                      Superseded releases are included in later ones and not counted twice.
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-12 border-2 border-(--bp-ink)">
              <h3 className={`${lettering} border-b border-(--bp-ink) px-3 py-1.5`}>Mappings and standards</h3>
              <dl className="grid sm:grid-cols-2">
                {standards.map((s, i) => (
                  <div
                    key={s.name}
                    className="border-(--bp-ink) p-4 not-first:border-t sm:nth-2:border-t-0 sm:even:border-l"
                  >
                    <dt className={`${display} text-xl font-semibold uppercase`}>
                      <span className="mr-2 text-(--bp-accent)">{letter(i)}</span>
                      {s.name}
                    </dt>
                    <dd className="mt-1 text-sm text-(--bp-soft)">{s.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Sheet>

          {/* News: the full revision history of the drawing set. */}
          <Sheet id="news" sheet={4} title="Revision history">
            <p className={`${display} mt-3 text-3xl font-semibold uppercase sm:text-4xl`}>Revisions to the drawing set</p>
            <ol className="mt-8 border-2 border-(--bp-ink)">
              <li
                aria-hidden
                className={`${lettering} hidden border-b-2 border-(--bp-ink) sm:grid sm:grid-cols-[4rem_8rem_8rem_1fr] [&>span]:px-3 [&>span]:py-2 [&>span:not(:last-child)]:border-r [&>span]:border-(--bp-ink)`}
              >
                <span>Rev</span>
                <span>Date</span>
                <span>Change</span>
                <span>Description</span>
              </li>
              {news.map((n) => (
                <li
                  key={n.date + n.title}
                  className="grid grid-cols-[3rem_1fr] border-(--bp-ink) not-last:border-b sm:grid-cols-[4rem_8rem_8rem_1fr] [&>*]:px-3 [&>*]:py-3"
                >
                  <span className={`${display} row-span-3 border-r border-(--bp-ink) text-2xl leading-none font-bold text-(--bp-accent) sm:row-span-1`}>
                    {revision(n)}
                  </span>
                  <time dateTime={n.date} className="pb-0! text-sm tabular-nums sm:border-r sm:border-(--bp-ink) sm:pb-3!">
                    {formatDate(n.date)}
                  </time>
                  <span className={`${lettering} pb-0! sm:border-r sm:border-(--bp-ink) sm:pb-3!`}>
                    <span className={`mr-2 inline-block size-2 border border-(--bp-accent) ${n.kind === "tool" ? "bg-(--bp-accent)" : ""}`} />
                    {n.kind === "tool" ? "Tool release" : "Data release"}
                  </span>
                  <div>
                    <h3 className="font-semibold">{n.title}</h3>
                    <p className="mt-1 text-sm text-(--bp-soft)">{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Sheet>
        </main>

        <footer className="px-3 pb-10 sm:px-6">
          <div className="mx-auto grid max-w-6xl border-2 border-(--bp-ink) md:grid-cols-[1fr_minmax(0,22rem)]">
            <div className="p-4 sm:p-6">
              <p className={`${lettering} text-(--bp-accent)`}>Funding</p>
              <p className="mt-2 max-w-2xl">{funding.acknowledgement}</p>
            </div>
            <ul className="border-t-2 border-(--bp-ink) md:border-t-0 md:border-l-2">
              {funding.partners.map((p) => (
                <li key={p} className={`${display} border-(--bp-ink) px-4 py-2.5 font-semibold uppercase tracking-wide not-first:border-t`}>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </BlueprintInk>
      <PalettePicker />
    </PaletteProvider>
  );
}
