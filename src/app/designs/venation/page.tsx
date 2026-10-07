import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
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
  totalAccessions,
  type ToolSlug,
} from "@/content";
import { Grow } from "./_components/grow";
import { Inks } from "./_components/inks";
import { LeafSvg } from "./_components/leaf-svg";
import { NewsMidrib } from "./_components/news-midrib";
import { growLeaf, type Outline } from "./_components/venation";

export const metadata: Metadata = { title: `Venation | ${site.name}` };

// The one mapping every leaf on the page shares.
const ACCESSIONS_PER_ATTRACTOR = 100;
const ATTRACTORS_PER_CAPABILITY = 40;

const attractorsFor = (accessions: number) =>
  Math.round(accessions / ACCESSIONS_PER_ATTRACTOR);

/** Blade inks: the middle of the contrast order, so theme-ink veins read on every blade. */
const blades = ["var(--ink2)", "var(--ink3)", "var(--ink1)"];
const cropBlade = (crop: (typeof crops)[number]) =>
  blades[crops.indexOf(crop) % blades.length];

// Grown once per render on the server; the same seeds always give the same leaves.
const hero = growLeaf({
  outline: "elliptic",
  length: 1000,
  attractors: attractorsFor(totalAccessions),
  seed: "venation-hero",
  tilt: 24,
  frames: 32,
});

const toolOutlines: Record<ToolSlug, Outline> = {
  pretzel: "lanceolate",
  genolink: "ovate",
  fairybread: "cordate",
  brioche: "linear",
};
const toolLeaves = tools.map((tool) =>
  growLeaf({
    outline: toolOutlines[tool.slug],
    length: 400,
    attractors: tool.capabilities.length * ATTRACTORS_PER_CAPABILITY,
    seed: tool.slug,
    tilt: -8,
  }),
);

// Blade area is proportional to accessions: length goes with the square root.
const maxAccessions = Math.max(...dataReleases.map((r) => r.accessions));
const releaseLeaves = dataReleases.map((r) =>
  growLeaf({
    outline: "ovate",
    length: 420 * Math.sqrt(r.accessions / maxAccessions),
    attractors: attractorsFor(r.accessions),
    seed: r.doi,
    frames: 20,
  }),
);
// Every release leaf is drawn at one scale: its width is a share of the widest leaf's box.
const pressWidth = Math.max(...releaseLeaves.map((l) => l.box.w));

const partnerLeaves = funding.partners.map((p, i) =>
  growLeaf({
    outline: (["ovate", "lanceolate", "cordate"] as const)[i % 3],
    length: 200,
    attractors: 36,
    seed: p,
    tilt: -30 + i * 30,
  }),
);

const glyph = growLeaf({
  outline: "ovate",
  length: 100,
  attractors: 14,
  seed: "glyph",
  tilt: 30,
});

const wrap = "mx-auto w-full max-w-7xl px-4 sm:px-8";

function SectionHead({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-6 border-t border-foreground pt-6 lg:grid-cols-12">
      <h2 className="font-display text-6xl leading-[0.9] sm:text-8xl lg:col-span-7">
        {title}
      </h2>
      <p className="max-w-md text-muted-foreground lg:col-span-5 lg:self-end lg:justify-self-end">
        {children}
      </p>
    </div>
  );
}

// Venation: every leaf on the page is grown by space colonisation from attractors the content
// supplies, so vein density is data. Blades take palette colours, veins the theme ink.
export default function VenationDesign() {
  return (
    <PaletteProvider
      design="venation"
      defaultId={293}
      shortlist={[293, 270, 326, 334, 341, 262, 299, 290, 266]}
      className="flex flex-1 flex-col"
    >
      <Inks className="ven flex-1 overflow-x-clip bg-background text-foreground">
        <header className={`${wrap} flex h-16 items-center gap-4 sm:gap-8`}>
          <a
            href="#about"
            className="flex items-center gap-2 font-display text-xl whitespace-nowrap"
          >
            <Grow immediate className="size-8">
              <LeafSvg leaf={glyph} fill="var(--ink2)" className="size-full" />
            </Grow>
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
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </header>

        <main className="[&>section]:scroll-mt-4">
          <section id="about" className={wrap}>
            <div className="grid items-center gap-8 pt-6 pb-16 lg:grid-cols-12 lg:pt-10">
              <div className="lg:col-span-6">
                <h1 className="font-display text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[0.98]">
                  {site.tagline}
                </h1>
                <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  {site.summary}
                </p>
              </div>
              <figure className="lg:col-span-6">
                <Grow immediate>
                  <LeafSvg
                    leaf={hero}
                    fill="var(--ink2)"
                    label={`A leaf whose veins grew toward ${formatNumber(hero.params.n)} attractors, one per ${ACCESSIONS_PER_ATTRACTOR} genotyped accessions`}
                    className="mx-auto max-h-[64svh] w-full lg:max-h-[82svh]"
                  />
                </Grow>
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  {formatNumber(totalAccessions)} accessions,{" "}
                  {formatNumber(hero.params.n)} attractors,{" "}
                  {formatNumber(hero.params.nodes)} vein nodes
                </figcaption>
              </figure>
            </div>

            <div className="grid gap-10 border-t border-foreground py-10 md:grid-cols-3">
              <div>
                <h2 className="text-xs font-medium tracking-widest uppercase">
                  The rule
                </h2>
                <p className="mt-4 font-display text-2xl leading-snug">
                  v′ = v + D · n̂
                  <br />
                  n̂ = Σû / ‖Σû‖
                  <br />û = (s − v) / ‖s − v‖
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  Space colonisation (Runions et al. 2005). Each vein node v
                  steps a distance D toward the attractors s that have it as
                  their nearest node. An attractor is spent once a vein comes
                  within d<sub>k</sub>.
                </p>
              </div>
              <div>
                <h2 className="text-xs font-medium tracking-widest uppercase">
                  Parameters
                </h2>
                <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-display text-xl tabular-nums">
                  <dt>n</dt>
                  <dd>{formatNumber(hero.params.n)} attractors</dd>
                  <dt>D</dt>
                  <dd>{hero.params.D} step</dd>
                  <dt>
                    d<sub>i</sub>
                  </dt>
                  <dd>{hero.params.di} reach</dd>
                  <dt>
                    d<sub>k</sub>
                  </dt>
                  <dd>{hero.params.dk} kill</dd>
                  <dt>r²</dt>
                  <dd>= k · tips fed</dd>
                </dl>
              </div>
              <div>
                <h2 className="text-xs font-medium tracking-widest uppercase">
                  Reading the leaf
                </h2>
                <p className="mt-4 text-lg leading-snug">
                  One attractor for every {ACCESSIONS_PER_ATTRACTOR} genotyped
                  accessions. Veins grow toward them and stop when they arrive,
                  so the density of veins is the size of the collection.
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  The midrib forms first. Vein width follows the pipe model: a
                  vein&apos;s cross-section is proportional to the vein endings
                  it feeds, so veins thicken toward the stalk.
                </p>
              </div>
            </div>

            <div className="grid gap-10 border-t border-foreground py-12 lg:grid-cols-12">
              <p className="font-display text-3xl leading-snug sm:text-4xl lg:col-span-7">
                {site.goal}
              </p>
              <dl className="grid gap-6 sm:grid-cols-3 lg:col-span-5 lg:grid-cols-1">
                {site.stats.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-baseline gap-4 border-b border-foreground/20 pb-3"
                  >
                    <dd className="font-display text-5xl text-(--ink0) tabular-nums">
                      {s.value}
                    </dd>
                    <dt className="text-sm text-muted-foreground">{s.label}</dt>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="grid gap-8 pb-24 md:grid-cols-3">
              {site.objectives.map((o, i) => (
                <li key={o} className="flex gap-4">
                  <Grow className="h-16 w-8 shrink-0">
                    <LeafSvg
                      leaf={toolLeaves[i]}
                      fill={blades[i % blades.length]}
                      className="size-full"
                    />
                  </Grow>
                  <p className="text-lg leading-snug">{o}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="tools" className={`${wrap} pb-24`}>
            <SectionHead title="Tools">
              Four tools, four leaf outlines, each grown from its own seed. A
              leaf carries {ATTRACTORS_PER_CAPABILITY} attractors for every
              capability its tool lists.
            </SectionHead>
            <div className="mt-6">
              {tools.map((tool, i) => {
                const leaf = toolLeaves[i];
                return (
                  <article
                    key={tool.slug}
                    className="grid gap-8 border-b border-foreground/20 py-12 last:border-b-0 md:grid-cols-[12rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,22rem)] lg:gap-12"
                  >
                    <figure className="flex items-end gap-4 md:flex-col md:items-start">
                      <Grow className="w-24 md:w-full">
                        <LeafSvg
                          leaf={leaf}
                          fill={blades[i % blades.length]}
                          label={`${toolOutlines[tool.slug]} leaf for ${tool.name}`}
                          className="mx-auto max-h-44 w-full md:max-h-72"
                        />
                      </Grow>
                      <figcaption className="text-sm text-muted-foreground">
                        <span className="font-display text-lg text-foreground capitalize">
                          {toolOutlines[tool.slug]}
                        </span>
                        <br />
                        {tool.capabilities.length} capabilities, {leaf.params.n}{" "}
                        attractors
                      </figcaption>
                    </figure>
                    <div className="min-w-0">
                      <h3 className="font-display text-5xl leading-none sm:text-6xl">
                        {tool.name}
                      </h3>
                      <p className="mt-4 text-xl leading-snug">
                        {tool.summary}
                      </p>
                      <p className="mt-3 text-muted-foreground">
                        {tool.description}
                      </p>
                      <ul className="mt-5 grid gap-2 text-sm">
                        {tool.capabilities.map((c) => (
                          <li
                            key={c}
                            className="border-l-2 border-(--ink2) pl-3"
                          >
                            {c}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={tool.url}
                        className="mt-6 inline-flex items-center gap-1 border-b-2 border-(--ink0) pb-0.5 font-medium"
                      >
                        Open {tool.name} <ArrowUpRightIcon className="size-4" />
                      </a>
                    </div>
                    <div className="md:col-start-2 lg:col-start-3">
                      {"image" in tool ? (
                        <Image
                          src={tool.image}
                          alt={`${tool.name} screenshot`}
                          width={1421}
                          height={876}
                          className="border border-foreground/15"
                        />
                      ) : (
                        <ImagePlaceholder label={tool.name} />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="data" className={`${wrap} pb-24`}>
            <SectionHead title="Data">
              One leaf per genotype release, pressed in sequence, newest first.
              Blade area is proportional to accessions, and each leaf holds one
              attractor per {ACCESSIONS_PER_ATTRACTOR} accessions, so every
              blade has the same vein density.
            </SectionHead>
            <Grow className="mt-10">
              <ol className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
                {dataReleases.map((r, i) => {
                  const superseded = "superseded" in r;
                  return (
                    <li
                      key={r.doi}
                      className={cn(
                        "flex flex-col",
                        superseded && "opacity-50",
                      )}
                    >
                      <div className="flex flex-1 items-end justify-center">
                        <LeafSvg
                          leaf={releaseLeaves[i]}
                          fill={cropBlade(r.crop)}
                          label={`${r.crop} leaf, ${formatNumber(r.accessions)} accessions`}
                          style={{
                            width: `${(releaseLeaves[i].box.w / pressWidth) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="mt-3 border-t border-foreground pt-3">
                        <h3 className="font-display text-2xl leading-none">
                          {r.crop}
                        </h3>
                        <p className="mt-1 font-display text-3xl tabular-nums">
                          {formatNumber(r.accessions)}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {r.assembly}
                          <br />
                          {formatDate(r.released)}
                          {superseded && ", superseded"}
                        </p>
                        <a
                          href={r.doi}
                          className="mt-2 inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline"
                        >
                          {r.doi.replace("https://doi.org/", "")}
                          <ArrowUpRightIcon className="size-3.5" />
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Grow>

            <h3 className="mt-24 font-display text-4xl sm:text-5xl">
              Mappings and standards
            </h3>
            <dl className="mt-8 grid gap-x-12 gap-y-8 sm:grid-cols-2">
              {standards.map((s) => (
                <div key={s.name} className="border-t-2 border-(--ink2) pt-3">
                  <dt className="text-xl font-semibold">{s.name}</dt>
                  <dd className="mt-2 text-muted-foreground">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="news" className={`${wrap} pb-24`}>
            <SectionHead title="News">
              One midrib, {news.length} secondary veins. The newest item is the
              tip; the midrib thickens toward the base, carrying everything
              above it.
            </SectionHead>
            <Grow className="mt-10">
              <NewsMidrib />
            </Grow>
          </section>
        </main>

        <footer className="border-t border-foreground">
          <div
            className={`${wrap} grid gap-10 py-14 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`}
          >
            <p className="font-display text-2xl leading-snug sm:text-3xl">
              {funding.acknowledgement}
            </p>
            <Grow>
              <ul className="grid gap-4">
                {funding.partners.map((p, i) => (
                  <li key={p} className="flex items-center gap-4">
                    <LeafSvg
                      leaf={partnerLeaves[i]}
                      fill={blades[i % blades.length]}
                      className="size-12 shrink-0"
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </Grow>
          </div>
        </footer>
      </Inks>
      <PalettePicker />
    </PaletteProvider>
  );
}
