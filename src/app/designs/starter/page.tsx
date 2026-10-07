import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
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
} from "@/content";

export const metadata: Metadata = { title: `Starter | ${site.name}` };

// Reference design: intentionally plain. It shows how every section and content export is wired up,
// so new designs can copy this folder and restyle freely.
export default function StarterDesign() {
  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-6">
          <a href="#about" className="font-semibold">
            {site.name}
          </a>
          <nav className="ml-auto flex gap-5 overflow-x-auto text-sm">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                {s.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 [&>section]:scroll-mt-14 [&>section]:py-20">
        <section id="about">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{site.tagline}</h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{site.summary}</p>
          <p className="mt-4 max-w-2xl text-lg">{site.goal}</p>
          <dl className="mt-12 grid gap-8 sm:grid-cols-3">
            {site.stats.map((s) => (
              <div key={s.label}>
                <dd className="text-4xl font-semibold">{s.value}</dd>
                <dt className="mt-1 text-sm text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            {site.objectives.map((o) => (
              <li key={o} className="border-t pt-4 text-sm">
                {o}
              </li>
            ))}
          </ul>
        </section>

        <section id="tools">
          <h2 className="text-3xl font-semibold tracking-tight">Tools</h2>
          <div className="mt-10 grid gap-16">
            {tools.map((tool) => (
              <article key={tool.slug} className="grid gap-8 md:grid-cols-2">
                {"image" in tool ? (
                  <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="border" />
                ) : (
                  <ImagePlaceholder label={tool.name} />
                )}
                <div>
                  <h3 className="text-xl font-semibold">{tool.name}</h3>
                  <p className="mt-3 text-muted-foreground">{tool.description}</p>
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
                    {tool.capabilities.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <a href={tool.url} className="mt-5 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline">
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="data">
          <h2 className="text-3xl font-semibold tracking-tight">Data releases</h2>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Crop</th>
                  <th className="py-2 pr-4 font-medium">Accessions</th>
                  <th className="py-2 pr-4 font-medium">Reference assembly</th>
                  <th className="py-2 pr-4 font-medium">Released</th>
                  <th className="py-2 font-medium">DOI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dataReleases.map((r) => (
                  <tr key={r.doi}>
                    <td className="py-2 pr-4">{r.crop}</td>
                    <td className="py-2 pr-4 tabular-nums">{formatNumber(r.accessions)}</td>
                    <td className="py-2 pr-4">{r.assembly}</td>
                    <td className="py-2 pr-4">{formatDate(r.released)}</td>
                    <td className="py-2">
                      <a href={r.doi} className="underline-offset-4 hover:underline">
                        {r.doi.replace("https://doi.org/", "")}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="mt-16 text-xl font-semibold">Mappings and standards</h3>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {standards.map((s) => (
              <div key={s.name}>
                <dt className="font-medium">{s.name}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{s.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="news">
          <h2 className="text-3xl font-semibold tracking-tight">News</h2>
          <ol className="mt-10 divide-y border-y">
            {news.map((n) => (
              <li key={n.date + n.title} className="grid gap-2 py-5 sm:grid-cols-[10rem_1fr]">
                <time dateTime={n.date} className="text-sm text-muted-foreground">
                  {formatDate(n.date)}
                </time>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{n.title}</h3>
                    <Badge variant="outline">{n.kind}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-10 text-sm text-muted-foreground">
          <p className="max-w-2xl">{funding.acknowledgement}</p>
          <p className="mt-4">{funding.partners.join(" · ")}</p>
        </div>
      </footer>
    </>
  );
}
