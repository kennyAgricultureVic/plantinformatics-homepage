import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
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
import { ACCESSIONS_PER_TIP, INKS, PX_PER_CM, RULE, cropPlan, hashSeed, totalTips } from "./_components/model";
import { Depth, Soil } from "./_components/soil";

export const metadata: Metadata = { title: `Root architecture | ${site.name}` };

const SEED = hashSeed(dataReleases.map((r) => r.doi).join(" "));

/** The content column. Lanes either side of it are left free for roots, and the left one holds the depth scale. */
const frame = "relative ml-16 mr-4 sm:ml-24 sm:mr-8 lg:mx-auto lg:w-[calc(100%-20rem)] xl:max-w-5xl";
/** Same box, lifted above the roots. */
const col = `${frame} z-[2]`;
const sans = "roots-sans";

const inkOf = (crop: string) => cropPlan.find((c) => c.crop === crop)?.ink ?? INKS[4];

function Heading({ id, children, count }: { id: string; children: ReactNode; count: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-foreground pb-3">
      <h2 className="text-6xl leading-[0.9] font-light tracking-tight sm:text-8xl">{children}</h2>
      <p className={`${sans} pb-2 text-sm text-muted-foreground`}>
        {count}
        <Depth of={id} prefix=" · " />
      </p>
    </div>
  );
}

/** A seedling standing on the soil line, one blade per crop in its root ink. */
function Shoot() {
  const blades = [
    "M60 120C58 92 40 70 18 58",
    "M60 120C60 88 70 54 92 30",
    "M60 120C62 90 58 40 54 4",
    "M60 120C64 98 84 84 110 82",
    "M60 120C58 100 30 96 8 100",
  ];
  return (
    <svg viewBox="0 0 120 122" className="h-28 w-28 overflow-visible sm:h-36 sm:w-36" aria-hidden>
      {blades.map((d, i) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          fill="none"
          stroke={cropPlan[i]?.ink ?? "currentColor"}
          strokeWidth={3.2}
          strokeLinecap="round"
          className="roots-grow"
          style={{ animationDuration: "900ms", animationDelay: `${i * 140}ms` }}
        />
      ))}
    </svg>
  );
}

const years = [...new Set(news.map((n) => n.date.slice(0, 4)))];

// Root architecture: the page is a soil profile. A root system grows down from a seedling at the top,
// one root tip per 500 accessions, and its seminal roots carry on down the margins past every section.
export default function RootsDesign() {
  return (
    <PaletteProvider design="roots" defaultId={243} shortlist={[243, 249, 258, 279, 275, 343, 297, 268, 323]}>
      <Soil seed={SEED} className="overflow-x-clip bg-background text-foreground">
        <section id="about" className="scroll-mt-4">
          <header className={`${col} flex items-center gap-4 pt-5`}>
            <a href="#about" className="text-xl font-semibold tracking-tight sm:text-2xl">
              {site.name}
            </a>
            <nav className={`${sans} ml-auto hidden gap-6 text-sm sm:flex`}>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto sm:ml-0">
              <ThemeToggle />
            </div>
          </header>

          <div className={`${col} pt-14 sm:pt-20`}>
            <h1 className="max-w-[20ch] text-[clamp(2.3rem,6vw,5.25rem)] leading-[1.02] font-light tracking-tight">{site.tagline}</h1>
          </div>

          {/* Above ground: the shoot stands on the soil line at the crown. */}
          <div className="relative mt-8 h-32 sm:h-40">
            <div data-crown className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[3px]">
              <Shoot />
            </div>
          </div>
          <div data-soil className="relative border-t-2 border-foreground">
            <p className={`${col} ${sans} pt-2 text-right text-xs text-muted-foreground`}>soil line, 0 cm</p>
          </div>
          <div aria-hidden className="h-[68svh] min-h-[460px] sm:h-[78svh] sm:min-h-[620px]" />
          <div data-hero-end />

          <div data-depth="about" data-content className={col}>
            <figure className="grid gap-8 border-t border-foreground/25 pt-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <figcaption className="text-lg leading-snug sm:text-xl">
                <span className="font-semibold">Fig. 1.</span> The root system above is grown from the released data: one root tip for every{" "}
                {formatNumber(ACCESSIONS_PER_TIP)} genotyped accessions, coloured by crop, {totalTips} tips for{" "}
                {formatNumber(totalAccessions)} accessions. Each seminal root then keeps growing down the margin, past every section of
                this page.
              </figcaption>
              <ul className={`${sans} grid content-start gap-1.5 text-sm`}>
                {cropPlan.map((c) => (
                  <li key={c.crop} className="grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-foreground/15 pb-1.5">
                    <span className="size-3 rounded-full" style={{ background: c.ink }} />
                    <span>{c.crop}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {c.tips} tips · {formatNumber(c.accessions)}
                    </span>
                  </li>
                ))}
              </ul>
            </figure>

            <div className="mt-6 grid gap-x-8 gap-y-2 border-y border-foreground/25 py-5 sm:grid-cols-[auto_minmax(0,1fr)]">
              <p className="text-2xl whitespace-nowrap sm:text-3xl">
                θ′ = θ + γ(θ* − θ) + σε
              </p>
              <p className={`${sans} self-center text-sm text-muted-foreground`}>
                Every root is a random walk in {RULE.step} px steps. Its heading θ turns a fraction γ = {RULE.gamma} toward the
                preferred heading θ* (down, or toward a lane) plus noise σ = {RULE.sigma}. Laterals leave at {RULE.insertion[0]}–
                {RULE.insertion[1]}°. The scale in the margin is 1 cm per {PX_PER_CM} px.
              </p>
            </div>

            <div className="grid gap-12 py-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="space-y-6">
                <p className="text-2xl leading-snug font-light sm:text-3xl">{site.summary}</p>
                <p className="border-l-2 border-(--ink0) pl-5 text-lg">{site.goal}</p>
              </div>
              <dl className="grid content-start">
                {site.stats.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-foreground/20 py-3">
                    <dt className={`${sans} text-sm`}>{s.label}</dt>
                    <dd className="text-5xl font-extralight tabular-nums sm:text-6xl">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="grid gap-6 pb-24 md:grid-cols-3">
              {site.objectives.map((o) => (
                <li key={o} className="border-t-2 border-(--ink1) pt-4 text-lg leading-snug">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="tools" data-depth="tools" className={`${col} scroll-mt-4 pb-24`}>
          <Heading id="tools" count={`${tools.length} lateral roots`}>
            Tools
          </Heading>
          <p className={`${sans} mt-4 max-w-xl text-sm text-muted-foreground`}>
            Each tool is a lateral root reaching in from the margin, with one nodule for each thing it does.
          </p>
          <div className="mt-6">
            {tools.map((tool, i) => (
              <article
                key={tool.slug}
                className="grid gap-6 border-b border-foreground/20 py-12 md:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-[9rem_minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-10"
              >
                <div className="relative h-24 md:h-auto">
                  <span data-nodule={tool.capabilities.length} data-ink={INKS[i % 4]} className="absolute top-10 left-10 md:top-14 md:left-14" />
                  <p className={`${sans} absolute top-[4.5rem] left-24 text-xs text-muted-foreground md:top-28 md:left-0`}>
                    {tool.capabilities.length} nodules
                  </p>
                </div>
                <div>
                  <h3 className="text-5xl font-light tracking-tight sm:text-6xl">{tool.name}</h3>
                  <p className="mt-3 text-xl leading-snug">{tool.summary}</p>
                  <p className="mt-4 text-muted-foreground">{tool.description}</p>
                  <ul className="mt-6 grid gap-2 text-[0.95rem]">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-2 size-2 shrink-0 rounded-full" style={{ background: INKS[i % 4] }} />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.url}
                    className={`${sans} mt-6 inline-flex items-center gap-1 border-b-2 border-(--ink0) pb-0.5 text-sm font-medium`}
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </div>
                <div className="md:col-start-2 lg:col-start-auto">
                  {"image" in tool ? (
                    <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="border border-foreground/20" />
                  ) : (
                    <ImagePlaceholder label={tool.name} className="border-foreground/25" />
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="data" data-depth="data" className="scroll-mt-4 pb-24">
          <div className={col}>
            <Heading id="data" count={`${dataReleases.length} horizons`}>
              Data
            </Heading>
            <p className={`${sans} mt-4 max-w-xl text-sm text-muted-foreground`}>
              Each release is a soil horizon, its thickness set by the accessions it holds. Newest at the top, oldest deepest, as soil is
              laid down.
            </p>
          </div>

          <div className={`${frame} mt-10`}>
            {/* The monolith: bands run in from the page edge, through the root lane, proportional to accessions. */}
            <div aria-hidden className="absolute inset-y-0 -left-[100vw] right-[74%] flex flex-col sm:right-[62%]">
              {dataReleases.map((r, i) => (
                <div
                  key={r.doi}
                  data-band={i}
                  className="horizon min-h-px border-b border-background"
                  style={
                    {
                      flex: `${r.accessions} 1 0px`,
                      "--soil": inkOf(r.crop),
                      "--mix": "superseded" in r ? "28%" : "62%",
                    } as CSSProperties
                  }
                />
              ))}
            </div>
            <ol className="relative z-[2] ml-[32%] sm:ml-[44%]">
              {dataReleases.map((r, i) => (
                <li
                  key={r.doi}
                  data-label={i}
                  className={`border-t border-foreground/20 py-5 first:border-t-0 first:pt-0 ${"superseded" in r ? "text-muted-foreground" : ""}`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-3xl font-light sm:text-4xl">{r.crop}</h3>
                    <p className="text-3xl font-extralight tabular-nums sm:text-4xl">{formatNumber(r.accessions)}</p>
                  </div>
                  <p className={`${sans} mt-1 text-sm`}>
                    {r.assembly} · {formatDate(r.released)}
                    {"superseded" in r ? " · superseded by a later release" : ""}
                  </p>
                  <a href={r.doi} className={`${sans} mt-1 inline-block text-sm break-words underline-offset-4 hover:underline`}>
                    {r.doi.replace("https://doi.org/", "doi ")}
                    <ArrowUpRightIcon className="ml-1 inline size-3.5 align-[-2px]" />
                  </a>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${col} mt-20`}>
            <h3 className="text-4xl font-light tracking-tight sm:text-5xl">Mappings and standards</h3>
            <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {standards.map((s) => (
                <div key={s.name} className="border-t-2 border-(--ink1) pt-3">
                  <dt className="text-xl font-medium">{s.name}</dt>
                  <dd className="mt-2 text-muted-foreground">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="news" data-depth="news" className={`${col} scroll-mt-4 pb-24`}>
          <Heading id="news" count={`${news.length} root hairs`}>
            News
          </Heading>
          <p className={`${sans} mt-4 max-w-xl text-sm text-muted-foreground`}>
            One root hair per item. Filled tips are data releases, open tips are tool releases.
          </p>
          <div className="mt-10 grid gap-12">
            {years.map((year) => (
              <div key={year} className="grid gap-4 md:grid-cols-[7rem_minmax(0,1fr)]">
                <p className="text-5xl font-extralight md:sticky md:top-6 md:self-start">{year}</p>
                <ol className="grid gap-8">
                  {news
                    .filter((n) => n.date.startsWith(year))
                    .map((n) => (
                      <li key={n.date + n.title} className="relative pl-7">
                        <span data-hair={n.kind} className="absolute top-3 left-0 size-0" />
                        <p className={`${sans} text-xs text-muted-foreground`}>
                          <time dateTime={n.date}>{formatDate(n.date)}</time> · {n.kind === "tool" ? "tool release" : "data release"}
                        </p>
                        <h3 className="mt-1 text-2xl font-medium">{n.title}</h3>
                        <p className="mt-1 max-w-2xl text-muted-foreground">{n.body}</p>
                      </li>
                    ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <footer data-root-end data-depth="funding" className="relative z-[2] bg-foreground text-background dark:border-t-2 dark:border-foreground dark:bg-background dark:text-foreground">
          <div className={`${col} grid gap-8 py-14 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`}>
            <p className="text-2xl leading-snug font-light">{funding.acknowledgement}</p>
            <ul className={`${sans} grid content-start gap-2 text-sm`}>
              {funding.partners.map((p) => (
                <li key={p} className="border-b border-current/25 pb-2">
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </Soil>
      <PalettePicker />
    </PaletteProvider>
  );
}
