import type { CSSProperties } from "react";
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
import { HeroField } from "./_components/hero-field";
import { Sprite } from "./_components/sprite";
import { cropBg, cropFill, cropSprites, farmer, toolSigns } from "./_components/sprites";
import { Village } from "./_components/village";

export const metadata: Metadata = { title: `Pixel art farm | ${site.name}` };

const display = "font-(family-name:--font-pixel-display)";
const label = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;
const ink = "fill-black dark:fill-white";

// One block in the harvest ledger stands for this many accessions.
const perBlock = 2000;
const accentBgs = ["bg-(--p1) text-(--p1-fg)", "bg-(--p2) text-(--p2-fg)", "bg-(--p4) text-(--p4-fg)", "bg-(--p3) text-(--p3-fg)"] as const;

// Checkerboard dither between two colours, the limited-palette way to make a third tone.
const dither = (a: string, b: string): CSSProperties => ({
  backgroundImage: `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%)`,
  backgroundSize: "8px 8px",
});

function PixelIcon({ rows, size = 9, colors, className }: { rows: readonly string[]; size?: number; colors?: Record<string, string>; className?: string }) {
  const w = Math.max(...rows.map((r) => r.length));
  return (
    <svg viewBox={`0 0 ${w} ${rows.length}`} width={w * size} height={rows.length * size} className={`px-crisp shrink-0 ${className ?? ""}`} aria-hidden>
      <Sprite rows={rows} colors={colors} />
    </svg>
  );
}

function SectionHead({ id, icon }: { id: Exclude<SectionId, "about">; icon: readonly string[] }) {
  return (
    <div className="mb-10 flex items-end gap-4 border-b-4 border-black pb-3 dark:border-white">
      <PixelIcon rows={icon} size={5} colors={{ a: "fill-(--p1)", s: ink, k: ink }} />
      <h2 className={`${display} text-4xl leading-none sm:text-6xl`}>{label(id)}</h2>
    </div>
  );
}

// Pixel art farm: a 16-bit farming world. Crop rows for data, buildings for tools, a noticeboard for news.
export default function PixelDesign() {
  return (
    <PaletteProvider design="pixel" defaultId={267} shortlist={[267, 247, 284, 319, 312, 333, 252, 278, 306]} className="flex flex-1 flex-col">
      <header className="border-b-4 border-black dark:border-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">
          <a href="#about" className={`${display} flex items-center gap-2 text-xl`}>
            <PixelIcon rows={farmer[0]} size={3} colors={{ k: ink }} />
            {site.name}
          </a>
          <nav className="order-last flex w-full gap-5 text-sm font-medium sm:order-none sm:ml-auto sm:w-auto">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="underline-offset-4 hover:underline">
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 [&>section]:scroll-mt-4 [&>section]:py-16 sm:[&>section]:py-24">
        <section id="about" className="!pt-10">
          <h1 className={`${display} max-w-4xl text-[2rem] leading-[1.1] sm:text-5xl lg:text-6xl`}>{site.tagline}</h1>
          <div className="mt-10 border-4 border-black dark:border-white">
            <HeroField />
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="text-lg">{site.summary}</p>
              <p className="mt-4 text-lg font-medium">{site.goal}</p>
            </div>
            <dl className="grid content-start gap-3">
              {site.stats.map((s, i) => (
                <div key={s.label} className={`px-notch ${accentBgs[i % accentBgs.length]} flex items-baseline gap-4 px-4 py-3`}>
                  <dd className="text-3xl font-bold tabular-nums sm:text-4xl">{s.value}</dd>
                  <dt className="text-sm font-medium">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <ul className="mt-12 grid gap-6 sm:grid-cols-3">
            {site.objectives.map((o) => (
              <li key={o} className="flex gap-3">
                <PixelIcon rows={cropSprites.Lentil.slice(3)} size={4} colors={{ a: "fill-(--p2)", s: ink }} className="mt-1" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </section>

        <section id="tools">
          <SectionHead id="tools" icon={toolSigns.brioche} />
          <Village />
          <div className="mt-16 grid gap-14">
            {tools.map((tool, i) => (
              <article key={tool.slug} id={`tool-${tool.slug}`} className="grid scroll-mt-4 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                {"image" in tool ? (
                  <Image
                    src={tool.image}
                    alt={`${tool.name} screenshot`}
                    width={1421}
                    height={876}
                    className="h-auto w-full border-4 border-black dark:border-white"
                  />
                ) : (
                  <div
                    className={`flex h-48 items-center md:h-auto md:aspect-[1421/876] justify-center border-4 border-black dark:border-white`}
                    style={dither(`var(--p${[1, 2, 4, 1][i % 4]})`, "var(--p3)")}
                  >
                    <div className="border-4 border-black bg-white p-3">
                      <PixelIcon rows={toolSigns[tool.slug]} size={10} />
                    </div>
                  </div>
                )}
                <div>
                  <h3 className={`${display} text-3xl`}>{tool.name}</h3>
                  <p className="mt-3 text-lg">{tool.description}</p>
                  <ul className="mt-5 space-y-2">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-2 size-2 shrink-0 bg-(--p1) ring-1 ring-black dark:ring-white" aria-hidden />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.url}
                    className={`px-notch mt-6 inline-flex items-center gap-2 bg-black px-4 py-2.5 font-medium text-white dark:bg-white dark:text-black`}
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="data">
          <SectionHead id="data" icon={cropSprites.Wheat} />
          <div className="overflow-x-auto border-4 border-black dark:border-white">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="bg-black text-white dark:bg-white dark:text-black">
                <tr className={`${display} text-base`}>
                  <th className="px-4 py-2 font-normal">Crop</th>
                  <th className="px-4 py-2 font-normal">Accessions</th>
                  <th className="px-4 py-2 font-normal">Reference assembly</th>
                  <th className="px-4 py-2 font-normal">Released</th>
                  <th className="px-4 py-2 font-normal">DOI</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black dark:divide-white">
                {dataReleases.map((r) => (
                  <tr key={r.doi}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2 font-medium">
                        <PixelIcon rows={cropSprites[r.crop]} size={3} colors={{ a: cropFill(r.crop), s: ink }} />
                        {r.crop}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block tabular-nums">
                        {formatNumber(r.accessions)}
                        {"superseded" in r && <span className="ml-2 text-xs">superseded</span>}
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-0.5" aria-hidden>
                        {Array.from({ length: Math.ceil(r.accessions / perBlock) }, (_, i) => (
                          <span
                            key={i}
                            className={`size-2 ring-1 ring-black dark:ring-white ${"superseded" in r ? "bg-transparent" : cropBg(r.crop)}`}
                          />
                        ))}
                      </span>
                    </td>
                    <td className="px-4 py-3">{r.assembly}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.released)}</td>
                    <td className="px-4 py-3">
                      <a href={r.doi} className="underline underline-offset-4">
                        {r.doi.replace("https://doi.org/", "")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <span className="size-2 bg-(--p1) ring-1 ring-black dark:ring-white" aria-hidden />
            One block for every {formatNumber(perBlock)} accessions
          </p>

          <h3 className={`${display} mt-16 text-2xl`}>Mappings and standards</h3>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name} className="border-4 border-black p-4 dark:border-white">
                <dt className="font-semibold">{s.name}</dt>
                <dd className="mt-1">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news">
          <SectionHead id="news" icon={toolSigns.genolink} />
          <div
            className={`border-8 border-black p-3 sm:p-6 dark:border-white`}
            style={dither("var(--p3)", "var(--p4)")}
          >
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((n) => (
                <li key={n.date + n.title} className="relative border-4 border-black bg-white p-4 pt-5 text-black dark:border-white dark:bg-black dark:text-white">
                  <span
                    className={`absolute -top-2 left-1/2 size-3 -translate-x-1/2 ring-2 ring-black dark:ring-white ${n.kind === "tool" ? "bg-(--p2)" : "bg-(--p1)"}`}
                    aria-hidden
                  />
                  <p className="flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
                    <time dateTime={n.date}>{formatDate(n.date)}</time>
                    <span>{n.kind === "tool" ? "Tool release" : "Data release"}</span>
                  </p>
                  <h3 className={`${display} mt-2 text-xl leading-tight`}>{n.title}</h3>
                  <p className="mt-2 text-sm">{n.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer>
        <div className="h-3 bg-(--p3)" />
        <div className="border-t-4 border-black bg-black text-white dark:border-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:px-6">
            <PixelIcon rows={farmer[1]} size={6} colors={{ k: "fill-white" }} />
            <div>
              <p className="max-w-2xl">{funding.acknowledgement}</p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
                {funding.partners.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
