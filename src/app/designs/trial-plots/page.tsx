import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  crops,
  formatNumber,
  funding,
  sections,
  site,
  type Crop,
  type SectionId,
} from "@/content";
import { FieldMap } from "./_components/field-map";
import {
  Buffer,
  NewsRanges,
  Protocols,
  Register,
  ToolRanges,
} from "./_components/ranges";
import { cropLook, drillRows, isSuperseded, plots } from "./_lib/plots";

export const metadata: Metadata = { title: `Trial plots | ${site.name}` };

const mono = "font-(family-name:--tp-mono)";
const display = "font-(family-name:--tp-display)";

// Each section is a numbered range of the trial, so plot ids read 1xx, 2xx, 3xx, 4xx.
const ranges = {
  about: 100,
  tools: 200,
  data: 300,
  news: 400,
} as const satisfies Record<SectionId, number>;

const cropTotal = (crop: Crop) =>
  plots
    .filter((p) => p.crop === crop && !isSuperseded(p))
    .reduce((sum, p) => sum + p.accessions, 0);

/** Section heading: the range number in mono beside a big display title. */
function RangeHeading({
  id,
  children,
}: {
  id: SectionId;
  children: ReactNode;
}) {
  return (
    <h2
      className={`flex items-baseline gap-4 text-6xl leading-none font-extrabold tracking-tight sm:text-8xl ${display}`}
    >
      <span
        className={`text-base font-normal tracking-normal tabular-nums sm:text-xl ${mono}`}
      >
        {ranges[id]}
      </span>
      {children}
    </h2>
  );
}

/** Key to the field map: one swatch per crop, sown with that crop's drill rows. */
function CropKey() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-3">
      {crops.map((crop) => (
        <li key={crop} className="flex items-center gap-2.5">
          <span
            className="size-5"
            style={{
              backgroundColor: cropLook[crop].fill,
              ...drillRows(cropLook[crop].angle),
            }}
          />
          <span className={`text-lg font-bold ${display}`}>{crop}</span>
          <span className={`text-xs tabular-nums ${mono}`}>
            {formatNumber(cropTotal(crop))}
          </span>
        </li>
      ))}
    </ul>
  );
}

// An aerial survey of a field trial: every data release is a plot sized by accessions, and the
// rest of the page keeps the same plot grid, plot ids and buffer rows.
export default function TrialPlotsDesign() {
  return (
    <PaletteProvider
      design="trial-plots"
      defaultId={278}
      shortlist={[278, 243, 262, 249, 304, 319, 343, 299]}
    >
      <header className="sticky top-0 z-20 border-b-2 border-foreground bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 px-4 py-2 sm:px-6">
          <a
            href="#about"
            className={`text-xl font-extrabold tracking-tight ${display}`}
          >
            {site.name}
          </a>
          <nav
            className={`order-last flex w-full justify-between text-xs sm:order-none sm:ml-auto sm:w-auto sm:gap-6 ${mono}`}
          >
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="py-1 underline-offset-4 hover:underline"
              >
                <span className="tabular-nums opacity-60">{ranges[s.id]}</span>{" "}
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 [&>section]:scroll-mt-24 [&>section]:py-16 sm:[&>section]:py-24">
        <section id="about">
          <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
            <h1
              className={`text-5xl leading-[0.92] font-extrabold tracking-tight [font-stretch:80%] sm:text-7xl lg:text-8xl ${display}`}
            >
              {site.tagline}
            </h1>
            <p className="text-base leading-relaxed">{site.summary}</p>
          </div>

          <div className="mt-12">
            <FieldMap />
          </div>
          <div className="mt-4 flex flex-col gap-4 md:ml-7 md:flex-row md:items-start md:justify-between">
            <CropKey />
            <p className={`max-w-xs text-[11px] leading-relaxed ${mono}`}>
              Plot area is proportional to accessions. Hatched plots were
              superseded by a later release. Select a plot to open its DOI.
            </p>
          </div>

          <dl className="mt-20 grid border-y-2 border-foreground sm:grid-cols-3">
            {site.stats.map((s, i) => (
              <div
                key={s.label}
                className={`py-6 sm:px-6 ${i > 0 ? "border-t border-foreground/25 sm:border-t-0 sm:border-l" : "sm:pl-0"}`}
              >
                <dd
                  className={`text-6xl leading-none font-extrabold tracking-tight tabular-nums sm:text-7xl ${display}`}
                >
                  {s.value}
                </dd>
                <dt className={`mt-3 text-xs tracking-wider uppercase ${mono}`}>
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_1fr]">
            <p
              className={`text-3xl leading-tight font-bold tracking-tight sm:text-4xl ${display}`}
            >
              {site.goal}
            </p>
            <ol className="grid gap-1.5">
              {site.objectives.map((o, i) => (
                <li
                  key={o}
                  className="grid grid-cols-[3rem_1fr] items-baseline border-t border-foreground/25 pt-3"
                >
                  <span className={`text-sm tabular-nums ${mono}`}>
                    T{i + 1}
                  </span>
                  <span className="text-lg leading-snug">{o}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Buffer />

        <section id="tools">
          <RangeHeading id="tools">Tools</RangeHeading>
          <div className="mt-10">
            <ToolRanges />
          </div>
        </section>

        <Buffer />

        <section id="data">
          <RangeHeading id="data">Data</RangeHeading>
          <div className="mt-10">
            <Register />
          </div>
          <h3
            className={`mt-20 mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl ${display}`}
          >
            Mappings and standards
          </h3>
          <Protocols />
        </section>

        <Buffer />

        <section id="news">
          <RangeHeading id="news">News</RangeHeading>
          <div className="mt-10">
            <NewsRanges />
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[2fr_1fr]">
          <p
            className={`text-2xl leading-snug font-bold tracking-tight sm:text-3xl ${display}`}
          >
            {funding.acknowledgement}
          </p>
          <div className={`text-xs leading-relaxed ${mono}`}>
            <ul className="grid gap-2">
              {funding.partners.map((p) => (
                <li key={p} className="border-t border-foreground/25 pt-2">
                  {p}
                </li>
              ))}
            </ul>
            <a
              href={site.github}
              className="mt-6 inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline"
            >
              GitHub <ArrowUpRightIcon className="size-3.5" />
            </a>
          </div>
        </div>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
