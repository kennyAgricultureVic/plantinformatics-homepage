import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { ArrowUpRightIcon } from "lucide-react";
import { Hairline } from "@/components/hairline";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { crops, dataReleases, formatDate, formatNumber, funding, news, sections, site, standards, tools } from "@/content";
import { cn } from "@/lib/utils";
import { Duotone } from "./_components/duotone";
import { Halftone } from "./_components/halftone";
import { InkList, Press } from "./_components/press";
import { CutOutHeading, Overprint, Page, Sheet, Tape, display, ink } from "./_components/print";

export const metadata: Metadata = { title: `Risograph zine | ${site.name}` };

const maxAccessions = Math.max(...dataReleases.map((r) => r.accessions));
const cropInk = (crop: string) => crops.indexOf(crop as (typeof crops)[number]) % 3;

// The wheat figure printed as line art in the third drum, over the halftone.
const hairlineInk = {
  "--hairline-plate": "var(--background)",
  "--hairline-edge": "var(--p3)",
  "--hairline-hi": "var(--p3)",
  "--hairline-mid": "var(--p3)",
  "--hairline-lo": "color-mix(in srgb, var(--p3) 55%, transparent)",
  "--hairline-stroke": "1.6",
} as CSSProperties;

// Risograph zine: spreads printed in two or three palette inks, overprinted out of register.
export default function RisoDesign() {
  return (
    <PaletteProvider
      design="riso"
      defaultId={240}
      shortlist={[240, 154, 122, 247, 252, 215, 170, 131, 213]}
      className="flex flex-1 flex-col"
    >
      <Press>
        <div aria-hidden className="riso-grain pointer-events-none fixed inset-0 z-40" />
        <div className="overflow-x-clip">
          <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-6 sm:px-8">
            <a href="#about" className={cn(display, "text-2xl")}>
              <Overprint inks={[0, 1]}>{site.name}</Overprint>
            </a>
            <nav className="order-last flex w-full gap-6 text-sm font-semibold sm:order-none sm:ml-auto sm:w-auto">
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="underline decoration-4 underline-offset-6 hover:decoration-8"
                  style={{ textDecorationColor: ink(i) }}
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto sm:ml-0">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex flex-col gap-28 px-5 pt-6 pb-24 sm:gap-36 sm:px-8 [&>section]:scroll-mt-8">
            <section id="about">
              <Sheet fold>
                <Page>
                  <Overprint as="h1" className={cn(display, "text-4xl leading-[1.08] sm:text-6xl")}>
                    {site.tagline}
                  </Overprint>
                  <p className="mt-10 text-lg leading-relaxed">{site.summary}</p>
                </Page>
                <Page className="flex flex-col gap-12">
                  <figure className="relative mx-2 mt-2 -rotate-2">
                    <Tape className="-top-3 left-4 -rotate-6" />
                    <Tape className="-right-4 -bottom-3 rotate-12" slot={1} />
                    <div className="relative aspect-5/4">
                      <Halftone seed="about" className="absolute inset-0" />
                      <div className="riso-ink absolute inset-0" style={hairlineInk}>
                        <Hairline figure="wheat" intensity={0.6} className="size-full" />
                      </div>
                    </div>
                  </figure>
                  <p className={cn(display, "text-xl leading-snug sm:text-2xl")}>{site.goal}</p>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
                    {site.stats.map((s, i) => (
                      <div key={s.label} className={i === 0 ? "col-span-2" : undefined}>
                        <dd>
                          <Overprint inks={[i, i + 1]} className={cn(display, i === 0 ? "text-6xl sm:text-7xl" : "text-5xl")}>
                            {s.value}
                          </Overprint>
                        </dd>
                        <dt className="mt-2 text-sm font-semibold">{s.label}</dt>
                      </div>
                    ))}
                  </dl>
                </Page>
              </Sheet>
              <ul className="mx-auto mt-16 grid max-w-6xl gap-10 sm:grid-cols-3">
                {site.objectives.map((o, i) => (
                  <li key={o} className="flex gap-4">
                    <span aria-hidden className="riso-ink riso-cut mt-1 size-6 shrink-0" style={{ background: ink(i), rotate: `${(i - 1) * 8}deg` }} />
                    <span className="leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="tools">
              <div className="mx-auto max-w-6xl">
                <CutOutHeading id="tools" />
              </div>
              <div className="flex flex-col gap-24">
                {tools.map((tool, i) => {
                  const flip = i % 2 === 1;
                  const inks = [i % 3, (i + 1) % 3] as const;
                  return (
                    <Sheet key={tool.slug} fold>
                      <Page className={cn("flex flex-col justify-center", flip && "md:order-last")}>
                        <figure className={cn("relative mx-2", flip ? "rotate-2" : "-rotate-2")}>
                          <Tape className="-top-3 left-1/3 -rotate-3" slot={(i + 2) % 3} />
                          {"image" in tool ? (
                            <Duotone src={tool.image} alt={`${tool.name} screenshot`} slots={[2, 0]} />
                          ) : (
                            <Halftone seed={tool.slug} inks={inks} label={`${tool.name} screenshot placeholder`} className="aspect-16/10" />
                          )}
                          <figcaption className="mt-4 text-sm">{tool.summary}</figcaption>
                        </figure>
                      </Page>
                      <Page>
                        <Overprint as="h3" inks={inks} className={cn(display, "text-5xl sm:text-6xl")}>
                          {tool.name}
                        </Overprint>
                        <p className="mt-6 text-lg leading-relaxed">{tool.description}</p>
                        <ul className="mt-6 space-y-2">
                          {tool.capabilities.map((c) => (
                            <li key={c} className="flex gap-3 text-sm leading-relaxed">
                              <span aria-hidden className="riso-ink mt-2 h-1 w-4 shrink-0" style={{ background: ink(inks[1]) }} />
                              {c}
                            </li>
                          ))}
                        </ul>
                        <a
                          href={tool.url}
                          className={cn(
                            display,
                            "riso-ink mt-8 inline-flex items-center gap-2 px-5 py-3 text-lg transition-transform hover:-rotate-2 motion-reduce:transition-none",
                          )}
                          style={{ background: ink(inks[0]), color: `var(--p${inks[0] + 1}-fg)` }}
                        >
                          Open {tool.name}
                          <ArrowUpRightIcon className="size-5" />
                        </a>
                      </Page>
                    </Sheet>
                  );
                })}
              </div>
            </section>

            <section id="data">
              <div className="mx-auto max-w-6xl">
                <CutOutHeading id="data" offset={1} />
              </div>
              <Sheet fold>
                <Page>
                  <h3 className={cn(display, "text-2xl")}>Data releases</h3>
                  <ol className="mt-8 space-y-7">
                    {dataReleases.map((r) => {
                      const slot = cropInk(r.crop);
                      const width = `${(r.accessions / maxAccessions) * 100}%`;
                      const superseded = "superseded" in r;
                      return (
                        <li key={r.doi}>
                          <div className="flex items-baseline justify-between gap-4">
                            <span className={cn(display, "text-lg")}>{r.crop}</span>
                            <span className="text-sm font-semibold tabular-nums">{formatNumber(r.accessions)} accessions</span>
                          </div>
                          <div className="relative mt-2 h-10" aria-hidden>
                            {!superseded && <span className="riso-ink absolute top-0 bottom-3 left-0" style={{ width, background: ink(slot) }} />}
                            <span
                              className="riso-ink riso-dots riso-shift absolute top-3 bottom-0 left-1"
                              style={{ width, "--riso-dot": ink((slot + 2) % 3) } as CSSProperties}
                            />
                          </div>
                          <p className="mt-2 text-xs leading-relaxed">
                            {r.assembly} · {formatDate(r.released)}
                            {superseded && " · included in a later release"} ·{" "}
                            <a href={r.doi} className="underline underline-offset-2 hover:decoration-2">
                              {r.doi.replace("https://doi.org/", "")}
                            </a>
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </Page>
                <Page>
                  <h3 className={cn(display, "text-2xl")}>Mappings and standards</h3>
                  <dl className="mt-8 space-y-8">
                    {standards.map((s, i) => (
                      <div key={s.name} className="relative pl-6">
                        <span
                          aria-hidden
                          className="riso-ink riso-dots absolute inset-y-0 left-0 w-2.5"
                          style={{ "--riso-dot": ink(i), backgroundColor: `color-mix(in srgb, ${ink(i)} 40%, transparent)` } as CSSProperties}
                        />
                        <dt className={cn(display, "text-lg")}>{s.name}</dt>
                        <dd className="mt-2 text-sm leading-relaxed">{s.detail}</dd>
                      </div>
                    ))}
                  </dl>
                </Page>
              </Sheet>
            </section>

            <section id="news">
              <div className="mx-auto max-w-6xl">
                <CutOutHeading id="news" offset={2} />
              </div>
              <Sheet>
                <Page>
                  <ol className="gap-12 md:columns-2 lg:columns-3">
                    {news.map((n) => {
                      const slot = n.kind === "tool" ? 0 : 2;
                      return (
                        <li key={n.date + n.title} className="mb-12 break-inside-avoid">
                          <div className="flex items-center gap-3 text-sm font-semibold">
                            <span aria-hidden className="riso-ink riso-cut size-4" style={{ background: ink(slot) }} />
                            <time dateTime={n.date}>{formatDate(n.date)}</time>
                            <span>{n.kind === "tool" ? "Tool release" : "Data release"}</span>
                          </div>
                          <Overprint as="h3" inks={[slot, slot + 1]} className={cn(display, "mt-3 text-2xl leading-tight")}>
                            {n.title}
                          </Overprint>
                          <p className="mt-3 text-sm leading-relaxed">{n.body}</p>
                        </li>
                      );
                    })}
                  </ol>
                </Page>
              </Sheet>
            </section>
          </main>

          <footer className="px-5 pb-16 sm:px-8">
            <Sheet fold>
              <Page>
                <p className={cn(display, "text-xl leading-snug")}>{funding.acknowledgement}</p>
                <ul className="mt-8 space-y-1 text-sm font-semibold">
                  {funding.partners.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Page>
              <Page>
                <h2 className={cn(display, "text-xl")}>Printed in</h2>
                <div className="mt-6">
                  <InkList />
                </div>
                <p className="mt-8 text-sm leading-relaxed">
                  {site.name} ·{" "}
                  <a href={site.github} className="underline underline-offset-2 hover:decoration-2">
                    GitHub
                  </a>
                </p>
              </Page>
            </Sheet>
          </footer>
        </div>
      </Press>
      <PalettePicker />
    </PaletteProvider>
  );
}
