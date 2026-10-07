import { formatDate, news, type NewsKind } from "@/content";
import { cn } from "@/lib/utils";
import { crozier, turnsFor } from "./fiddlehead";

export const kindInk = (kind: NewsKind) => (kind === "data" ? "var(--ink0)" : "var(--ink-alt)");

const SPACING = 64;
const BASE = 150;

/** Oldest on the left, newest on the right: the row unrolls backwards in time. */
const timeline = news.toReversed();

/**
 * Every news item as a fiddlehead on one ground line, evenly spaced in date order, with a year
 * mark where the year changes. Server rendered: the curves are pure functions of the dates.
 */
export function NewsFrieze() {
  const width = timeline.length * SPACING;
  return (
    <svg viewBox={`0 0 ${width} ${BASE + 34}`} role="img" aria-label="News as fiddleheads, oldest unrolled on the left, newest curled on the right" className="w-full min-w-[36rem] overflow-visible">
      <line x1={0} x2={width} y1={BASE} y2={BASE} stroke="currentColor" strokeOpacity={0.4} vectorEffect="non-scaling-stroke" />
      {timeline.map((item, i) => {
        const x = SPACING * (i + 0.5);
        const c = crozier(turnsFor(item.date), 118);
        const year = item.date.slice(0, 4);
        const newYear = i === 0 || timeline[i - 1].date.slice(0, 4) !== year;
        return (
          <g key={`${item.date}${item.title}`}>
            <title>{`${formatDate(item.date)}: ${item.title}`}</title>
            <g transform={`translate(${x - (c.minX + c.maxX) / 2 + 4} ${BASE})`} fill="none" stroke={kindInk(item.kind)} strokeLinecap="round">
              <path d={c.stalk} strokeWidth={2.4} pathLength={1} className="fern-unroll" style={{ ["--delay" as string]: `${i * 70}ms` }} />
              <path d={c.pinnae} strokeWidth={1.3} />
            </g>
            {newYear && (
              <g>
                <line x1={x - SPACING / 2} x2={x - SPACING / 2} y1={BASE} y2={BASE + 10} stroke="currentColor" vectorEffect="non-scaling-stroke" />
                <text x={x - SPACING / 2 + 4} y={BASE + 28} fill="currentColor" className="font-display" fontSize={18}>
                  {year}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** One item's fiddlehead on its own, for the list beside the text. */
export function Fiddlehead({ date, kind, className }: { date: string; kind: NewsKind; className?: string }) {
  const c = crozier(turnsFor(date), 118);
  const pad = 4;
  return (
    <svg
      viewBox={`${c.minX - pad} ${c.minY - pad} ${c.maxX - c.minX + pad * 2} ${c.maxY - c.minY + pad * 2}`}
      aria-hidden
      className={cn("overflow-visible", className)}
    >
      <g fill="none" stroke={kindInk(kind)} strokeLinecap="round">
        <path d={c.stalk} strokeWidth={3.2} />
        <path d={c.pinnae} strokeWidth={1.8} />
      </g>
    </svg>
  );
}
