import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import {
  dataReleases,
  formatDate,
  funding,
  news,
  sections,
  site,
  standards,
  tools,
  totalAccessions,
  formatNumber,
  type NewsKind,
} from "@/content";
import { ReleaseTable } from "./_components/release-table";

export const metadata: Metadata = { title: `Utilitarian | ${site.name}` };

// Colour carries meaning only: --p1 links and focus, --p2 data, --p3 tools, --p4 superseded.
const kindLabel: Record<NewsKind, string> = { data: "Data release", tool: "Tool release" };
const kindColour: Record<NewsKind, string> = { data: "bg-(--p2)", tool: "bg-(--p3)" };

const rule = "border-neutral-300 dark:border-neutral-700";
const muted = "text-neutral-600 dark:text-neutral-400";
const h2 = "text-2xl font-semibold";
const h3 = "text-lg font-semibold";

const host = (url: string) => new URL(url).host;
const isSource = (url: string) => host(url) === "github.com";
/** Newest news entry whose title names the tool, as its latest recorded change. */
const latestFor = (name: string) => news.find((n) => n.title.includes(name));

const newsByYear = Object.entries(
  Object.groupBy(news, (n) => n.date.slice(0, 4)),
).sort(([a], [b]) => b.localeCompare(a));

function Key({ className }: { className: string }) {
  return <span aria-hidden className={`inline-block size-3 shrink-0 border border-black/30 ${className}`} />;
}

function Index() {
  const link = "block px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-900";
  return (
    <nav aria-label="Page index" className="text-base">
      <h2 className="px-3 pb-2 font-semibold">On this page</h2>
      <ul className={`border-t ${rule}`}>
        {sections.map((s) => (
          <li key={s.id} className={`border-b ${rule}`}>
            <a href={`#${s.id}`} className={link}>
              {s.label}
            </a>
            {s.id === "tools" && (
              <ul className="pb-2">
                {tools.map((t) => (
                  <li key={t.slug}>
                    <a href={`#tool-${t.slug}`} className={`${link} py-1.5 pl-7 ${muted} hover:text-foreground`}>
                      {t.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        <li className={`border-b ${rule}`}>
          <a href="#funding" className={link}>
            Funding
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default function UtilitarianDesign() {
  return (
    <PaletteProvider design="utilitarian" defaultId={252} shortlist={[252, 131, 179, 186, 274, 299, 322, 157, 133]}>
      <a
        href="#content"
        className="sr-only bg-background px-4 py-3 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:border"
      >
        Skip to content
      </a>

      <header className={`border-b ${rule}`}>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6">
          <a href="#about" className="py-2 text-lg font-semibold">
            {site.name}
          </a>
          <Link href="/" className="u-link ml-auto py-2">
            All designs
          </Link>
          <div className="[&_button]:size-11">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
        <aside className="pt-6 md:sticky md:top-0 md:max-h-dvh md:self-start md:overflow-y-auto md:py-8">
          <Index />
        </aside>

        <main id="content" className="min-w-0 pb-16 md:pt-8 [&>section]:scroll-mt-4 [&>section+section]:mt-16">
          <section id="about" aria-labelledby="about-h">
            <h1 id="about-h" className={h2}>
              {site.tagline}
            </h1>
            <p className="mt-4 max-w-3xl">{site.summary}</p>
            <p className="mt-3 max-w-3xl">{site.goal}</p>

            <dl className={`mt-8 grid border-t border-l sm:grid-cols-3 ${rule}`}>
              {site.stats.map((s) => (
                <div key={s.label} className={`flex flex-col-reverse gap-1 border-r border-b p-4 ${rule}`}>
                  <dt className={muted}>{s.label}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>

            <h2 className={`mt-8 ${h3}`}>Objectives</h2>
            <ul className="mt-2 max-w-3xl list-disc space-y-1 pl-6">
              {site.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>

          <section id="tools" aria-labelledby="tools-h">
            <h2 id="tools-h" className={h2}>
              Tools
            </h2>
            <p className={`mt-2 ${muted}`}>
              {tools.length} open source tools. Each entry lists the same fields in the same order.
            </p>

            <div className="mt-6 grid gap-6">
              {tools.map((tool) => {
                const latest = latestFor(tool.name);
                const source = isSource(tool.url);
                return (
                  <article
                    key={tool.slug}
                    id={`tool-${tool.slug}`}
                    aria-labelledby={`tool-${tool.slug}-h`}
                    className={`scroll-mt-4 border ${rule}`}
                  >
                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-b p-4 ${rule}`}>
                      <h3 id={`tool-${tool.slug}-h`} className={h3}>
                        {tool.name}
                      </h3>
                      <a
                        href={tool.url}
                        className="inline-flex min-h-11 items-center border-2 border-foreground px-4 font-semibold hover:bg-foreground hover:text-background sm:ml-auto"
                      >
                        {source ? `View ${tool.name} source` : `Launch ${tool.name}`}
                        <span className="sr-only"> ({host(tool.url)})</span>
                      </a>
                    </div>
                    <dl className="grid sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <dt className="px-4 pt-3 font-semibold sm:pb-3">What it does</dt>
                      <dd className="px-4 pb-3 sm:pt-3">{tool.description}</dd>

                      <dt className={`border-t px-4 pt-3 font-semibold sm:pb-3 ${rule}`}>Capabilities</dt>
                      <dd className={`px-4 pb-3 sm:border-t sm:pt-3 ${rule}`}>
                        <ul className="list-disc space-y-1 pl-5">
                          {tool.capabilities.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      </dd>

                      <dt className={`border-t px-4 pt-3 font-semibold sm:pb-3 ${rule}`}>Address</dt>
                      <dd className={`px-4 pb-3 sm:border-t sm:pt-3 ${rule}`}>
                        <a href={tool.url} className="u-link break-all">
                          {tool.url}
                        </a>
                      </dd>

                      <dt className={`border-t px-4 pt-3 font-semibold sm:pb-3 ${rule}`}>Latest change</dt>
                      <dd className={`px-4 pb-3 sm:border-t sm:pt-3 ${rule}`}>
                        {latest ? (
                          <span className="inline-flex flex-wrap items-center gap-x-2">
                            <Key className={kindColour[latest.kind]} />
                            <time dateTime={latest.date}>{formatDate(latest.date)}</time>
                            <span>{latest.title}</span>
                          </span>
                        ) : (
                          <span className={muted}>No changes recorded in news</span>
                        )}
                      </dd>
                    </dl>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="data" aria-labelledby="data-h">
            <h2 id="data-h" className={h2}>
              Data releases
            </h2>
            <p className={`mt-2 max-w-3xl ${muted}`}>
              {dataReleases.length} releases, {formatNumber(totalAccessions)} unique accessions once superseded releases are
              excluded. Each DOI resolves to the dataset.
            </p>
            <div className="mt-6">
              <ReleaseTable releases={dataReleases} />
            </div>

            <h3 className={`mt-10 ${h3}`}>Mappings and standards</h3>
            <dl className={`mt-3 border-t ${rule}`}>
              {standards.map((s) => (
                <div key={s.name} className={`grid gap-1 border-b py-3 sm:grid-cols-[18rem_minmax(0,1fr)] sm:gap-6 ${rule}`}>
                  <dt className="font-semibold">{s.name}</dt>
                  <dd>{s.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="news" aria-labelledby="news-h">
            <h2 id="news-h" className={h2}>
              News
            </h2>
            <p className={`mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 ${muted}`}>
              {(Object.keys(kindLabel) as NewsKind[]).map((k) => (
                <span key={k} className="inline-flex items-center gap-2">
                  <Key className={kindColour[k]} />
                  {kindLabel[k]}
                </span>
              ))}
            </p>

            {newsByYear.map(([year, items]) => (
              <div key={year} className="mt-6">
                <h3 className={h3}>{year}</h3>
                <ol className={`mt-2 border-t ${rule}`}>
                  {items?.map((n) => (
                    <li key={n.date + n.title} className={`grid gap-1 border-b py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 ${rule}`}>
                      <time dateTime={n.date} className={`tabular-nums ${muted}`}>
                        {formatDate(n.date)}
                      </time>
                      <div>
                        <p className="flex items-start gap-2 font-semibold">
                          <Key className={`mt-1.5 ${kindColour[n.kind]}`} />
                          <span>
                            {n.title}
                            <span className="sr-only"> ({kindLabel[n.kind]})</span>
                          </span>
                        </p>
                        <p className="mt-1 pl-5">{n.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
        </main>
      </div>

      <footer id="funding" className={`border-t ${rule}`}>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
          <h2 className={h3}>Funding</h2>
          <div className="max-w-3xl">
            <p>{funding.acknowledgement}</p>
            <ul className="mt-4 list-disc space-y-1 pl-6">
              {funding.partners.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <a href={site.github} className="u-link">
                Source code on GitHub
              </a>
              <a href="#about" className="u-link">
                Back to top
              </a>
            </p>
          </div>
        </div>
      </footer>
      <PalettePicker />
    </PaletteProvider>
  );
}
