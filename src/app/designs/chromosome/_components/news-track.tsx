"use client";

import { useState } from "react";
import { formatDate, news, type NewsKind } from "@/content";
import { cn } from "@/lib/utils";
import { tint } from "./genome";
import { GutterLabel, Ruler, TrackRow, type Mark } from "./track";

const day = 86_400_000;
const times = news.map((n) => Date.parse(n.date));
// Pad the axis by two months either side so edge ticks are not glued to the frame.
const t0 = Math.min(...times) - 60 * day;
const t1 = Math.max(...times) + 60 * day;
const at = (t: number) => (t - t0) / (t1 - t0);

// Ruler marks on every 1 Jan and 1 Jul inside the axis.
const marks: Mark[] = [];
for (let y = new Date(t0).getUTCFullYear(); y <= new Date(t1).getUTCFullYear(); y++) {
  for (const m of [0, 6]) {
    const t = Date.UTC(y, m, 1);
    if (t >= t0 && t <= t1) marks.push({ at: at(t), label: m === 0 ? String(y) : `Jul ${String(y).slice(2)}` });
  }
}

const lanes = [
  { kind: "tool", label: "Tool releases", color: "var(--p2)" },
  { kind: "data", label: "Data releases", color: "var(--p3)" },
] as const satisfies readonly { kind: NewsKind; label: string; color: string }[];

const laneFor = (kind: NewsKind) => lanes.find((l) => l.kind === kind) ?? lanes[0];

/**
 * News as a feature track: one lane per kind with a tick per item on a shared time axis, then
 * the items as rows. Hovering a tick or a row highlights its partner.
 */
export function NewsTrack() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <TrackRow className="border-b border-foreground/20" label={<GutterLabel kind="time axis" name="Releases over time" />}>
        <Ruler marks={marks} minor={6} />
        <div className="mt-3 grid gap-2" onMouseLeave={() => setActive(null)}>
          {lanes.map((lane) => (
            <div key={lane.kind} className="relative h-10">
              <span className="absolute inset-x-0 top-1/2 h-px bg-foreground/25" />
              <span className="absolute -top-0.5 left-0 font-(family-name:--font-martian) text-[10px] text-muted-foreground">{lane.label}</span>
              {news.map((n, i) =>
                n.kind === lane.kind ? (
                  <a
                    key={i}
                    href={`#news-${i}`}
                    aria-label={`${formatDate(n.date)}: ${n.title}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    className={cn(
                      "absolute bottom-0 h-6 w-1 -translate-x-1/2 transition-[height,opacity] outline-offset-2 focus-visible:outline-2 focus-visible:outline-foreground sm:w-1.5",
                      active === i && "h-10",
                      active !== null && active !== i && "opacity-30",
                    )}
                    style={{ left: `${at(times[i]) * 100}%`, background: lane.color }}
                  />
                ) : null,
              )}
            </div>
          ))}
        </div>
      </TrackRow>

      <ol onMouseLeave={() => setActive(null)}>
        {news.map((n, i) => {
          const lane = laneFor(n.kind);
          return (
            <li key={n.date + n.title} id={`news-${i}`} onMouseEnter={() => setActive(i)}
              className="scroll-mt-32 transition-colors"
              style={{ background: active === i ? tint(lane.color, 14) : undefined }}
            >
              <TrackRow
                className="border-b border-foreground/20"
                label={
                  <div className="flex items-start gap-2 md:justify-between">
                    <time dateTime={n.date} className="font-bold tabular-nums">
                      {formatDate(n.date)}
                    </time>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="size-2" style={{ background: lane.color }} />
                      {n.kind}
                    </span>
                  </div>
                }
              >
                <h3 className="font-(family-name:--font-martian) text-sm font-bold">{n.title}</h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{n.body}</p>
              </TrackRow>
            </li>
          );
        })}
      </ol>
    </>
  );
}
