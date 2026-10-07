import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react";
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
  type ToolSlug,
} from "@/content";
import { ScrollStory } from "./_components/scroll-story";
import { slotColor, stageNumber, stages, type StageIndex } from "./_components/stages";

export const metadata: Metadata = { title: `Seed to data | ${site.name}` };

const mono = "[font-family:var(--font-plex-mono)]";
const display = "[font-family:var(--font-syne)]";

// Nav follows the story order, which puts data (the genotype calls) before the tools that use it.
const storyOrder = ["about", "data", "tools", "news"] as const;
const nav = storyOrder.map((id) => sections.find((s) => s.id === id) ?? { id, label: id });

type ToolEntry = (typeof tools)[number];

/** Looks up a tool by slug with its literal type intact. */
function tool<S extends ToolSlug>(slug: S) {
  const found = tools.find((t): t is Extract<ToolEntry, { slug: S }> => t.slug === slug);
  if (!found) throw new Error(`Unknown tool ${slug}`);
  return found;
}

/** One stage of the story. ScrollStory finds these by `data-step` and drives the diagram from them. */
function Step({ stage, title, children }: { stage: StageIndex; title?: ReactNode; children: ReactNode }) {
  const { label, slot, caption } = stages[stage];
  return (
    <div data-step={stage} className="border-t px-4 pt-16 pb-24 first:border-t-0 sm:px-10 lg:min-h-[85svh] lg:px-14 lg:pt-24">
      <p className={`${mono} flex items-center gap-3 text-xs tracking-widest uppercase`}>
        <span className="size-3" style={{ background: slotColor(slot) }} />
        {stageNumber(stage)} {label}
      </p>
      <div className={`${display} mt-6 text-3xl leading-[1.05] font-bold tracking-tight sm:text-4xl`}>{title ?? <h2>{caption}</h2>}</div>
      <div className="mt-10">{children}</div>
    </div>
  );
}

/** Tool write-up inside a tools stage, coloured by that stage's palette slot. */
function ToolBlock({ entry, stage }: { entry: ToolEntry; stage: StageIndex }) {
  const color = slotColor(stages[stage].slot);
  return (
    <article className="mt-14 first:mt-0">
      {"image" in entry ? (
        <Image src={entry.image} alt={`${entry.name} screenshot`} width={1421} height={876} className="mb-8 w-full border" />
      ) : (
        <ImagePlaceholder label={entry.name} className="mb-8 aspect-[16/7]" />
      )}
      <h3 className={`${display} text-2xl font-extrabold sm:text-3xl`}>{entry.name}</h3>
      <p className="mt-3 text-base leading-relaxed">{entry.description}</p>
      <ul className="mt-6 space-y-2 text-sm">
        {entry.capabilities.map((c) => (
          <li key={c} className="grid grid-cols-[1.25rem_1fr]">
            <span className={mono} style={{ color }} aria-hidden>
              +
            </span>
            {c}
          </li>
        ))}
      </ul>
      <a href={entry.url} className={`${mono} mt-6 inline-flex items-center gap-1 text-sm underline decoration-2 underline-offset-4`} style={{ textDecorationColor: color }}>
        Open {entry.name} <ArrowUpRightIcon className="size-4" />
      </a>
    </article>
  );
}

// "Seed to data": one sticky diagram transforms through seven pipeline stages as the chapters scroll past.
export default function SeedToDataDesign() {
  const brioche = tool("brioche");
  const genolink = tool("genolink");
  const pretzel = tool("pretzel");
  const fairybread = tool("fairybread");

  return (
    <PaletteProvider design="seed-to-data" defaultId={247} shortlist={[247, 257, 267, 284, 286, 312, 333, 299]} className="flex-1 bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="flex h-14 items-center gap-3 px-4 sm:gap-6 sm:px-10 lg:px-14">
          {/* Two lines on phones so all four chapter links fit beside it. */}
          <a href="#about" className={`${display} max-w-24 shrink-0 text-sm leading-none font-extrabold tracking-tight sm:max-w-none sm:text-lg`}>
            {site.name}
          </a>
          <nav className={`${mono} ml-auto flex min-w-0 gap-3 overflow-x-auto text-xs tracking-wide uppercase sm:gap-6`}>
            {nav.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="shrink-0 py-2 hover:underline hover:underline-offset-4">
                {s.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <ScrollStory>
        <section id="about" className="scroll-mt-14">
          <Step
            stage={0}
            title={<h1 className="text-4xl leading-[0.95] font-extrabold sm:text-5xl xl:text-6xl">{site.tagline}</h1>}
          >
            <p className="max-w-xl text-lg leading-relaxed">{site.summary}</p>
            <dl className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
              {site.stats.map((s, i) => (
                <div key={s.label} className="border-t-4 pt-3" style={{ borderColor: slotColor(stages[i].slot) }}>
                  <dd className={`${display} text-xl font-extrabold tabular-nums sm:text-2xl xl:text-3xl`}>{s.value}</dd>
                  <dt className={`${mono} mt-2 text-[0.7rem] leading-snug tracking-wide uppercase sm:text-xs`}>{s.label}</dt>
                </div>
              ))}
            </dl>
            <p className={`${mono} mt-16 flex items-center gap-2 text-xs tracking-widest uppercase`}>
              <ArrowDownIcon className="size-4" /> Scroll to follow one seed
            </p>
          </Step>
          <Step stage={1}>
            <p className="max-w-xl text-xl leading-snug">{site.goal}</p>
            <ol className="mt-10 max-w-xl space-y-6">
              {site.objectives.map((o, i) => (
                <li key={o} className="grid grid-cols-[2.5rem_1fr] gap-2 border-t pt-4">
                  <span className={`${mono} text-sm`}>{stageNumber(i)}</span>
                  {o}
                </li>
              ))}
            </ol>
          </Step>
        </section>

        <section id="data" className="scroll-mt-14">
          <Step stage={2}>
            <h3 className={`${mono} text-xs tracking-widest uppercase`}>Data releases</h3>
            <ol className="mt-4 border-b">
              {dataReleases.map((r) => {
                const superseded = "superseded" in r;
                return (
                  <li key={r.doi} className={`grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t py-4 ${superseded ? "opacity-55" : ""}`}>
                    <span className={`${display} text-xl font-bold`}>{r.crop}</span>
                    <span className={`${display} text-xl font-bold tabular-nums`}>{formatNumber(r.accessions)}</span>
                    <span className={`${mono} text-xs`}>
                      {r.assembly}
                      {superseded ? " · superseded" : ""}
                    </span>
                    <span className={`${mono} text-right text-xs`}>{formatDate(r.released)}</span>
                    <a href={r.doi} className={`${mono} col-span-2 w-fit text-xs underline underline-offset-4`}>
                      {r.doi.replace("https://doi.org/", "doi:")}
                    </a>
                  </li>
                );
              })}
            </ol>
          </Step>
        </section>

        <section id="tools" className="scroll-mt-14">
          <Step stage={3}>
            <ToolBlock entry={brioche} stage={3} />
            <h3 className={`${mono} mt-16 text-xs tracking-widest uppercase`}>Mappings and standards</h3>
            <dl className="mt-4">
              {standards.map((s) => (
                <div key={s.name} className="border-t py-4">
                  <dt className="font-medium">{s.name}</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </Step>
          <Step stage={4}>
            <ToolBlock entry={genolink} stage={4} />
          </Step>
          <Step stage={5}>
            <ToolBlock entry={pretzel} stage={5} />
            <ToolBlock entry={fairybread} stage={5} />
          </Step>
        </section>

        <section id="news" className="scroll-mt-14">
          <Step stage={6}>
            <h3 className={`${mono} text-xs tracking-widest uppercase`}>News from the pipeline</h3>
            <ol className="mt-4">
              {news.map((n) => (
                <li key={n.date + n.title} className="grid gap-1 border-t py-5 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                  <time dateTime={n.date} className={`${mono} flex items-center gap-2 text-xs`}>
                    <span className="size-2 shrink-0" style={{ background: slotColor(n.kind === "tool" ? 4 : 3) }} />
                    {formatDate(n.date)}
                  </time>
                  <div>
                    <h4 className="font-semibold">{n.title}</h4>
                    <p className="mt-1 text-sm leading-relaxed">{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Step>
        </section>
      </ScrollStory>

      <footer className="border-t">
        <div className="grid gap-8 px-4 py-16 sm:px-10 lg:grid-cols-2 lg:px-14">
          <p className={`${display} text-lg leading-tight font-bold sm:text-2xl`}>{funding.acknowledgement}</p>
          <div className={`${mono} space-y-2 text-xs tracking-wide uppercase lg:justify-self-end lg:text-right`}>
            {funding.partners.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <a href={site.github} className="mt-6 inline-flex items-center gap-1 underline underline-offset-4">
              GitHub <ArrowUpRightIcon className="size-4" />
            </a>
          </div>
        </div>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
