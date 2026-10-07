import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatNumber, funding, news, sections, site, standards, tools, totalAccessions, type ToolSlug } from "@/content";
import { CellType, cellKindNames, type CellKind } from "./_components/cell-type";
import { EpidermisBand, NewsFile } from "./_components/news-file";
import { ReleaseSlice } from "./_components/release-slice";
import { StemSection } from "./_components/stem-section";
import { ACCESSIONS_PER_CELL, LLOYD_STEPS, stemZones, totalCells } from "./_components/tissue";

export const metadata: Metadata = { title: `Tissue | ${site.name}` };

/** Which cell type each tool is drawn as, and why. */
const toolCells: Record<ToolSlug, { kind: CellKind; why: string }> = {
  pretzel: { kind: "xylem", why: "The vessel everything flows through: every released dataset, in one open pipe." },
  genolink: { kind: "guard", why: "A pair that opens a pore between two sides, as Genolink joins genotype and passport data." },
  fairybread: { kind: "parenchyma", why: "Ground tissue where the store is kept: the diversity of a whole collection." },
  brioche: { kind: "trichome", why: "A cell that reaches outward, as Brioche reaches markers onto each new reference." },
};

function SectionHead({ id, title, note }: { id: string; title: string; note: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-foreground pb-5">
      <h2 id={`${id}-title`} className="text-6xl font-extrabold leading-[0.9] tracking-tighter sm:text-8xl">
        {title}
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground sm:text-right">{note}</p>
    </div>
  );
}

// Tissue: every drawing on the page is a Voronoi tessellation evened out by Lloyd relaxation and read as
// a stained microscope section. One cell is always 100 accessions; the hero is a stem in release rings,
// the tools are cell types cut from the same tessellation, the data is a slice in bands.
export default function TissueDesign() {
  const stemCells = totalCells(stemZones);

  return (
    <PaletteProvider
      design="tissue"
      defaultId={299}
      shortlist={[299, 271, 242, 316, 331, 307, 346, 260, 314]}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <a href="#about" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <span className="grid size-6 grid-cols-2 gap-px border-2 border-foreground bg-foreground" aria-hidden>
              <span className="bg-(--p1)" />
              <span className="bg-(--p2)" />
              <span className="bg-(--p3)" />
              <span className="bg-(--p4)" />
            </span>
            {site.name}
          </a>
          <nav className="ml-auto hidden gap-6 text-sm font-medium sm:flex">
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
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="lg:sticky lg:top-24">
              <p className="text-sm font-medium text-muted-foreground">Transverse section, stained, one cell per {ACCESSIONS_PER_CELL} accessions</p>
              <h1 className="mt-5 text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-7xl">{site.tagline}</h1>
              <p className="mt-8 text-[clamp(4rem,12vw,8rem)] font-light leading-none tracking-tighter tabular-nums">
                {formatNumber(totalAccessions)}
              </p>
              <p className="mt-2 text-lg">genotyped accessions, drawn as {formatNumber(stemCells)} cells</p>

              <dl className="mt-10 grid gap-3 border-t-2 border-foreground pt-5 text-sm">
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4">
                  <dt className="text-muted-foreground">Cell</dt>
                  <dd className="text-base">V(pᵢ) = {"{"} x : |x − pᵢ| ≤ |x − pⱼ| for every j {"}"}</dd>
                </div>
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4">
                  <dt className="text-muted-foreground">Relaxation</dt>
                  <dd className="text-base">pᵢ ← centroid of V(pᵢ), {LLOYD_STEPS} times</dd>
                </div>
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4">
                  <dt className="text-muted-foreground">Scale</dt>
                  <dd className="text-base">
                    1 cell = {ACCESSIONS_PER_CELL} accessions · n = {formatNumber(stemCells)}
                  </dd>
                </div>
              </dl>
            </div>
            <StemSection />
          </div>

          <div className="mt-24 grid gap-12 border-t-2 border-foreground pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">{site.summary}</p>
              <p className="text-2xl font-semibold leading-snug tracking-tight">{site.goal}</p>
            </div>
            <div>
              <dl className="grid sm:grid-cols-3">
                {site.stats.map((s, i) => (
                  <div key={s.label} className="border-t border-foreground/20 py-4 sm:border-t-0 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0">
                    <dd className="flex items-center gap-3 text-5xl font-extrabold tracking-tighter tabular-nums">
                      <span className="size-3 border border-foreground/60" style={{ background: `var(--p${i + 1})` }} />
                      {s.value}
                    </dd>
                    <dt className="mt-2 text-sm text-muted-foreground">{s.label}</dt>
                  </div>
                ))}
              </dl>
              <ul className="mt-10 grid gap-4">
                {site.objectives.map((o) => (
                  <li key={o} className="border-t border-foreground/20 pt-4 leading-relaxed">
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="tools" aria-labelledby="tools-title" className="pb-24">
          <SectionHead id="tools" title="Tools" note={`${tools.length} tools, each drawn as a cell type cut from the same tessellation as the stem.`} />
          <div className="grid gap-x-12 sm:grid-cols-2">
            {tools.map((tool, i) => {
              const cell = toolCells[tool.slug];
              return (
                <article key={tool.slug} className="border-b border-foreground/20 py-12">
                  <div className="grid grid-cols-[9rem_minmax(0,1fr)] items-end gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
                    <CellType
                      kind={cell.kind}
                      color={`var(--p${i + 1})`}
                      seed={`tissue:tool:${tool.slug}`}
                      className="block w-full border-2 border-foreground"
                    />
                    <div>
                      <p className="text-sm font-semibold">
                        {cellKindNames[cell.kind]}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{cell.why}</p>
                    </div>
                  </div>
                  <h3 className="mt-8 text-5xl font-extrabold tracking-tighter">{tool.name}</h3>
                  <p className="mt-3 text-xl font-medium leading-snug">{tool.summary}</p>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{tool.description}</p>
                  <ul className="mt-6 grid gap-2 text-sm">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-1.5 size-2 shrink-0 border border-foreground/60" style={{ background: `var(--p${i + 1})` }} />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    {"image" in tool ? (
                      <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="border-2 border-foreground" />
                    ) : (
                      <ImagePlaceholder label={tool.name} className="border-foreground/30" />
                    )}
                  </div>
                  <a href={tool.url} className="mt-6 inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </article>
              );
            })}
          </div>
        </section>

        <section id="data" aria-labelledby="data-title" className="pb-24">
          <SectionHead
            id="data"
            title="Data"
            note="Every release as a band of cells, newest at the top. Count the cells and multiply by a hundred."
          />
          <div className="mt-12">
            <ReleaseSlice />
          </div>

          <h3 className="mt-20 text-4xl font-extrabold tracking-tighter">Mappings and standards</h3>
          <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name} className="border-t-2 border-foreground pt-4">
                <dt className="text-xl font-semibold tracking-tight">{s.name}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news" aria-labelledby="news-title" className="pb-24">
          <SectionHead
            id="news"
            title="News"
            note={`${news.length} items as a file of cells placed by date, newest on the left. Each stained cell is an item, each plain cell a quiet month.`}
          />
          <div className="mt-12">
            <NewsFile />
          </div>
        </section>

        <aside aria-labelledby="method-title" className="grid gap-10 border-t-2 border-foreground py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          <h2 id="method-title" className="text-4xl font-extrabold leading-tight tracking-tighter sm:text-5xl">
            How the sections are cut
          </h2>
          <div className="grid gap-4 text-sm leading-relaxed sm:grid-cols-2">
            <p>
              Each cell is a Voronoi region: the part of the plane closer to its site than to any other. Here every cell
              starts as the whole section and is trimmed by the bisector with each nearby site, nearest first.
            </p>
            <p>
              Random sites give ragged cells of every size. Lloyd relaxation moves each site to the middle of its cell and
              cuts again; after {LLOYD_STEPS} rounds the cells settle into the even, many-sided look of real parenchyma.
            </p>
            <p>
              Even cells have even areas, so a ring or band of cells is as large as the count it stands for: one cell, one
              hundred accessions, in the stem and in the slice. Cells are handed to releases by distance from the centre,
              or from the top of the slice.
            </p>
            <p>
              Every site comes from a seeded generator fed by the content, so the same releases always grow the same
              tissue. Stains are the palette below; the fifth crop is left pale, like tissue that did not take the dye.
            </p>
          </div>
        </aside>
      </main>

      <footer className="border-t-2 border-foreground">
        <EpidermisBand className="block h-16 w-full" />
        <div className="mx-auto grid max-w-7xl gap-8 border-t-2 border-foreground px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <p className="text-2xl font-semibold leading-snug tracking-tight">{funding.acknowledgement}</p>
          <ul className="grid content-start gap-2 text-sm">
            {funding.partners.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <span className="size-3 border border-foreground/60" style={{ background: `var(--p${i + 1})` }} />
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
