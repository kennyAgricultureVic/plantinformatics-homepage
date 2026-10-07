import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  type SectionId,
} from "@/content";
import { cn } from "@/lib/utils";
import { binomials, specimens } from "./_components/botany";
import { ColourChart } from "./_components/colour-chart";
import { Field, Label, Pencil, ScaleBar, Sheet, Specimen, Stamp, ruleInk, standardTapes, stampInk } from "./_components/mount";
import { ToolSheet } from "./_components/tool-sheet";

export const metadata: Metadata = { title: `Herbarium | ${site.name}` };

const numerals = ["I", "II", "III", "IV"] as const;
const drawer = (id: SectionId) => {
  const i = sections.findIndex((s) => s.id === id);
  return { numeral: numerals[i], label: sections[i].label };
};

/** Each crop's current holding: accessions across releases that have not been superseded. */
const holdings = crops.map((crop) => {
  const releases = dataReleases.filter((r) => r.crop === crop);
  return {
    crop,
    accessions: releases.reduce((sum, r) => ("superseded" in r ? sum : sum + r.accessions), 0),
    assembly: releases[0].assembly,
  };
});

const years = [...new Set(news.map((n) => n.date.slice(0, 4)))];

// Section heading set like a cabinet drawer label: stamp-ink numeral, italic serif name.
function DrawerHeading({ id, children }: { id: SectionId; children?: ReactNode }) {
  const { numeral, label } = drawer(id);
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-current/20 pb-4">
      <h2 className="text-6xl leading-[0.85] font-medium italic sm:text-8xl">
        <span className={cn("mr-4 font-(family-name:--hb-type) text-2xl font-bold not-italic sm:text-3xl", stampInk)}>{numeral}.</span>
        {label}
      </h2>
      {children}
    </div>
  );
}

// Header: wordmark and a drawer index for navigation.
function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-current/10 bg-[#efe8d8]/90 backdrop-blur-sm dark:bg-black/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#about" className="shrink-0 text-xl font-semibold whitespace-nowrap italic">
          {site.name}
        </a>
        <nav aria-label="Sections" className="ml-auto flex min-w-0 gap-3 overflow-x-auto [scrollbar-width:none] font-(family-name:--hb-type) text-[11px] tracking-widest uppercase sm:gap-6">
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="shrink-0 underline-offset-4 hover:underline">
              <span className={cn("mr-1 hidden font-bold sm:inline", stampInk)}>{numerals[i]}</span>
              {s.label}
            </a>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}

// About: the type specimen. A full sheet with wheat taped down, the mission as its description
// and the headline stats typed onto the determination label.
function About() {
  return (
    <section id="about" className="scroll-mt-16 px-4 pt-6 sm:px-6 sm:pt-10">
      <Sheet className="mx-auto grid max-w-6xl gap-10 p-5 sm:p-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:p-12">
        <div className="flex flex-col lg:order-2">
          <div className="flex items-start justify-between gap-4 font-(family-name:--hb-type) text-[11px] tracking-[0.3em] uppercase">
            <p className="pt-2">
              Herbarium
              <br />
              {site.name}
            </p>
            <Stamp top="Type" bottom={formatNumber(holdings.reduce((n, h) => n + h.accessions, 0))} />
          </div>
          <h1 className="mt-8 text-5xl leading-[0.95] font-medium sm:text-6xl lg:text-7xl">{site.tagline}</h1>
          <p className="mt-8 text-xl leading-relaxed">{site.summary}</p>
          <p className={cn("mt-6 border-l-2 pl-4 text-2xl leading-snug italic", ruleInk)}>{site.goal}</p>
          <ol className="mt-8 space-y-3">
            {site.objectives.map((o, i) => (
              <li key={o} className="grid grid-cols-[2rem_minmax(0,1fr)] text-lg leading-snug">
                <span className={cn("font-(family-name:--hb-type) text-sm font-bold", stampInk)}>{i + 1}.</span>
                {o}
              </li>
            ))}
          </ol>
          <Label heading="Determination" className="mt-10">
            <dl className="mt-3 space-y-2">
              {site.stats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <dt className="font-(family-name:--hb-type) text-[12px]">{s.label}</dt>
                  <span aria-hidden className="flex-1 border-b border-dotted border-current/40" />
                  <dd className="text-3xl leading-none font-semibold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Label>
        </div>

        <div className="relative flex flex-col lg:order-1 lg:min-h-[44rem]">
          <div className="relative flex-1">
            <Specimen
              drawing={<specimens.Wheat className="absolute inset-0 h-full w-full" />}
              tapes={[...standardTapes, { top: 62, left: 18, width: 20, rotate: 20 }]}
              className="h-[28rem] sm:h-[36rem] lg:absolute lg:inset-y-0 lg:left-1/2 lg:h-full lg:-translate-x-1/2"
            />
            <Pencil className="absolute top-0 left-0 max-w-40 -rotate-6">{binomials.Wheat}</Pencil>
          </div>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <ColourChart className="w-full max-w-72" />
            <ScaleBar />
          </div>
        </div>
      </Sheet>
    </section>
  );
}

// Tools: one mounted specimen sheet per tool.
function Tools() {
  return (
    <section id="tools" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-28 sm:px-6">
      <DrawerHeading id="tools" />
      <div className="grid gap-10">
        {tools.map((tool, i) => (
          <ToolSheet key={tool.slug} tool={tool} index={i} />
        ))}
      </div>
    </section>
  );
}

// Data: a drawer of five crop sheets, then the accession register of every release.
function Data() {
  return (
    <section id="data" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-28 sm:px-6">
      <DrawerHeading id="data" />

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {holdings.map(({ crop, accessions }, i) => {
          const Drawing = specimens[crop];
          return (
            <li key={crop} className={cn(i === holdings.length - 1 && "col-span-2 sm:col-span-1")}>
              <Sheet className="flex h-full flex-col p-3">
                <Specimen
                  drawing={<Drawing className="absolute inset-0 h-full w-full" />}
                  tapes={[{ top: 83, left: 28, width: 44, rotate: i % 2 ? 7 : -7 }]}
                  className="h-64"
                />
                <p className="mt-3 text-lg leading-tight italic">{binomials[crop]}</p>
                <p className="font-(family-name:--hb-type) text-[11px] tracking-widest uppercase">{crop}</p>
                <Pencil className={cn("mt-2 text-base", stampInk)}>{formatNumber(accessions)} acc.</Pencil>
              </Sheet>
            </li>
          );
        })}
      </ul>

      <div className="mt-14 overflow-x-auto">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="mb-4 text-left text-3xl italic">Accession register</caption>
          <thead className={cn("border-y-2 font-(family-name:--hb-type) text-[11px] tracking-widest uppercase", ruleInk)}>
            <tr>
              <th className="py-2 pr-4 font-normal">Reg.</th>
              <th className="py-2 pr-4 font-normal">Taxon</th>
              <th className="py-2 pr-4 text-right font-normal">Accessions</th>
              <th className="py-2 pr-4 font-normal">Reference assembly</th>
              <th className="py-2 pr-4 font-normal">Released</th>
              <th className="py-2 font-normal">DOI</th>
            </tr>
          </thead>
          <tbody>
            {dataReleases.map((r, i) => {
              const superseded = "superseded" in r;
              return (
                <tr key={r.doi} className="border-b border-current/15 align-baseline">
                  <td className={cn("py-3 pr-4 font-(family-name:--hb-type) text-[12px]", stampInk)}>
                    {String(dataReleases.length - i).padStart(3, "0")}
                  </td>
                  <td className="py-3 pr-4 text-lg">
                    <i>{binomials[r.crop]}</i> <span className="text-base">({r.crop})</span>
                  </td>
                  <td className={cn("py-3 pr-4 text-right text-2xl font-semibold tabular-nums", superseded && "line-through decoration-1 opacity-60")}>
                    {formatNumber(r.accessions)}
                  </td>
                  <td className="py-3 pr-4 font-(family-name:--hb-type) text-[12px]">{r.assembly}</td>
                  <td className="py-3 pr-4 font-(family-name:--hb-type) text-[12px] whitespace-nowrap">{formatDate(r.released)}</td>
                  <td className="py-3 font-(family-name:--hb-type) text-[12px] whitespace-nowrap">
                    <a href={r.doi} className="underline decoration-current/30 underline-offset-4 hover:decoration-current">
                      {r.doi.replace("https://doi.org/", "")}
                    </a>
                    {superseded && (
                      <span className={cn("ml-3 inline-block -rotate-3 border border-current px-1 text-[10px] tracking-widest uppercase", stampInk)}>
                        Superseded
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="mt-16 text-3xl italic">Mappings and standards</h3>
      <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        {standards.map((s, i) => (
          <div key={s.name} className="grid grid-cols-[2rem_minmax(0,1fr)] border-t border-current/20 pt-3">
            <span className={cn("font-(family-name:--hb-type) text-[12px] font-bold", stampInk)}>{numerals[i] ?? i + 1}</span>
            <div>
              <dt className="font-(family-name:--hb-type) text-[13px] font-bold">{s.name}</dt>
              <dd className="mt-1 text-lg leading-snug">{s.detail}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

// News: the collection log, grouped by year, with a ruled margin in stamp ink.
function News() {
  return (
    <section id="news" className="mx-auto max-w-6xl scroll-mt-16 px-4 pt-28 sm:px-6">
      <DrawerHeading id="news" />
      {years.map((year) => (
        <div key={year} className="grid gap-4 pb-10 md:grid-cols-[10rem_minmax(0,1fr)]">
          <h3 className="text-5xl leading-none italic md:sticky md:top-20 md:self-start">{year}</h3>
          <ol>
            {news
              .filter((n) => n.date.startsWith(year))
              .map((n) => (
                <li key={n.date + n.title} className="grid grid-cols-[5.5rem_minmax(0,1fr)] sm:grid-cols-[7rem_minmax(0,1fr)]">
                  <div className="pt-4 pr-3 font-(family-name:--hb-type) text-[11px] leading-snug">
                    <span className={stampInk}>No. {String(news.length - news.indexOf(n)).padStart(3, "0")}</span>
                    <br />
                    <time dateTime={n.date}>{formatDate(n.date).replace(/ \d{4}$/, "")}</time>
                  </div>
                  <div className={cn("border-b border-l-2 border-b-current/15 py-4 pl-4", ruleInk)}>
                    <p className="flex items-center gap-2 font-(family-name:--hb-type) text-[10px] tracking-widest uppercase">
                      <span aria-hidden className={cn("size-2", n.kind === "tool" ? "bg-(--p1)" : "rounded-full bg-(--p3) dark:bg-[color-mix(in_oklab,var(--p3)_60%,white)]")} />
                      {n.kind === "tool" ? "Tool release" : "Data release"}
                    </p>
                    <h4 className="mt-1 text-2xl leading-tight font-semibold">{n.title}</h4>
                    <p className="mt-1 text-lg leading-snug">{n.body}</p>
                  </div>
                </li>
              ))}
          </ol>
        </div>
      ))}
    </section>
  );
}

// Footer: the funding acknowledgement printed as an "ex herbario" label.
function Footer() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pt-20 pb-16 sm:px-6">
      <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
        <Label heading="Ex herbario" className="max-w-2xl">
          <p className="mt-3 text-xl leading-snug">{funding.acknowledgement}</p>
          <dl className="mt-4 space-y-0.5">
            {funding.partners.map((p, i) => (
              <Field key={p} name={i === 0 ? "With" : ""}>
                {p}
              </Field>
            ))}
          </dl>
        </Label>
        <div className="space-y-3">
          <p className="text-5xl font-medium italic">{site.name}</p>
          <a href={site.github} className="block font-(family-name:--hb-type) text-[12px] tracking-widest uppercase underline-offset-4 hover:underline">
            Source on GitHub
          </a>
          <ScaleBar />
        </div>
      </div>
    </footer>
  );
}

/** Herbarium sheets: every tool is a mounted specimen and every data release an entry in the register. */
export default function HerbariumDesign() {
  return (
    <PaletteProvider
      design="herbarium"
      defaultId={249}
      shortlist={[249, 243, 258, 275, 279, 304, 245, 199]}
      className="w-full overflow-x-clip bg-[#efe8d8] font-(family-name:--hb-serif) text-[#211c13] dark:bg-black dark:text-white"
    >
      <Header />
      <main>
        <About />
        <Tools />
        <Data />
        <News />
      </main>
      <Footer />
      <PalettePicker className="border-current/15 bg-transparent font-(family-name:--hb-type)" />
    </PaletteProvider>
  );
}
