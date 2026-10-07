"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
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
  totalAccessions,
  type SectionId,
} from "@/content";
import { cn } from "@/lib/utils";
import { PER_CRATE, fieldRegion, regions, type Region } from "./iso";
import { World, type WorldEvents } from "./world";

const display = "font-(family-name:--font-iso-display)";
const label = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;

/** Where each section lives in the station. */
const places: Record<SectionId, { name: string; swatch: string; caption: string }> = {
  about: { name: "Field plots", swatch: "bg-(--z1)", caption: crops.join(", ") },
  tools: { name: "Lab", swatch: "bg-(--z2)", caption: tools.map((t) => t.name).join(", ") },
  data: {
    name: "Seed store",
    swatch: "bg-(--z3)",
    caption: `${dataReleases.length} releases, ${formatNumber(totalAccessions)} genotypes`,
  },
  news: { name: "Noticeboard", swatch: "bg-(--z4)", caption: news[0].title },
};

/** What the caption says about a lit item. */
function describe(focus: string): string | null {
  const [kind, ...rest] = focus.split(":");
  const key = rest.join(":");
  if (kind === "crop") return `${places.about.name}: ${key}`;
  if (kind === "tool") {
    const t = tools.find((x) => x.slug === key);
    return t ? `${t.name}: ${t.summary}` : null;
  }
  if (kind === "release") {
    const r = dataReleases.find((x) => x.doi === key);
    return r ? `${r.crop}: ${formatNumber(r.accessions)} accessions, ${formatDate(r.released)}` : null;
  }
  if (kind === "news") {
    const n = news.find((x) => `${x.date}:${x.title}` === key);
    return n ? `${formatDate(n.date)}: ${n.title}` : null;
  }
  return null;
}

const wideQuery = "(min-width: 1024px)";
const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia(wideQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
/** True on wide screens, false on narrow ones, null while rendering on the server. */
const useWide = () =>
  useSyncExternalStore<boolean | null>(
    subscribeWide,
    () => window.matchMedia(wideQuery).matches,
    () => null,
  );

/** Frames one region of the world inside its own box, scaling to fit. */
function Camera({ region, className, children }: { region: Region; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  let transform = "";
  if (size) {
    const rw = region.x1 - region.x0;
    const rh = region.y1 - region.y0;
    const z = Math.min(size.w / rw, size.h / rh);
    const cx = (region.x0 + region.x1) / 2;
    const cy = (region.y0 + region.y1) / 2;
    transform = `translate(${size.w / 2 - cx * z}px, ${size.h / 2 - cy * z}px) scale(${z})`;
  }
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {size && (
        <div className="iso-camera absolute top-0 left-0" style={{ transform }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SectionHead({ id }: { id: Exclude<SectionId, "about"> }) {
  return (
    <header className="mb-10">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className={cn("size-3 border border-foreground/40", places[id].swatch)} />
        {places[id].name}
      </p>
      <h2 className={`${display} mt-3 text-4xl font-medium tracking-tight sm:text-5xl`}>{label(id)}</h2>
    </header>
  );
}

export function Station() {
  const wide = useWide();
  const [active, setActive] = useState<SectionId>("about");
  const [zoneOn, setZoneOn] = useState<SectionId | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const events: WorldEvents = { zoneOn, focus, onZone: setZoneOn, onFocus: setFocus };

  // The camera follows whichever section crosses the middle of the viewport.
  useEffect(() => {
    if (!wide) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id as SectionId);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [wide]);

  const lit = (id: string) => ({
    "data-on": focus === id ? "" : undefined,
    onPointerEnter: () => setFocus(id),
    onPointerLeave: () => setFocus(null),
  });
  const caption = (focus && describe(focus)) ?? (zoneOn && `${places[zoneOn].name}: ${places[zoneOn].caption}`);
  // Narrow screens: no pan, a fixed crop of the world above each section instead.
  const crop = (region: Region, figures = false) =>
    wide === false && (
      <div style={{ aspectRatio: `${region.x1 - region.x0} / ${region.y1 - region.y0}` }} className="mb-10">
        <Camera region={region} className="size-full">
          <World events={events} figures={figures} />
        </Camera>
      </div>
    );

  return (
    <div className="iso-root flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="flex h-14 items-center gap-6 px-4 sm:px-6">
          <a href="#about" className={`${display} text-lg font-semibold tracking-tight whitespace-nowrap`}>
            {site.name}
          </a>
          <nav className="ml-auto hidden gap-6 text-sm sm:flex">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={wide && active === s.id ? "true" : undefined}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground aria-current:text-foreground"
              >
                <span className={cn("hidden size-2 sm:block", places[s.id].swatch)} />
                {s.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(24rem,32rem)_1fr]">
        <main className="min-w-0 px-4 sm:px-8 lg:border-r [&>section]:scroll-mt-14 [&>section]:py-16 lg:[&>section]:min-h-[calc(100svh-3.5rem)] lg:[&>section]:py-20">
          <section id="about">
            {crop(fieldRegion, true)}
            <h1 className={`${display} text-4xl leading-[1.05] font-medium tracking-tight sm:text-5xl`}>{site.tagline}</h1>
            <p className="mt-6 text-muted-foreground">{site.summary}</p>
            <p className="mt-4">{site.goal}</p>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-y py-6">
              {site.stats.map((s) => (
                <div key={s.label}>
                  <dd className={`${display} text-3xl font-medium tabular-nums sm:text-4xl`}>{s.value}</dd>
                  <dt className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</dt>
                </div>
              ))}
            </dl>
            <ul className="mt-8 space-y-3 text-sm">
              {site.objectives.map((o) => (
                <li key={o} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 bg-(--z1) outline outline-foreground/40" />
                  {o}
                </li>
              ))}
            </ul>
            <nav aria-label="The station" className="mt-10 grid grid-cols-2 border-t border-l">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onPointerEnter={() => setZoneOn(s.id)}
                  onPointerLeave={() => setZoneOn(null)}
                  onFocus={() => setZoneOn(s.id)}
                  onBlur={() => setZoneOn(null)}
                  className="group flex items-center gap-3 border-r border-b p-3 text-sm hover:bg-muted"
                >
                  <span className={cn("size-4 shrink-0 border border-foreground/40", places[s.id].swatch)} />
                  <span>
                    <span className="block font-medium">{places[s.id].name}</span>
                    <span className="block text-muted-foreground">{s.label}</span>
                  </span>
                </a>
              ))}
            </nav>
          </section>

          <section id="tools">
            {crop(regions.tools)}
            <SectionHead id="tools" />
            <div className="divide-y border-y">
              {tools.map((tool) => (
                <article
                  key={tool.slug}
                  {...lit(`tool:${tool.slug}`)}
                  className="py-8 transition-colors data-on:bg-(--z2)/15"
                >
                  <h3 className={`${display} flex items-center gap-2 text-2xl font-medium`}>
                    <span className="size-3 bg-(--z2) outline outline-foreground/40" />
                    {tool.name}
                  </h3>
                  <p className="mt-3 text-muted-foreground">{tool.description}</p>
                  {"image" in tool && (
                    <Image
                      src={tool.image}
                      alt={`${tool.name} screenshot`}
                      width={1421}
                      height={876}
                      className="mt-5 border"
                      sizes="(min-width: 1024px) 30rem, 100vw"
                    />
                  )}
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {tool.capabilities.map((c) => (
                      <li key={c} className="flex gap-2.5">
                        <span className="mt-2 h-px w-3 shrink-0 bg-foreground/50" />
                        {c}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tool.url}
                    className="mt-5 inline-flex items-center gap-1 border border-foreground px-3 py-1.5 text-sm font-medium hover:bg-foreground hover:text-background"
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section id="data">
            {crop(regions.data)}
            <SectionHead id="data" />
            <p className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-3 border border-foreground/40 bg-(--z3)" />
              One crate is {formatNumber(PER_CRATE)} accessions
            </p>
            <ul className="divide-y border-y">
              {dataReleases.map((r) => (
                <li
                  key={r.doi}
                  {...lit(`release:${r.doi}`)}
                  className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 py-4 transition-colors data-on:bg-(--z3)/15"
                >
                  <span className={`${display} flex items-center gap-2 text-lg font-medium`}>
                    <span
                      className={cn(
                        "size-3 outline outline-foreground/40",
                        "superseded" in r ? "bg-(--z3)/35" : "bg-(--z3)",
                      )}
                    />
                    {r.crop}
                  </span>
                  <span className={`${display} text-lg font-medium tabular-nums`}>{formatNumber(r.accessions)}</span>
                  <span className="text-sm text-muted-foreground">
                    {r.assembly}, {formatDate(r.released)}
                    {"superseded" in r && ", superseded"}
                  </span>
                  <a href={r.doi} className="text-sm underline-offset-4 hover:underline">
                    DOI
                  </a>
                </li>
              ))}
            </ul>
            <h3 className={`${display} mt-14 text-2xl font-medium`}>Mappings and standards</h3>
            <dl className="mt-6 space-y-5">
              {standards.map((s) => (
                <div key={s.name}>
                  <dt className="font-medium">{s.name}</dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.detail}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="news">
            {crop(regions.news)}
            <SectionHead id="news" />
            <ol className="divide-y border-y">
              {news.map((n) => (
                <li
                  key={n.date + n.title}
                  {...lit(`news:${n.date}:${n.title}`)}
                  className={cn(
                    "py-5 transition-colors",
                    n.kind === "tool" ? "data-on:bg-(--z2)/15" : "data-on:bg-(--z3)/15",
                  )}
                >
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <time dateTime={n.date}>{formatDate(n.date)}</time>
                    <span className="flex items-center gap-1.5">
                      <span className={cn("size-2.5 outline outline-foreground/40", n.kind === "tool" ? "bg-(--z2)" : "bg-(--z3)")} />
                      {n.kind === "tool" ? "Tool release" : "Data release"}
                    </span>
                  </div>
                  <h3 className="mt-1.5 font-medium">{n.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </li>
              ))}
            </ol>
          </section>
        </main>

        {wide && (
          <aside aria-label="Station map" className="sticky top-14 h-[calc(100svh-3.5rem)]">
            <Camera region={regions[active]} className="size-full">
              <World events={events} />
            </Camera>
            <p
              aria-live="polite"
              className="pointer-events-none absolute bottom-6 left-6 max-w-md border bg-background px-3 py-2 text-sm empty:hidden"
            >
              {caption || ""}
            </p>
          </aside>
        )}
      </div>

      <footer className="border-t">
        <div className="grid gap-6 px-4 py-10 text-sm text-muted-foreground sm:px-8 md:grid-cols-[2fr_1fr]">
          <p className="max-w-2xl">{funding.acknowledgement}</p>
          <div>
            <p>{funding.partners.join(" · ")}</p>
            <a href={site.github} className="mt-3 inline-flex items-center gap-1 text-foreground hover:underline">
              GitHub <ArrowUpRightIcon className="size-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
