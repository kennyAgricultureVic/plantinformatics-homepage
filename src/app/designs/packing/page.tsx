import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatDate, formatNumber, funding, news, sections, site, standards, tools, totalAccessions } from "@/content";
import { CropKey } from "./_components/crop-key";
import { Pod } from "./_components/pod";
import { SeedHeadFigure } from "./_components/seed-head-figure";
import {
  JITTER,
  PER_SEED,
  cropInNews,
  cropNodes,
  newsYears,
  releasesOf,
  seedCount,
  slotColor,
  slotDeep,
  slotOf,
  toolPods,
} from "./_components/seed-head";

export const metadata: Metadata = { title: `Seed packing | ${site.name}` };

const capabilityCount = tools.reduce((n, t) => n + t.capabilities.length, 0);

/** Section heading with the count it packs on the right. */
function SectionTitle({ children, note }: { children: ReactNode; note: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 border-foreground pb-4">
      <h2 className="text-6xl font-black leading-[0.85] tracking-tight sm:text-8xl">{children}</h2>
      <p className="text-base font-medium">{note}</p>
    </div>
  );
}

/** Three tangent circles, the first step of the packing, as the site mark. */
function Mark() {
  return (
    <svg viewBox="-2.2 -2.1 4.4 4.2" className="size-7" aria-hidden>
      <circle cx={-1} cy={0.58} r={1} fill="var(--p1)" />
      <circle cx={1} cy={0.58} r={1} fill="var(--p2)" />
      <circle cx={0} cy={-1.15} r={1} fill="var(--p3)" />
    </svg>
  );
}

// Seed packing: every 200 genotyped accessions is one seed. Seeds pack into their release, releases
// into their crop, crops into one head, using the same front-chain rule at every level. Tools are
// pods of capabilities and news years are pods of items, packed by the same rule at a larger scale.
export default function PackingDesign() {
  return (
    <PaletteProvider
      design="packing"
      defaultId={299}
      shortlist={[299, 252, 312, 278, 258, 347, 304, 274, 244]}
      className="flex flex-1 flex-col bg-background text-foreground"
    >
      <header className="sticky top-0 z-20 border-b border-foreground/15 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <a href="#about" className="flex shrink-0 items-center gap-2.5">
            <Mark />
            <span className="text-lg font-bold tracking-tight">{site.name}</span>
          </a>
          <nav className="ml-auto hidden gap-6 text-sm font-medium sm:flex">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="opacity-60 hover:opacity-100">
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
          <div className="grid items-center gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div>
              <h1 className="text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">{site.tagline}</h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed">
                The head is the genebank. Each seed is {PER_SEED} genotyped accessions, so its{" "}
                {formatNumber(seedCount)} seeds hold all {formatNumber(totalAccessions)}. Seeds pack into the release that
                made them, releases into their crop, crops into the head. Count the seeds to read the chart.
              </p>

              <div className="mt-10 border-2 border-foreground">
                <p className="border-b-2 border-foreground px-5 py-3 text-lg font-bold">The rule, at every scale</p>
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 px-5 py-4 text-base">
                  <dt className="font-bold">seeds</dt>
                  <dd>round(accessions ÷ {PER_SEED})</dd>
                  <dt className="font-bold">r</dt>
                  <dd>1 ± {JITTER}, drawn from a seeded generator</dd>
                  <dt className="font-bold">place</dt>
                  <dd>each circle tangent to two on the front chain, the pair nearest the centre</dd>
                  <dt className="font-bold">wrap</dt>
                  <dd>the smallest circle holding every child, plus a margin</dd>
                </dl>
              </div>
            </div>
            <SeedHeadFigure />
          </div>

          <div className="mt-20 grid gap-12 border-t-2 border-foreground pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
            <div className="space-y-6 text-lg leading-relaxed">
              <p>{site.summary}</p>
              <p className="text-2xl font-bold leading-snug">{site.goal}</p>
            </div>
            <div>
              <dl className="grid">
                {site.stats.map((s, i) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-foreground/20 py-3">
                    <dt className="flex items-center gap-3 font-medium">
                      <span className="size-3 shrink-0 rounded-full" style={{ background: slotColor(i) }} />
                      {s.label}
                    </dt>
                    <dd className="text-5xl font-black tabular-nums sm:text-6xl">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mt-10 grid gap-4">
                {site.objectives.map((o, i) => (
                  <li key={o} className="flex gap-4 border-t border-foreground/20 pt-4">
                    <span className="mt-1 flex size-4 shrink-0 items-center justify-center">
                      <span className="rounded-full bg-foreground" style={{ width: 6 + i * 4, height: 6 + i * 4 }} />
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="tools" className="pb-24">
          <SectionTitle note={`${tools.length} pods, ${capabilityCount} seeds`}>Tools</SectionTitle>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            Each tool is a pod and each of its capabilities a seed, sized by the words it takes to say. Point at a seed to find its line.
          </p>
          <div className="grid">
            {tools.map((tool, i) => {
              const color = slotColor(i);
              const colors = tool.capabilities.map((_, c) => `color-mix(in oklab, ${color} ${100 - c * 11}%, var(--foreground))`);
              return (
                <article key={tool.slug} className="grid gap-x-12 gap-y-8 border-b border-foreground/20 py-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
                  <div>
                    <h3 className="text-5xl font-black tracking-tight sm:text-6xl">{tool.name}</h3>
                    <p className="mt-3 text-xl font-medium leading-snug">{tool.summary}</p>
                    <p className="mt-4 leading-relaxed opacity-80">{tool.description}</p>
                    <a
                      href={tool.url}
                      className="mt-6 inline-flex items-center gap-1.5 border-b-2 pb-0.5 font-bold"
                      style={{ borderColor: color }}
                    >
                      Open {tool.name} <ArrowUpRightIcon className="size-4" />
                    </a>
                  </div>
                  <Pod
                    pod={toolPods[i]}
                    colors={colors}
                    wall={color}
                    shape="capsule"
                    label={`${tool.name} pod with ${tool.capabilities.length} seeds, one per capability`}
                    className="sm:grid-cols-[11rem_minmax(0,1fr)] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:grid-cols-[13rem_minmax(0,1fr)]"
                    items={tool.capabilities.map((c) => (
                      <span key={c} className="leading-snug">
                        {c}
                      </span>
                    ))}
                  />
                  <div>
                    {"image" in tool ? (
                      <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="border border-foreground/20" />
                    ) : (
                      <ImagePlaceholder label={tool.name} className="border-foreground/30" />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="data" className="pb-24">
          <SectionTitle note={`${formatNumber(totalAccessions)} accessions, ${formatNumber(seedCount)} seeds`}>Data</SectionTitle>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            The head again as a key, one crop at a time and all at the same scale, so zone sizes compare. Dashed rings are
            releases. Where a later release includes an earlier one, the earlier accessions are the darker core.
          </p>
          <div className="grid">
            {cropNodes.map((crop) => {
              if (crop.data.kind !== "crop") return null;
              const { crop: name, slot, accessions, seeds } = crop.data;
              return (
                <article key={name} className="grid items-center gap-x-12 gap-y-6 border-b border-foreground/20 py-12 md:grid-cols-[17rem_minmax(0,1fr)]">
                  <div className="flex justify-center md:justify-start">
                    <CropKey crop={crop} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className="flex items-center gap-3 text-5xl font-black tracking-tight">
                        <span className="size-5 shrink-0 rounded-full" style={{ background: slotColor(slot) }} />
                        {name}
                      </h3>
                      <p className="text-3xl font-bold tabular-nums">{formatNumber(accessions)}</p>
                    </div>
                    <p className="mt-1 text-right text-sm opacity-60">{seeds} seeds</p>
                    <ul className="mt-5 grid gap-4">
                      {releasesOf(name).map((r) => {
                        const old = "superseded" in r;
                        return (
                          <li key={r.doi} className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-t border-foreground/20 pt-3 text-sm">
                            <span
                              className="mt-0.5 size-3.5 rounded-full"
                              style={{ background: old ? slotDeep(slotOf(r.crop)) : slotColor(slotOf(r.crop)) }}
                            />
                            <span>
                              <span className="font-bold tabular-nums">{formatNumber(r.accessions)}</span> accessions ·{" "}
                              {formatDate(r.released)}
                            </span>
                            <a href={r.doi} className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                              DOI <ArrowUpRightIcon className="size-3.5" />
                            </a>
                            <span className="col-start-2 col-end-4 opacity-60">
                              {r.assembly}
                              {old && " · carried into the later release, the darker core"}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>

          <h3 className="mt-20 text-4xl font-black tracking-tight">Mappings and standards</h3>
          <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
            {standards.map((s, i) => (
              <div key={s.name} className="flex gap-4 border-t-2 border-foreground pt-4">
                <span className="mt-1.5 size-4 shrink-0 rounded-full" style={{ background: slotColor(i) }} />
                <div>
                  <dt className="text-xl font-bold">{s.name}</dt>
                  <dd className="mt-2 text-sm leading-relaxed opacity-80">{s.detail}</dd>
                </div>
              </div>
            ))}
          </dl>
        </section>

        <section id="news" className="pb-24">
          <SectionTitle note={`${news.length} items in ${newsYears.length} pods`}>News</SectionTitle>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed">
            One pod per year, one seed per item. Data news takes its crop&apos;s colour, tool releases are hollow.
          </p>
          <div className="grid">
            {newsYears.map(({ year, items, pod }) => {
              const crops = items.map((n) => (n.kind === "data" ? cropInNews(n) : undefined));
              return (
                <article key={year} className="grid gap-x-12 gap-y-8 border-b border-foreground/20 py-12 md:grid-cols-[12rem_minmax(0,1fr)]">
                  <h3 className="text-6xl font-black tracking-tight">{year}</h3>
                  <Pod
                    pod={pod}
                    colors={crops.map((c) => (c ? slotColor(slotOf(c)) : "var(--foreground)"))}
                    hollow={items.map((n) => n.kind === "tool")}
                    wall="var(--foreground)"
                    shape="plain"
                    bullet={14}
                    label={`${year}: ${items.length} news items`}
                    className="sm:grid-cols-[9rem_minmax(0,1fr)]"
                    listClassName="gap-6"
                    items={items.map((n) => (
                      <div key={n.title}>
                        <p className="text-sm opacity-60">
                          {formatDate(n.date)} · {n.kind === "tool" ? "Tool release" : "Data release"}
                        </p>
                        <p className="mt-1 text-xl font-bold leading-snug">{n.title}</p>
                        <p className="mt-1 leading-relaxed opacity-80">{n.body}</p>
                      </div>
                    ))}
                  />
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <p className="text-2xl font-medium leading-snug">{funding.acknowledgement}</p>
          <ul className="grid content-start gap-3 font-medium">
            {funding.partners.map((p, i) => (
              <li key={p} className="flex items-center gap-3">
                <span className="size-3 shrink-0 rounded-full" style={{ background: slotColor(i) }} />
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
