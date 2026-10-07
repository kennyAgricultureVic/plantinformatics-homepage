import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
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
  type SectionId,
} from "@/content";
import { cn } from "@/lib/utils";
import { Frame } from "./_components/frame";
import { Lens } from "./_components/lens";
import { tone, type StepIndex } from "./_components/scale";

export const metadata: Metadata = { title: `Powers of ten | ${site.name}` };

const display = "font-(family-name:--font-zoom-display)";
const label = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;
const maxAccessions = Math.max(...dataReleases.map((r) => r.accessions));

// The sticky lens runs on wide screens when motion is welcome; otherwise each section shows its own static lens.
const withLens = "lg:motion-safe:min-h-svh";
const inline = "lg:motion-safe:hidden";

/** One scale step: its own lens on narrow screens, and an accent from the palette step it sits on. */
function Step({ id, k, children, className }: { id: SectionId; k: StepIndex; children: ReactNode; className?: string }) {
  return (
    <section id={id} style={{ "--accent": tone(k) } as CSSProperties} className={cn("scroll-mt-4 py-20 sm:py-28", withLens, className)}>
      <Frame k={k} className={cn("mb-14", inline)} />
      {children}
    </section>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className={`${display} border-t-4 border-(--accent) pt-5 text-4xl font-medium tracking-tight sm:text-5xl`}>{children}</h2>
  );
}

// Powers of ten: one continuous zoom from a trial paddock to a DNA helix, a scale step per section.
export default function ZoomDesign() {
  return (
    <PaletteProvider design="zoom" defaultId={312} shortlist={[312, 293, 304, 297, 328, 266, 283, 245]} className="flex-1 bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-4 sm:px-8">
        <a href="#about" className={`${display} text-xl font-medium`}>
          {site.name}
        </a>
        <nav className="order-last flex w-full gap-5 text-sm sm:order-none sm:ml-auto sm:w-auto">
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="underline-offset-4 hover:underline">
              {s.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto sm:ml-0">
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:motion-safe:grid lg:motion-safe:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:motion-safe:gap-16">
        <div className="max-w-2xl">
          <main>
            <Step id="about" k={0} className="pt-8 sm:pt-12">
              <h1 className={`${display} text-[2.25rem] leading-[1.08] font-medium tracking-tight sm:text-6xl`}>{site.tagline}</h1>
              <p className="mt-8 text-lg">{site.summary}</p>
              <p className="mt-5 text-lg text-muted-foreground">{site.goal}</p>
              <dl className="mt-12 grid grid-cols-3 gap-4 sm:gap-8">
                {site.stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse border-l-4 border-(--accent) pl-3">
                    <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
                    <dd className={`${display} text-2xl font-medium sm:text-4xl`}>{s.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-12 space-y-4">
                {site.objectives.map((o) => (
                  <li key={o} className="flex gap-3">
                    <span className="mt-2 size-2 shrink-0 bg-(--accent)" />
                    {o}
                  </li>
                ))}
              </ul>
            </Step>

            <Step id="tools" k={1}>
              <Heading>{label("tools")}</Heading>
              <div className="mt-12 space-y-16">
                {tools.map((tool) => (
                  <article key={tool.slug}>
                    <h3 className={`${display} text-2xl font-medium sm:text-3xl`}>{tool.name}</h3>
                    <p className="mt-2 font-medium">{tool.summary}</p>
                    <p className="mt-3 text-muted-foreground">{tool.description}</p>
                    {"image" in tool && (
                      <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="mt-6 border" />
                    )}
                    <ul className="mt-5 space-y-2 text-sm">
                      {tool.capabilities.map((c) => (
                        <li key={c} className="flex gap-3">
                          <span className="mt-1.5 size-1.5 shrink-0 bg-(--accent)" />
                          {c}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={tool.url}
                      className="mt-6 inline-flex items-center gap-1.5 border-b-2 border-(--accent) pb-0.5 text-sm font-medium hover:border-foreground"
                    >
                      Open {tool.name} <ArrowUpRightIcon className="size-4" />
                    </a>
                  </article>
                ))}
              </div>
            </Step>

            <Step id="data" k={2}>
              <Heading>{label("data")}</Heading>
              <ul className="mt-12 divide-y border-y">
                {dataReleases.map((r) => (
                  <li key={r.doi} className={cn("py-5", "superseded" in r && "text-muted-foreground")}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h3 className={`${display} text-xl font-medium`}>{r.crop}</h3>
                      <p className={`${display} text-2xl tabular-nums`}>{formatNumber(r.accessions)}</p>
                    </div>
                    <div className="mt-2 h-2 bg-muted">
                      <div
                        className={cn("h-full", "superseded" in r ? "bg-muted-foreground/40" : "bg-(--accent)")}
                        style={{ width: `${(r.accessions / maxAccessions) * 100}%` }}
                      />
                    </div>
                    <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>{r.assembly}</span>
                      <span>{formatDate(r.released)}</span>
                      {"superseded" in r && <span>Superseded</span>}
                      <a href={r.doi} className="underline underline-offset-4 hover:text-foreground">
                        {r.doi.replace("https://doi.org/", "")}
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
              <h3 className={`${display} mt-16 text-2xl font-medium`}>Mappings and standards</h3>
              <dl className="mt-6 space-y-5">
                {standards.map((s) => (
                  <div key={s.name} className="border-l-2 border-(--accent) pl-4">
                    <dt className="font-medium">{s.name}</dt>
                    <dd className="mt-1 text-sm text-muted-foreground">{s.detail}</dd>
                  </div>
                ))}
              </dl>
            </Step>

            <Step id="news" k={3}>
              <Heading>{label("news")}</Heading>
              <ol className="mt-12 space-y-8">
                {news.map((n) => (
                  <li key={n.date + n.title} className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                    <time dateTime={n.date} className="text-sm text-muted-foreground tabular-nums">
                      {formatDate(n.date)}
                    </time>
                    <div>
                      <h3 className="font-medium">{n.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={cn("size-2", n.kind === "tool" ? "bg-(--accent)" : "border border-foreground")} />
                        {n.kind === "tool" ? "Tool release" : "Data release"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Step>
          </main>

          <footer id="funding" style={{ "--accent": tone(4) } as CSSProperties} className="scroll-mt-4 border-t py-20 lg:motion-safe:min-h-[85svh]">
            <Frame k={4} className={cn("mb-14", inline)} />
            <p className={`${display} text-2xl leading-snug font-medium`}>{funding.acknowledgement}</p>
            <ul className="mt-8 space-y-2">
              {funding.partners.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-2 size-2 shrink-0 bg-(--accent)" />
                  {p}
                </li>
              ))}
            </ul>
            <a href={site.github} className="mt-10 inline-flex items-center gap-1.5 border-b-2 border-(--accent) pb-0.5 text-sm font-medium hover:border-foreground">
              {site.name} on GitHub <ArrowUpRightIcon className="size-4" />
            </a>
          </footer>
        </div>

        <aside className="hidden lg:motion-safe:block">
          <Lens />
        </aside>
      </div>
      <PalettePicker />
    </PaletteProvider>
  );
}
