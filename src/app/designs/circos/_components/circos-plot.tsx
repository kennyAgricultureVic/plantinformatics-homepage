"use client";

import { useState } from "react";
import { site } from "@/content";
import {
  R,
  TAU,
  annulus,
  barRadius,
  cropSegments,
  focusFor,
  links,
  newsTicks,
  polar,
  ribbon,
  spoke,
  toolSegments,
  type Focus,
  type Segment,
} from "./geometry";

const VIEW = 560;

// Tangential label for a segment, flipped on the lower half so it never reads upside down.
function SegmentLabel({ segment }: { segment: Segment }) {
  const mid = (segment.start + segment.end) / 2;
  const deg = (mid * 180) / Math.PI;
  const flip = mid > Math.PI / 2 && mid < (3 * Math.PI) / 2;
  return (
    <text
      transform={flip ? `rotate(${deg + 180}) translate(0 ${R.label})` : `rotate(${deg}) translate(0 ${-R.label})`}
      textAnchor="middle"
      dominantBaseline={flip ? "hanging" : "auto"}
      className="fill-foreground font-(family-name:--font-circos-display) text-[27px] font-medium tracking-tight"
    >
      {segment.label}
    </text>
  );
}

/**
 * The hero Circos plot. Outer ring: crop ideograms (one band per chromosome) and tool segments.
 * Inner track: release histograms and tool capability bars. Outermost: news ticks. Ribbons join
 * releases to the tools that serve them. Hover or focus lights up connections; click jumps to the section.
 */
export function CircosPlot() {
  const [focus, setFocus] = useState<Focus | null>(null);
  const lit = (keys: readonly string[]) => !focus || keys.some((k) => focus.keys.includes(k));
  const bind = (f: Focus) => ({
    onPointerEnter: () => setFocus(f),
    onPointerLeave: () => setFocus(null),
    onFocus: () => setFocus(f),
    onBlur: () => setFocus(null),
  });

  return (
    <figure className="w-full">
      <svg
        viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`}
        className="h-auto w-full touch-manipulation select-none"
        aria-label="Circos plot linking crop data releases to the tools that serve them"
      >
        {/* Faint guide circles for each track. */}
        <g fill="none" className="stroke-foreground/10" strokeWidth={1}>
          {[R.ribbon, R.histOut, R.newsIn, R.newsOut].map((r) => (
            <circle key={r} r={r} />
          ))}
        </g>

        {/* Ribbons, drawn first so the rings sit on top. */}
        <g className="mix-blend-multiply dark:mix-blend-screen">
          {links.map((l) => (
            <path
              key={`${l.arc.id}-${l.tool.key}`}
              d={ribbon(R.ribbon, l.a0, l.a1, l.b0, l.b1)}
              style={{ fill: l.tool.color, opacity: lit(l.keys) ? (focus ? 0.9 : 0.55) : 0.06 }}
              className="transition-opacity duration-300"
            />
          ))}
        </g>

        {/* Crops: ideogram bands, scale ticks every 5k accessions, release histogram bars. */}
        {cropSegments.map((crop) => (
          <g key={crop.key}>
            <a href={crop.href} aria-label={`${crop.label}: go to data`} {...bind(focusFor.segment(crop))} className="outline-none">
              <path d={annulus(R.ideoIn, R.ideoOut, crop.start, crop.end)} className="fill-transparent" />
              {crop.bands.map((b, i) => (
                <path
                  key={b.item}
                  d={annulus(R.ideoIn, R.ideoOut, b.start, b.end)}
                  className={
                    focus?.id === crop.key ? "fill-foreground" : i % 2 ? "fill-foreground/45" : "fill-foreground/85"
                  }
                />
              ))}
            </a>
            <path d={crop.ticks.map((a) => spoke(R.tickIn, R.ideoIn - 2, a)).join("")} className="stroke-foreground/60" strokeWidth={1.5} />
            {crop.releases.map((arc) => {
              const superseded = "superseded" in arc.release;
              return (
                <a key={arc.id} href={`#${arc.id}`} aria-label={`${arc.release.crop} release`} {...bind(focusFor.release(arc))} className="outline-none">
                  <path
                    d={annulus(R.histIn, barRadius(arc.release), arc.start, arc.end)}
                    strokeWidth={2}
                    className={
                      superseded
                        ? "fill-transparent stroke-foreground/70 [stroke-dasharray:6_5]"
                        : focus?.id === arc.id
                          ? "fill-foreground"
                          : "fill-foreground/70"
                    }
                  />
                </a>
              );
            })}
            <SegmentLabel segment={crop} />
          </g>
        ))}

        {/* Tools: palette-coloured ideogram segments with one inner bar per capability. */}
        {toolSegments.map((tool) => {
          const caps = tool.tool.capabilities.length;
          const step = (tool.end - tool.start) / caps;
          return (
            <g key={tool.key}>
              <a href={tool.href} aria-label={`${tool.label}: go to tool`} {...bind(focusFor.segment(tool))} className="outline-none">
                <path
                  d={annulus(R.ideoIn, R.ideoOut + (focus?.id === tool.key ? 10 : 0), tool.start, tool.end)}
                  style={{ fill: tool.color }}
                />
                {tool.tool.capabilities.map((c, i) => (
                  <path
                    key={c}
                    d={annulus(R.histIn, R.histIn + 18 + 9 * i, tool.start + step * i + 0.008, tool.start + step * (i + 1) - 0.008)}
                    style={{ fill: tool.color }}
                    opacity={0.7}
                  />
                ))}
              </a>
              <SegmentLabel segment={tool} />
            </g>
          );
        })}

        {/* News: one tick per item on the segment it mentions. */}
        {newsTicks.map((t) => {
          const f = focusFor.news(t);
          return (
            <a key={t.index} href="#news" aria-label={t.item.title} {...bind(f)} className="outline-none">
              <path d={annulus(R.newsIn - 4, R.newsOut + 4, t.angle - 0.03, t.angle + 0.03)} className="fill-transparent" />
              <path
                d={spoke(R.newsIn, focus?.id === f.id ? R.newsOut + 14 : R.newsOut, t.angle)}
                strokeWidth={focus?.id === f.id ? 6 : 4}
                strokeLinecap="round"
                style={{ stroke: t.color ?? "var(--foreground)" }}
              />
              <circle {...pointAt(R.newsOut, t.angle)} r={5} style={{ fill: t.color ?? "var(--foreground)" }} />
            </a>
          );
        })}

        {/* Quarter-turn marks on the outer guide, like a plot axis. */}
        <path d={[0, 1, 2, 3].map((q) => spoke(R.newsOut + 18, R.newsOut + 30, (q * TAU) / 4 + TAU / 8)).join("")} className="stroke-foreground/30" strokeWidth={1} />
      </svg>

      <figcaption aria-live="polite" className="mt-4 min-h-[4.5rem] border-l-2 border-foreground pl-4 font-(family-name:--font-circos-mono) text-sm">
        {focus ? (
          <>
            <p className="font-semibold">{focus.title}</p>
            {focus.lines.map((line) => (
              <p key={line} className="text-muted-foreground">
                {line}
              </p>
            ))}
          </>
        ) : (
          <>
            <p className="font-semibold">
              {site.stats[0].value} {site.stats[0].label.toLowerCase()}
            </p>
            <p className="text-muted-foreground">Hover a segment to trace its links. Click to jump to it.</p>
          </>
        )}
      </figcaption>
    </figure>
  );
}

const pointAt = (r: number, a: number) => {
  const [cx, cy] = polar(r, a);
  // Rounded so server and client agree on trig results during hydration.
  return { cx: +cx.toFixed(2), cy: +cy.toFixed(2) };
};
