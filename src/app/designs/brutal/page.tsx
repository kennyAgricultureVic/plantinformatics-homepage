import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  dataReleases,
  formatDate,
  formatNumber,
  funding,
  type NewsKind,
  news,
  sections,
  site,
  standards,
  totalAccessions,
} from "@/content";
import { cn } from "@/lib/utils";
import { FloodSection, rule } from "./_components/flood-section";
import { ToolIndex } from "./_components/tool-index";
import { FitText } from "./_components/fit-text";
import { display, mono } from "./_components/type";

export const metadata: Metadata = { title: `Oversized type | ${site.name}` };

const kindLabel = { tool: "Tool release", data: "Data release" } satisfies Record<NewsKind, string>;

const pad = (n: number) => String(n).padStart(2, "0");
const [genotypes, ...otherStats] = site.stats;

// Sticky masthead: wordmark, numbered section links on a hard 2px grid, theme toggle.
function Masthead() {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-foreground bg-background text-foreground">
      <div className="flex flex-wrap items-stretch md:flex-nowrap">
        <a
          href="#about"
          className={cn(display, "flex items-center px-4 py-2 text-2xl leading-none sm:px-6 md:border-r-2 md:border-foreground")}
        >
          {site.name}
        </a>
        <div className="ml-auto flex items-center border-l-2 border-foreground px-2 md:order-last">
          <ThemeToggle />
        </div>
        <nav className="grid w-full grid-cols-4 border-t-2 border-foreground md:w-auto md:flex-1 md:border-t-0">
          {sections.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={cn(
                mono,
                "flex items-center justify-between gap-2 border-r-2 border-foreground px-3 py-2 text-xs font-bold uppercase last:border-r-0 md:last:border-r-0",
                "hover:bg-foreground hover:text-background",
              )}
            >
              <span>{pad(i + 1)}</span>
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

// Hero: the accession total spans the whole width, then mission, stats and objectives on a grid.
function About() {
  const digits = formatNumber(totalAccessions);
  return (
    <FloodSection id="about" index={1} tone={1}>
      <p className={cn(mono, "flex justify-between text-xs font-bold tracking-widest uppercase")}>
        <span>01</span>
        <span>{genotypes.label}</span>
      </p>
      <FitText as="p" className={cn(display, "leading-[0.78] tabular-nums dark:text-(--flood)")}>
        {digits}
      </FitText>
      <div className={cn("mt-6 grid border-t-2 lg:grid-cols-12", rule)}>
        <h1 className={cn(display, "pt-6 text-5xl leading-[0.9] sm:text-7xl lg:col-span-8 lg:pr-8 lg:text-8xl")}>{site.tagline}</h1>
        <div className={cn("grid content-start gap-6 pt-6 text-lg leading-snug lg:col-span-4 lg:border-l-2 lg:pl-6", rule)}>
          <p>{site.summary}</p>
          <p className="text-2xl leading-tight font-semibold">{site.goal}</p>
        </div>
      </div>
      <dl className={cn("mt-12 grid border-t-2 sm:grid-cols-2", rule)}>
        {otherStats.map((s) => (
          <div key={s.label} className={cn("flex items-end justify-between gap-4 border-b-2 py-4 sm:odd:border-r-2 sm:odd:pr-6 sm:even:pl-6", rule)}>
            <dt className={cn(mono, "text-sm uppercase")}>{s.label}</dt>
            <dd className={cn(display, "text-[9rem] leading-[0.75] dark:text-(--flood)")}>{s.value}</dd>
          </div>
        ))}
      </dl>
      <ol className="mt-12 grid gap-8 md:grid-cols-3">
        {site.objectives.map((o, i) => (
          <li key={o} className={cn("border-t-2 pt-3", rule)}>
            <span className={cn(display, "block text-6xl leading-none")}>{pad(i + 1)}</span>
            <p className="mt-3 text-lg leading-snug">{o}</p>
          </li>
        ))}
      </ol>
    </FloodSection>
  );
}

// Releases as a ledger of giant numbers; superseded releases are struck through.
function Data() {
  return (
    <FloodSection id="data" title="Data" index={3} tone={3}>
      <ol className={cn("mt-10 border-t-2", rule)}>
        {dataReleases.map((r) => {
          const superseded = "superseded" in r;
          return (
            <li
              key={r.doi}
              className={cn("@container grid items-end gap-x-6 gap-y-1 border-b-2 py-3 md:grid-cols-[1fr_auto]", rule)}
            >
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span className={cn(display, "text-4xl leading-none sm:text-6xl", superseded && "line-through decoration-4")}>
                  {r.crop}
                </span>
                <span className={cn(mono, "text-xs uppercase")}>
                  {r.assembly} / {formatDate(r.released)}
                  {superseded && " / superseded"}
                </span>
                <a href={r.doi} className={cn(mono, "text-xs underline underline-offset-4 hover:no-underline")}>
                  {r.doi.replace("https://doi.org/", "doi:")}
                </a>
              </div>
              <span
                className={cn(
                  display,
                  "text-[length:22cqw] leading-[0.8] tabular-nums md:text-right md:text-[length:12cqw] dark:text-(--flood)",
                  superseded && "line-through decoration-4 opacity-40",
                )}
              >
                {formatNumber(r.accessions)}
              </span>
            </li>
          );
        })}
      </ol>
      <h3 className={cn(display, "mt-16 text-5xl leading-none sm:text-7xl")}>Mappings and standards</h3>
      <dl className={cn("mt-6 grid border-t-2 md:grid-cols-2", rule)}>
        {standards.map((s) => (
          <div key={s.name} className={cn("border-b-2 py-5 md:odd:border-r-2 md:odd:pr-6 md:even:pl-6", rule)}>
            <dt className={cn(display, "text-3xl leading-none")}>{s.name}</dt>
            <dd className="mt-3 text-lg leading-snug">{s.detail}</dd>
          </div>
        ))}
      </dl>
    </FloodSection>
  );
}

// News feed: dates as indices, titles big, the latest item biggest.
function News() {
  const [latest, ...rest] = news;
  return (
    <FloodSection id="news" title="News" index={4} tone={4}>
      <article className={cn("mt-10 grid gap-4 border-y-2 py-6 lg:grid-cols-12", rule)}>
        <p className={cn(mono, "text-sm font-bold uppercase lg:col-span-3")}>
          <time dateTime={latest.date}>{formatDate(latest.date)}</time>
          <br />
          {kindLabel[latest.kind]}
        </p>
        <div className="lg:col-span-9">
          <h3 className={cn(display, "text-6xl leading-[0.85] sm:text-8xl dark:text-(--flood)")}>{latest.title}</h3>
          <p className="mt-4 max-w-3xl text-xl leading-snug">{latest.body}</p>
        </div>
      </article>
      <ol>
        {rest.map((n) => (
          <li key={n.date + n.title} className={cn("grid gap-2 border-b-2 py-4 lg:grid-cols-12", rule)}>
            <p className={cn(mono, "text-xs font-bold uppercase lg:col-span-3")}>
              <time dateTime={n.date}>{formatDate(n.date)}</time> / {kindLabel[n.kind]}
            </p>
            <h3 className={cn(display, "text-3xl leading-none sm:text-4xl lg:col-span-4")}>{n.title}</h3>
            <p className="leading-snug lg:col-span-5">{n.body}</p>
          </li>
        ))}
      </ol>
    </FloodSection>
  );
}

// Inverted footer: the funding acknowledgement set large, partners as a stacked list.
function Footer() {
  return (
    <footer className="@container bg-foreground px-4 pt-10 pb-16 text-background sm:px-6">
      <p className="max-w-5xl text-2xl leading-tight font-semibold sm:text-4xl">{funding.acknowledgement}</p>
      <ul className="mt-10 border-t-2 border-background">
        {funding.partners.map((p) => (
          <li key={p} className={cn(display, "border-b-2 border-background py-2 text-[length:7cqw] leading-none")}>
            {p}
          </li>
        ))}
      </ul>
      <div className={cn(mono, "mt-8 flex flex-wrap justify-between gap-4 text-sm font-bold uppercase")}>
        <a href={site.github} className="inline-flex items-center gap-1 underline underline-offset-4 hover:no-underline">
          GitHub <ArrowUpRightIcon className="size-4" />
        </a>
        <a href="#about" className="underline underline-offset-4 hover:no-underline">
          Back to top
        </a>
      </div>
    </footer>
  );
}

// Oversized type: typography is the design. Each section floods with one palette colour in turn.
export default function BrutalDesign() {
  return (
    <PaletteProvider design="brutal" defaultId={257} shortlist={[257, 267, 333, 250, 284, 266, 322, 247]}>
      <div className="overflow-x-clip">
        <Masthead />
        <main>
          <About />
          <FloodSection id="tools" title="Tools" index={2} tone={2}>
            <ToolIndex />
          </FloodSection>
          <Data />
          <News />
        </main>
        <Footer />
      </div>
      <PalettePicker className="border-t-2 border-foreground" />
    </PaletteProvider>
  );
}
