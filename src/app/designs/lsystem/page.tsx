import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
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
  type Crop,
} from "@/content";
import { specimens } from "./_components/grammars";
import { FieldStrip, Hero } from "./_components/hero";
import { Inks } from "./_components/inks";
import { hashSeed, mulberry32 } from "./_components/lsystem";
import { Specimen } from "./_components/specimen";

export const metadata: Metadata = { title: `L-system field | ${site.name}` };

const ACCESSIONS_PER_BLADE = 250;
const maxAccessions = Math.max(...dataReleases.map((r) => r.accessions));

/** Each crop gets one of the three strongest inks. */
const cropInk = (crop: Crop) => `var(--ink${crops.indexOf(crop) % 3})`;

/** A drill row of seedlings, one blade per ACCESSIONS_PER_BLADE accessions, spanning a width proportional to the release. */
function DrillRow({ accessions, seed, ink }: { accessions: number; seed: string; ink: string }) {
  const rand = mulberry32(hashSeed(seed));
  const blades = Math.ceil(accessions / ACCESSIONS_PER_BLADE);
  const span = (accessions / maxAccessions) * 996;
  const d = Array.from({ length: blades }, (_, i) => {
    const x = 2 + (span * (i + 0.5)) / blades;
    const h = 22 + rand() * 34;
    const lean = (rand() - 0.5) * 10;
    return `M${x.toFixed(1)} 60Q${(x + lean * 0.2).toFixed(1)} ${(60 - h / 2).toFixed(1)} ${(x + lean).toFixed(1)} ${(60 - h).toFixed(1)}`;
  }).join("");
  return (
    <svg viewBox="0 0 1000 60" preserveAspectRatio="none" aria-hidden className="h-14 w-full overflow-visible">
      <path d={d} fill="none" stroke={ink} strokeWidth={1.4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <line x1={0} x2={1000} y1={60} y2={60} stroke="currentColor" strokeOpacity={0.25} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Small leaf or grain mark used as the node on the news stem. */
function Node({ kind }: { kind: "tool" | "data" }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className="absolute top-1 -left-[11px] size-5">
      {kind === "tool" ? (
        <path d="M10 18C3 12 4 5 10 2c6 3 7 10 0 16Z" fill="var(--ink0)" />
      ) : (
        <ellipse cx={10} cy={10} rx={4.5} ry={7} fill="var(--background)" stroke="var(--ink1)" strokeWidth={2} />
      )}
    </svg>
  );
}

const years = [...new Set(news.map((n) => n.date.slice(0, 4)))];

const wrap = "mx-auto w-full max-w-7xl px-4 sm:px-8";
const heading = "font-display text-[clamp(4rem,14vw,11rem)] leading-[0.8] font-bold uppercase";

// L-system field: a generative homepage where every plant is grown from a stochastic grammar,
// seeded by the palette, so changing colours sows a new field.
export default function LsystemDesign() {
  return (
    <PaletteProvider design="lsystem" defaultId={278} shortlist={[278, 243, 310, 262, 319, 249, 348, 342]}>
      <Inks className="lsys overflow-x-clip bg-background text-foreground">
        <section id="about" className="scroll-mt-4">
          <Hero>
            <header className={`${wrap} flex items-center gap-4 pt-4 sm:gap-8`}>
              <a href="#about" className="font-display text-xl font-bold tracking-wide whitespace-nowrap uppercase sm:text-2xl">
                {site.name}
              </a>
              <nav className="ml-auto flex gap-3 font-grammar text-[11px] uppercase sm:gap-6">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="hover:text-(--ink0)">
                    {s.label}
                  </a>
                ))}
              </nav>
              <ThemeToggle />
            </header>
            <div className={`${wrap} pt-10 sm:pt-16`}>
              <h1 className="max-w-[18ch] font-display text-[clamp(2.9rem,7.4vw,7rem)] leading-[0.86] font-bold uppercase">
                {site.tagline}
              </h1>
            </div>
          </Hero>

          <div className={`${wrap} grid gap-10 border-t border-current/15 py-20 lg:grid-cols-12`}>
            <p className="text-2xl leading-snug sm:text-3xl lg:col-span-7">{site.summary}</p>
            <p className="border-l-4 border-(--ink0) pl-5 text-lg sm:text-xl lg:col-span-4 lg:col-start-9 lg:self-end">
              {site.goal}
            </p>
          </div>

          <dl className={`${wrap} grid gap-10 sm:grid-cols-3`}>
            {site.stats.map((s, i) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-4 font-grammar text-xs uppercase">{s.label}</dt>
                <dd className="font-display text-[clamp(5rem,11vw,9rem)] leading-none font-bold" style={{ color: `var(--ink${i})` }}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <ol className={`${wrap} mt-20 grid gap-8 pb-24 md:grid-cols-3`}>
            {site.objectives.map((o, i) => (
              <li key={o} className="border-t border-current/20 pt-4">
                <p className="font-grammar text-xs text-(--ink0)">p{i + 1} →</p>
                <p className="mt-2 text-lg leading-snug">{o}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="tools" className={`${wrap} scroll-mt-4 py-20`}>
          <h2 className={heading}>Tools</h2>
          <div className="mt-12">
            {tools.map((tool) => (
              <article
                key={tool.slug}
                className="grid gap-8 border-t border-current/20 py-14 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16"
              >
                <Specimen grammar={specimens[tool.slug]} salt={tool.slug} />
                <div className="min-w-0">
                  <h3 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.85] font-bold uppercase">{tool.name}</h3>
                  <p className="mt-5 max-w-2xl text-xl leading-snug">{tool.summary}</p>
                  <p className="mt-4 max-w-2xl text-muted-foreground">{tool.description}</p>
                  <ul className="mt-6 grid max-w-3xl gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="grid grid-cols-[1.25rem_1fr]">
                        <span className="font-grammar text-(--ink0)">+</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.url}
                    className="mt-6 inline-flex items-center gap-1 border-b-2 border-(--ink0) pb-0.5 font-grammar text-xs uppercase"
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                  <div className="mt-8 max-w-md">
                    {"image" in tool ? (
                      <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="border border-current/15" />
                    ) : (
                      <ImagePlaceholder label={tool.name} className="border-current/25" />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="data" className={`${wrap} scroll-mt-4 py-20`}>
          <h2 className={heading}>Data</h2>
          <p className="mt-8 font-grammar text-xs uppercase">
            1 blade = {ACCESSIONS_PER_BLADE} accessions genotyped
          </p>
          <ol className="mt-6">
            {dataReleases.map((r) => (
              <li
                key={r.doi}
                className={`grid items-end gap-x-8 gap-y-3 border-t border-current/20 py-6 md:grid-cols-[13rem_minmax(0,1fr)_10rem] ${"superseded" in r ? "opacity-45" : ""}`}
              >
                <div>
                  <h3 className="font-display text-4xl leading-none font-bold uppercase">{r.crop}</h3>
                  <p className="mt-2 font-grammar text-[10.5px] text-muted-foreground">
                    {r.assembly}
                    <br />
                    {formatDate(r.released)}
                    {"superseded" in r ? ", superseded" : ""}
                  </p>
                </div>
                <DrillRow accessions={r.accessions} seed={r.doi} ink={cropInk(r.crop)} />
                <div className="flex items-end justify-between gap-4 md:flex-col md:items-end">
                  <p className="font-display text-5xl leading-none font-bold tabular-nums">{formatNumber(r.accessions)}</p>
                  <a href={r.doi} className="font-grammar text-[10.5px] underline-offset-4 hover:underline">
                    DOI {r.doi.replace("https://doi.org/", "")}
                  </a>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-24 font-display text-5xl font-bold uppercase sm:text-6xl">Mappings and standards</h3>
          <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name} className="border-t-2 border-(--ink1) pt-3">
                <dt className="text-xl font-semibold">{s.name}</dt>
                <dd className="mt-2 text-muted-foreground">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news" className={`${wrap} scroll-mt-4 py-20`}>
          <h2 className={heading}>News</h2>
          <div className="mt-14 grid gap-14">
            {years.map((year) => (
              <div key={year} className="grid gap-6 md:grid-cols-[10rem_1fr]">
                <p className="font-display text-7xl leading-none font-bold text-(--ink1) md:sticky md:top-6 md:self-start">{year}</p>
                <ol className="ml-2.5 grid gap-10 border-l-2 border-(--ink2) pb-2">
                  {news
                    .filter((n) => n.date.startsWith(year))
                    .map((n) => (
                      <li key={n.date + n.title} className="relative pl-8">
                        <Node kind={n.kind} />
                        <p className="font-grammar text-[10.5px] uppercase">
                          <time dateTime={n.date}>{formatDate(n.date)}</time>
                          <span className="text-muted-foreground"> · {n.kind === "tool" ? "tool release" : "data release"}</span>
                        </p>
                        <h3 className="mt-1 text-2xl font-semibold">{n.title}</h3>
                        <p className="mt-1 max-w-2xl text-muted-foreground">{n.body}</p>
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-10">
          <FieldStrip salt="footer" className="h-44 sm:h-56" />
          <div className={`${wrap} grid gap-6 border-t border-current/20 py-12 md:grid-cols-[1fr_auto]`}>
            <p className="max-w-2xl text-lg">{funding.acknowledgement}</p>
            <ul className="font-grammar text-[11px] uppercase md:text-right">
              {funding.partners.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </footer>
      </Inks>
      <PalettePicker />
    </PaletteProvider>
  );
}
