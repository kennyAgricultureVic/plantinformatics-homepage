// Edition furniture and derived figures shared across the Gazette. Everything is computed
// from content at build time; the edition date is the newest news item, never "today".

import { crops, dataReleases, news, sections, type Crop, type SectionId } from "@/content";

/** Font families loaded in layout.tsx, as Tailwind classes. */
export const font = {
  blackletter: "font-(family-name:--font-gz-blackletter)",
  headline: "font-(family-name:--font-gz-headline)",
  text: "font-(family-name:--font-gz-text)",
  label: "font-(family-name:--font-gz-label)",
} as const;

/** Small caps furniture style used for kickers, datelines and running heads. */
export const furniture = `${font.label} text-[0.68rem] font-semibold uppercase tracking-[0.18em]`;

/** Dot screen in the spot colour, like a halftone tint on a two-colour press. */
export const halftone = "bg-[radial-gradient(var(--p1)_32%,transparent_36%)] bg-size-[5px_5px]";

const longDate = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const year = (iso: string) => Number(iso.slice(0, 4));

export const edition = {
  date: news[0].date,
  dateline: longDate.format(new Date(news[0].date)),
  number: news.length,
  volume: year(news[0].date) - year(news[news.length - 1].date) + 1,
};

/** Page each section is printed on. Newspapers run the classifieds at the back. */
export const pageOf = { about: 1, news: 2, data: 3, tools: 4 } as const satisfies Record<SectionId, number>;

export const contents = [...sections].sort((a, b) => pageOf[a.id] - pageOf[b.id]);

/** The newest data release leads the front page, told through its matching news item. */
export const latestRelease = dataReleases.reduce((a, b) => (b.released > a.released ? b : a));
export const leadStory = news.find((n) => n.kind === "data" && n.date === latestRelease.released) ?? news[0];
export const latestTool = news.find((n) => n.kind === "tool");

const current = dataReleases.filter((r) => !("superseded" in r));

/** Accessions currently on file per crop, largest first. */
export const holdings = crops
  .map((crop) => ({ crop, total: current.filter((r) => r.crop === crop).reduce((sum, r) => sum + r.accessions, 0) }))
  .sort((a, b) => b.total - a.total);

const chronological = [...dataReleases].sort((a, b) => a.released.localeCompare(b.released));

/**
 * Running total of unique accessions after each release. A superseded release is
 * replaced by the next release of the same crop, so it stops counting at that point.
 */
export const composite = chronological.reduce<{ date: string; total: number; held: Map<Crop, number> }[]>((series, r) => {
  const prev = series.at(-1);
  const held = new Map(prev?.held);
  const replaced = held.get(r.crop) ?? 0;
  held.delete(r.crop);
  if ("superseded" in r) held.set(r.crop, r.accessions);
  return [...series, { date: r.released, total: (prev?.total ?? 0) - replaced + r.accessions, held }];
}, []);

/** Net change against the release it supersedes, or null for a new listing. */
export const netChange = (release: (typeof dataReleases)[number]) => {
  const predecessor = chronological.find((r) => r.crop === release.crop && "superseded" in r && r.released < release.released);
  return predecessor ? release.accessions - predecessor.accessions : null;
};
