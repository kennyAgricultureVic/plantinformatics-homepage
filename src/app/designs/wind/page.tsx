import type { Metadata } from "next";
import type { ReactNode } from "react";
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
  totalAccessions,
} from "@/content";
import {
  HeroField,
  NewsField,
  ReleaseField,
  ToolsWind,
} from "./_components/fields";
import { Inks } from "./_components/inks";
import { WindLinesProvider, WindLinesToggle } from "./_components/wind-lines";
import {
  ACCESSIONS_PER_STEM,
  VEER,
  WAVELENGTH,
  cropTotals,
  newsX,
  slotOfCrop,
  slotVar,
  totalStems,
  windSpeed,
  type Slot,
} from "./_components/wind";

export const metadata: Metadata = { title: `Wind over a crop | ${site.name}` };

const maxAccessions = Math.max(...dataReleases.map((r) => r.accessions));
const newsYears = [...new Set(news.map((n) => n.date.slice(0, 4)))].toSorted();
const newsYearsDesc = newsYears.toReversed();
const newsKinds = [
  { kind: "data", label: "Data release, stem with an ear", slot: 0 as Slot },
  { kind: "tool", label: "Tool release, stem with a pod", slot: 4 as Slot },
] as const;

/** Three leaning stems, the mark in the header. */
function StemMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6">
      <path
        d="M5 22Q5 12 9 4M12 22Q12 13 16 6M19 22Q19 15 22 10"
        fill="none"
        stroke="var(--wind-ink0)"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The node on the news stem, matching the field: an ear for a data release, a pod for a tool release. */
function NewsNode({ kind }: { kind: "tool" | "data" }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className="absolute top-1 -left-[11px] size-5"
    >
      {kind === "data" ? (
        <ellipse cx={10} cy={10} rx={4.5} ry={7} fill={slotVar(0)} />
      ) : (
        <path
          d="M10 18C3 12 4 5 10 2c6 3 7 10 0 16Z"
          fill="var(--background)"
          stroke={slotVar(4)}
          strokeWidth={2}
        />
      )}
    </svg>
  );
}

/** Section heading with its wind speed: a real data value, plotted on the same dial as the hero. */
function SectionTitle({
  children,
  value,
  unit,
}: {
  children: ReactNode;
  value: number;
  unit: string;
}) {
  const speed = windSpeed(value);
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b-2 border-foreground pb-5">
      <h2 className="text-6xl leading-[0.85] font-extrabold tracking-tighter sm:text-8xl">
        {children}
      </h2>
      <div className="w-full sm:w-72">
        <p className="flex items-baseline justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Wind speed</span>
          <span className="text-3xl font-bold tabular-nums">
            {formatNumber(value)}
          </span>
        </p>
        <p className="text-right text-sm text-muted-foreground">{unit}</p>
        <div className="mt-2 h-1.5 bg-foreground/10" aria-hidden>
          <div
            className="h-full bg-(--wind-ink0)"
            style={{ width: `${speed * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Wind over a crop: a seeded flow field blowing across a field of stems. Every stem is a hundred
// genotyped accessions, every section's wind speed is one of its own numbers.
export default function WindDesign() {
  return (
    <PaletteProvider
      design="wind"
      defaultId={297}
      shortlist={[297, 278, 312, 262, 252, 304, 299, 249, 286]}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <Inks>
        <WindLinesProvider>
          <header className="sticky top-0 z-30 border-b border-foreground/10 bg-background/85 backdrop-blur">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
              <a
                href="#about"
                className="flex shrink-0 items-center gap-2 font-bold tracking-tight"
              >
                <StemMark />
                {site.name}
              </a>
              <nav className="ml-auto hidden gap-6 text-sm sm:flex">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
              <div className="ml-auto flex sm:ml-0">
                <WindLinesToggle />
                <ThemeToggle />
              </div>
            </div>
          </header>

          <main className="w-full [&>section]:scroll-mt-14">
            <section id="about">
              <div className="relative overflow-hidden">
                <HeroField fieldFrom="wind-field-top" />
                <div className="pointer-events-none relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20">
                  <p className="text-sm font-medium">
                    <span className="text-(--wind-ink0)">
                      Wind over a crop.
                    </span>{" "}
                    <span className="text-muted-foreground">
                      Move the pointer through the field to raise a gust.
                    </span>
                  </p>
                  <h1 className="mt-5 max-w-5xl text-[clamp(2.6rem,7.5vw,6.5rem)] leading-[0.92] font-extrabold tracking-tighter">
                    {site.tagline}
                  </h1>
                </div>
                <div
                  id="wind-field-top"
                  className="h-[clamp(16rem,46svh,30rem)]"
                />
              </div>

              <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="grid gap-8 border-t-2 border-foreground py-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <p className="text-lg leading-snug">
                    <strong className="font-extrabold">
                      {formatNumber(totalStems)} stems
                    </strong>
                    , one for every {ACCESSIONS_PER_STEM} of the{" "}
                    {formatNumber(totalAccessions)} genotyped accessions, sown
                    in a strip per crop and bent by the wind where they stand.
                  </p>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-5">
                    {cropTotals.map((t) => (
                      <li
                        key={t.crop}
                        className="border-t-4 pt-2"
                        style={{ borderColor: slotVar(t.slot) }}
                      >
                        <span className="block font-bold">{t.crop}</span>
                        <span className="block tabular-nums text-muted-foreground">
                          {formatNumber(t.accessions)} accessions
                        </span>
                        <span className="block tabular-nums text-muted-foreground">
                          {formatNumber(t.stems)} stems
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-12 pt-12 pb-24 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                  <div>
                    <p className="text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">
                      {site.goal}
                    </p>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                      {site.summary}
                    </p>
                    <ul className="mt-10 grid gap-4 sm:grid-cols-3">
                      {site.objectives.map((o, i) => (
                        <li
                          key={o}
                          className="border-t-2 pt-3 text-sm leading-relaxed"
                          style={{ borderColor: slotVar(i as Slot) }}
                        >
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <dl className="grid">
                      {site.stats.map((s) => (
                        <div
                          key={s.label}
                          className="flex items-baseline justify-between gap-4 border-b border-foreground/15 py-3"
                        >
                          <dt className="text-sm text-muted-foreground">
                            {s.label}
                          </dt>
                          <dd className="text-5xl font-extrabold tracking-tighter tabular-nums">
                            {s.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <div className="mt-10 border-2 border-foreground p-5">
                      <h2 className="text-sm font-bold">The rule</h2>
                      <div className="mt-3 grid gap-1.5 text-lg tabular-nums">
                        <p>θ(x, y) = {VEER} · (2 n(x ⁄ λ, y ⁄ λ) − 1)</p>
                        <p>lean = v · |w| · cos θ</p>
                        <p>stems = accessions ⁄ {ACCESSIONS_PER_STEM}</p>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        n is seeded value noise with λ = {WAVELENGTH} px, so the
                        same content always raises the same weather. Wind speed
                        v runs on a log scale from a breath for 4 tools to a
                        gale for {formatNumber(totalAccessions)} accessions;
                        every section below names the number it blows at.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="tools"
              className="mx-auto max-w-7xl px-4 pb-24 sm:px-6"
            >
              <SectionTitle value={tools.length} unit="open source tools">
                Tools
              </SectionTitle>
              <ToolsWind />
              <p className="text-sm text-muted-foreground">
                One streamline for each capability, leaving from its tool.
              </p>
              <div className="mt-8 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-4">
                {tools.map((tool, i) => (
                  <article
                    key={tool.slug}
                    className="flex flex-col border-t-4 pt-5"
                    style={{ borderColor: slotVar((i % 4) as Slot) }}
                  >
                    <h3 className="text-4xl font-extrabold tracking-tighter">
                      {tool.name}
                    </h3>
                    <p className="mt-2 font-semibold leading-snug">
                      {tool.summary}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {tool.description}
                    </p>
                    <ul className="mt-5 grid gap-2 text-sm">
                      {tool.capabilities.map((c) => (
                        <li key={c} className="flex gap-3">
                          <span
                            className="mt-2 h-0.5 w-4 shrink-0"
                            style={{ background: slotVar((i % 4) as Slot) }}
                          />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      {"image" in tool ? (
                        <Image
                          src={tool.image}
                          alt={`${tool.name} screenshot`}
                          width={1421}
                          height={876}
                          className="border border-foreground/15"
                        />
                      ) : (
                        <ImagePlaceholder
                          label={tool.name}
                          className="border-foreground/25"
                        />
                      )}
                    </div>
                    <a
                      href={tool.url}
                      className="mt-5 inline-flex items-center gap-1 self-start border-b-2 border-foreground pb-0.5 text-sm font-bold"
                    >
                      Open {tool.name} <ArrowUpRightIcon className="size-4" />
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section id="data" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
              <SectionTitle
                value={dataReleases.length}
                unit="genotype releases"
              >
                Data
              </SectionTitle>
              <p className="mt-6 max-w-2xl text-muted-foreground">
                Each release is a drill row of the same length with one stem per{" "}
                {ACCESSIONS_PER_STEM} accessions, so a denser row is a bigger
                release. Superseded releases are drawn faint: their accessions
                are counted again in the later release.
              </p>
              <ol className="mt-10 grid">
                {dataReleases.map((r, i) => {
                  const superseded = "superseded" in r;
                  return (
                    <li
                      key={r.doi}
                      className="grid items-end gap-x-8 gap-y-3 border-b border-foreground/15 py-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,9rem)]"
                    >
                      <div>
                        <h3 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                          <span
                            className="size-3 shrink-0"
                            style={{ background: slotVar(slotOfCrop(r.crop)) }}
                          />
                          {r.crop}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(r.released)} · {r.assembly}
                        </p>
                      </div>
                      <div className={superseded ? "opacity-35" : undefined}>
                        <ReleaseField index={i} />
                      </div>
                      <div className="md:text-right">
                        <p className="text-3xl font-extrabold tracking-tighter tabular-nums">
                          {formatNumber(r.accessions)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {superseded
                            ? "superseded"
                            : `row density ${Math.round((r.accessions / maxAccessions) * 100)}%`}
                        </p>
                        <a
                          href={r.doi}
                          className="mt-1 inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
                        >
                          {r.doi.replace("https://doi.org/", "")}
                          <ArrowUpRightIcon className="size-3.5" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <h3 className="mt-20 text-3xl font-extrabold tracking-tight">
                Mappings and standards
              </h3>
              <dl className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {standards.map((s) => (
                  <div
                    key={s.name}
                    className="border-t-2 border-foreground pt-4"
                  >
                    <dt className="text-xl font-bold tracking-tight">
                      {s.name}
                    </dt>
                    <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {s.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section id="news" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
              <SectionTitle value={news.length} unit="news items">
                News
              </SectionTitle>
              <div className="mt-6">
                <NewsField />
                <div
                  className="relative h-6 border-t-2 border-foreground text-sm text-muted-foreground"
                  aria-hidden
                >
                  {newsYears.map((y) => (
                    <span
                      key={y}
                      className="absolute top-1 -translate-x-1/2"
                      style={{ left: `${newsX(`${y}-01-01`) * 100}%` }}
                    >
                      {y}
                    </span>
                  ))}
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  {newsKinds.map((k) => (
                    <li key={k.kind} className="flex items-center gap-2">
                      <span
                        className="h-1 w-5"
                        style={{ background: slotVar(k.slot) }}
                      />
                      {k.label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-16 grid gap-14">
                {newsYearsDesc.map((year) => (
                  <div
                    key={year}
                    className="grid gap-6 md:grid-cols-[10rem_minmax(0,1fr)]"
                  >
                    <p className="text-7xl leading-none font-extrabold tracking-tighter text-(--wind-ink1) tabular-nums md:sticky md:top-20 md:self-start">
                      {year}
                    </p>
                    <ol className="ml-2.5 grid gap-10 border-l-2 border-(--wind-ink2) pb-2">
                      {news
                        .filter((n) => n.date.startsWith(year))
                        .map((n) => (
                          <li key={n.date + n.title} className="relative pl-8">
                            <NewsNode kind={n.kind} />
                            <p className="text-sm">
                              <time dateTime={n.date}>
                                {formatDate(n.date)}
                              </time>
                              <span className="text-muted-foreground">
                                {" "}
                                ·{" "}
                                {n.kind === "tool"
                                  ? "Tool release"
                                  : "Data release"}
                              </span>
                            </p>
                            <h3 className="mt-1 text-2xl leading-tight font-bold tracking-tight">
                              {n.title}
                            </h3>
                            <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
                              {n.body}
                            </p>
                          </li>
                        ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>
          </main>

          <footer className="bg-foreground text-background">
            <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <p className="text-2xl leading-snug font-semibold tracking-tight">
                {funding.acknowledgement}
              </p>
              <ul className="grid content-start gap-3 text-sm">
                {funding.partners.map((p, i) => (
                  <li key={p} className="flex items-center gap-3">
                    <span
                      className="h-1 w-5"
                      style={{ background: `var(--wind-inv${i})` }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </footer>
          <PalettePicker />
        </WindLinesProvider>
      </Inks>
    </PaletteProvider>
  );
}
