import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { formatDate, formatNumber, news, standards, tools } from "@/content";
import {
  drillRows,
  isSuperseded,
  plotStyle,
  plots,
  slotAt,
  solid,
  tint,
  type Slot,
} from "../_lib/plots";

const mono = "font-(family-name:--tp-mono)";
const display = "font-(family-name:--tp-display)";

/** A hatched guard strip between ranges, like the buffer rows that separate trial plots. */
export function Buffer() {
  return (
    <div
      aria-hidden
      className={`my-1 flex h-6 items-center justify-center text-[10px] tracking-[0.3em] text-foreground/60 uppercase ${mono}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(-45deg, color-mix(in oklab, currentColor 35%, transparent) 0 1px, transparent 1px 7px)",
      }}
    >
      <span className="bg-background px-2">Buffer</span>
    </div>
  );
}

/** Small plot id stencilled in the corner of a plot. */
function PlotId({ id }: { id: string | number }) {
  return (
    <span
      className={`block text-[11px] tracking-wider tabular-nums opacity-75 ${mono}`}
    >
      {id}
    </span>
  );
}

/**
 * Tools as ranges of plots: one wide canopy plot for the tool, a plot for its screenshot,
 * and a row of small plots for each capability. Ranges are numbered 210, 220, ...
 */
export function ToolRanges() {
  return (
    <div>
      {tools.map((tool, i) => {
        const slot = slotAt(i);
        const range = 210 + i * 10;
        return (
          <div key={tool.slug}>
            {i > 0 && <Buffer />}
            <article className="grid gap-1.5">
              <div className="grid gap-1.5 lg:grid-cols-[5fr_4fr]">
                <div
                  className="flex flex-col p-5 sm:p-8"
                  style={{ ...solid(slot), ...drillRows(90) }}
                >
                  <PlotId id={range} />
                  <h3
                    className={`mt-3 text-5xl leading-[0.9] font-extrabold tracking-tight sm:text-7xl ${display}`}
                  >
                    {tool.name}
                  </h3>
                  <p className="mt-5 max-w-prose text-lg leading-snug font-medium">
                    {tool.summary}
                  </p>
                  <p className="mt-3 max-w-prose text-sm leading-relaxed opacity-85">
                    {tool.description}
                  </p>
                  <a
                    href={tool.url}
                    className={`mt-auto inline-flex items-center gap-1 self-start pt-6 text-sm underline underline-offset-4 hover:no-underline ${mono}`}
                  >
                    Open {tool.name} <ArrowUpRightIcon className="size-4" />
                  </a>
                </div>
                <div
                  className="flex items-center p-3 sm:p-5"
                  style={tint(slot, 30)}
                >
                  {"image" in tool ? (
                    <Image
                      src={tool.image}
                      alt={`${tool.name} screenshot`}
                      width={1421}
                      height={876}
                      className="w-full outline outline-foreground/20"
                    />
                  ) : (
                    <ImagePlaceholder
                      label={tool.name}
                      className="w-full border-foreground/40 text-foreground/70"
                    />
                  )}
                </div>
              </div>
              <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
                {tool.capabilities.map((c, j) => (
                  <li
                    key={c}
                    className="p-3 text-sm leading-snug"
                    style={tint(slot)}
                  >
                    <PlotId id={range + j + 1} />
                    <p className="mt-2">{c}</p>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        );
      })}
    </div>
  );
}

/** Field register: every plot from the hero map as a row, with a bar sized against the largest release. */
export function Register() {
  const largest = Math.max(...plots.map((p) => p.accessions));
  return (
    <div>
      <div
        className={`hidden grid-cols-[4rem_7rem_1fr_13rem_7rem_8rem] gap-4 border-b-2 border-foreground pb-2 text-[11px] tracking-wider uppercase md:grid ${mono}`}
      >
        <span>Plot</span>
        <span>Crop</span>
        <span>Accessions</span>
        <span>Reference assembly</span>
        <span>Released</span>
        <span>DOI</span>
      </div>
      <ol>
        {plots.map((p) => (
          <li
            key={p.doi}
            className={`grid grid-cols-[3rem_1fr] gap-x-3 gap-y-1 border-b border-foreground/25 py-3 md:grid-cols-[4rem_7rem_1fr_13rem_7rem_8rem] md:items-center md:gap-4 ${isSuperseded(p) ? "opacity-70" : ""}`}
          >
            <span
              className={`row-span-5 text-sm tabular-nums md:row-span-1 ${mono}`}
            >
              {p.plot}
            </span>
            <span className={`text-xl font-bold md:text-base ${display}`}>
              {p.crop}
              {isSuperseded(p) && (
                <span
                  className={`ml-2 text-[10px] font-normal tracking-wider uppercase ${mono}`}
                >
                  superseded
                </span>
              )}
            </span>
            <span className="flex items-center gap-3">
              <span className="h-4 grow">
                <span
                  className="block h-full"
                  style={{
                    ...plotStyle(p),
                    width: `${(p.accessions / largest) * 100}%`,
                  }}
                />
              </span>
              <span
                className={`w-14 shrink-0 text-right text-sm tabular-nums ${mono}`}
              >
                {formatNumber(p.accessions)}
              </span>
            </span>
            <span className="text-sm">{p.assembly}</span>
            <span className={`text-sm tabular-nums ${mono}`}>
              {formatDate(p.released)}
            </span>
            <a
              href={p.doi}
              className={`inline-flex items-center gap-1 text-sm underline-offset-4 hover:underline ${mono}`}
              aria-label={`DOI for plot ${p.plot}`}
            >
              {p.doi.split("/").at(-1)}
              <ArrowUpRightIcon className="size-3.5" />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Mappings and standards as numbered trial protocols. */
export function Protocols() {
  return (
    <ol className="grid gap-1.5 sm:grid-cols-2">
      {standards.map((s, i) => (
        <li key={s.name} className="p-5" style={tint(slotAt(i), 18)}>
          <PlotId id={`3${String(i + 1).padStart(2, "0")}`} />
          <h4 className={`mt-2 text-2xl leading-tight font-bold ${display}`}>
            {s.name}
          </h4>
          <p className="mt-2 text-sm leading-relaxed">{s.detail}</p>
        </li>
      ))}
    </ol>
  );
}

// News plots numbered 401, 402, ... newest first, grouped into one range per year.
const newsPlots = news.map((n, i) => ({ ...n, plot: 401 + i }));
const years = [...new Set(news.map((n) => n.date.slice(0, 4)))];

/** News as one range per year, each update a plot. Tool releases and data releases are sown in different colours. */
export function NewsRanges() {
  return (
    <div>
      {years.map((year, yi) => (
        <div key={year}>
          {yi > 0 && <Buffer />}
          <div className="grid gap-1.5 md:grid-cols-[6rem_1fr]">
            <h3
              className={`text-5xl leading-none font-extrabold tracking-tight md:pt-2 md:text-4xl ${display}`}
            >
              {year}
            </h3>
            <ol className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-1.5">
              {newsPlots
                .filter((n) => n.date.startsWith(year))
                .map((n) => {
                  const slot: Slot = n.kind === "tool" ? 2 : 4;
                  return (
                    <li
                      key={n.date + n.title}
                      className="flex flex-col p-4"
                      style={{ ...tint(slot, 26), ...drillRows(0) }}
                    >
                      <span
                        className={`flex items-center justify-between gap-2 text-[11px] tracking-wider uppercase ${mono}`}
                      >
                        <span className="tabular-nums">
                          {n.plot} ·{" "}
                          <time dateTime={n.date}>{formatDate(n.date)}</time>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="size-2.5" style={solid(slot)} />
                          {n.kind === "tool" ? "Tool" : "Data"}
                        </span>
                      </span>
                      <h4
                        className={`mt-3 text-xl leading-tight font-bold ${display}`}
                      >
                        {n.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed">{n.body}</p>
                    </li>
                  );
                })}
            </ol>
          </div>
        </div>
      ))}
    </div>
  );
}
