import type { ReactNode } from "react";
import { formatDate, news, sections, site, type NewsItem, type SectionId } from "@/content";

export const display = "font-(family-name:--font-blueprint-display)";
/** Small capitals lettering used on title blocks, tables and drawing notes. */
export const lettering = `${display} text-[0.8rem] font-medium uppercase tracking-[0.12em]`;

const sheetWords = ["one", "two", "three", "four", "five", "six"];
const zones = ["A", "B", "C", "D", "E", "F"];

/** Revision letter for a news item: the oldest item is A, so letters stay put as news is added. */
export const revision = (item: NewsItem) => {
  const n = news.length - 1 - news.indexOf(item as (typeof news)[number]);
  return n < 26 ? String.fromCharCode(65 + n) : `A${String.fromCharCode(65 + n - 26)}`;
};

export const latestDate = formatDate(news[0].date);

/** Third-angle projection symbol: a truncated cone seen from the side and the end. */
function ProjectionSymbol() {
  return (
    <svg viewBox="0 0 64 28" className="h-6 w-14" aria-label="Third angle projection" role="img">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4 7 L26 3 L26 25 L4 21 Z" />
        <circle cx="48" cy="14" r="11" />
        <circle cx="48" cy="14" r="5.5" />
      </g>
      <g stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 2">
        <line x1="0" y1="14" x2="30" y2="14" />
        <line x1="34" y1="14" x2="62" y2="14" />
      </g>
    </svg>
  );
}

function Cell({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`border-(--bp-ink) px-2.5 py-1.5 ${className}`}>
      <div className={`${display} text-[0.65rem] uppercase tracking-[0.16em] text-(--bp-soft)`}>{label}</div>
      <div className={`${display} text-base leading-tight font-semibold uppercase tracking-wide`}>{children}</div>
    </div>
  );
}

/** The drawing's title block: title, project, sheet number in words, scale, date and projection. */
export function TitleBlock({ title, sheet, scale = "Not to scale" }: { title: string; sheet: number; scale?: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] border-2 border-(--bp-ink)">
      <Cell label="Drawing title" className="col-span-2 border-b">
        <span className="text-xl">{title}</span>
      </Cell>
      <Cell label="Project" className="border-r border-b">
        {site.name}
      </Cell>
      <Cell label="Sheet" className="border-b">
        {sheetWords[sheet - 1]} of {sheetWords[sections.length - 1]}
      </Cell>
      <Cell label="Scale" className="border-r">
        {scale}
      </Cell>
      <Cell label="Date">{latestDate}</Cell>
      <div className="col-span-2 flex items-center justify-between gap-3 border-t border-(--bp-ink) px-2.5 py-1.5 text-(--bp-accent)">
        <span className={`${display} text-[0.65rem] uppercase tracking-[0.16em]`}>Third angle projection</span>
        <ProjectionSymbol />
      </div>
    </div>
  );
}

/** Revision table: one row per news item, letter, date and title. */
export function RevisionTable({ items }: { items: readonly NewsItem[] }) {
  return (
    <table className="w-full border-2 border-(--bp-ink) text-left text-sm">
      <caption className={`${lettering} border-2 border-b-0 border-(--bp-ink) px-2.5 py-1 text-left`}>Revisions</caption>
      <thead className={lettering}>
        <tr className="border-b border-(--bp-ink)">
          <th className="w-10 border-r border-(--bp-ink) px-2 py-1 font-medium">Rev</th>
          <th className="w-28 border-r border-(--bp-ink) px-2 py-1 font-medium">Date</th>
          <th className="px-2 py-1 font-medium">Description</th>
        </tr>
      </thead>
      <tbody>
        {items.map((n) => (
          <tr key={n.date + n.title} className="border-b border-(--bp-faint) last:border-0">
            <td className={`${display} border-r border-(--bp-ink) px-2 py-1 text-center font-semibold text-(--bp-accent)`}>
              {revision(n)}
            </td>
            <td className="border-r border-(--bp-ink) px-2 py-1 whitespace-nowrap tabular-nums">{formatDate(n.date)}</td>
            <td className="px-2 py-1">{n.title}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type SheetProps = {
  id: SectionId;
  sheet: number;
  /** Shown in the title block, e.g. "Parts list". The section label heads the sheet. */
  title: string;
  scale?: string;
  /** News items for this sheet's revision table. Omit for no table. */
  revisions?: readonly NewsItem[];
  children: ReactNode;
};

/**
 * One drawing sheet: a trimmed outer frame, zone letters in the margin, an inner drawing border,
 * and the title block (with revisions) along the bottom right.
 */
export function Sheet({ id, sheet, title, scale, revisions, children }: SheetProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl border border-(--bp-ink) bg-(--bp-ground) p-2.5 sm:p-4">
        <div aria-hidden className={`${lettering} -mt-1 mb-1 grid grid-cols-6 text-center text-(--bp-soft) sm:-mt-2.5 sm:mb-1.5`}>
          {zones.map((z) => (
            <span key={z} className="border-l border-(--bp-faint) first:border-0">
              {z}
            </span>
          ))}
        </div>
        <div className="border-2 border-(--bp-ink) bg-(--bp-ground) bg-[linear-gradient(var(--bp-faint)_1px,transparent_1px),linear-gradient(90deg,var(--bp-faint)_1px,transparent_1px)] bg-size-[28px_28px] p-4 sm:p-8">
          <h2 id={`${id}-title`} className={`${display} text-sm font-semibold uppercase tracking-[0.25em] text-(--bp-accent)`}>
            {sections.find((s) => s.id === id)?.label}
          </h2>
          {children}
          <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_minmax(0,22rem)] lg:items-end">
            <div className="min-w-0">{revisions && revisions.length > 0 ? <RevisionTable items={revisions} /> : null}</div>
            <TitleBlock title={title} sheet={sheet} scale={scale} />
          </div>
        </div>
      </div>
    </section>
  );
}
