// News as a cell file: one cell per item, its site placed by date, so each cell's length is the
// quiet time around that item. No relaxation here: time, not evenness, sets the sites.

import { formatDate, news } from "@/content";
import { hashSeed, mulberry32, pathOf, rectPolygon, relax, scatter, voronoi, type Point, type Polygon } from "./voronoi";

const W = 1000;
const H = 180;
const PAD = 24;

const times = news.map((n) => Date.parse(n.date));
const t0 = Math.min(...times);
const t1 = Math.max(...times);
const MONTH_MS = 30.44 * 24 * 3600 * 1000;
const kindColor = { data: "var(--p1)", tool: "var(--p2)" } as const;

const fileCells = () => {
  const rand = mulberry32(hashSeed(`tissue:news:${news.map((n) => n.date).join()}`));
  // Newest on the left, as the list reads.
  const sites: Point[] = times.map((t) => [PAD + ((t1 - t) / (t1 - t0)) * (W - 2 * PAD), H / 2 + (rand() - 0.5) * 16]);
  // Quiet months become plain cells in the same file, so the gaps between items read as tissue too.
  const month = (MONTH_MS / (t1 - t0)) * (W - 2 * PAD);
  for (let x = PAD; x <= W - PAD; x += month) {
    if (sites.every(([sx]) => Math.abs(sx - x) > month * 0.7)) sites.push([x, H / 2 + (rand() - 0.5) * 16]);
  }
  // A row of small unstained cells above and below, so the file reads as a strand inside tissue.
  for (const y of [16, H - 16]) for (let x = -10; x < W + 20; x += 30 + rand() * 12) sites.push([x, y + (rand() - 0.5) * 12]);
  return voronoi(sites, rectPolygon(0, 0, W, H));
};

/** The cell's outline scaled into a small square, for the list markers. */
function glyphPath(poly: Polygon, box = 40) {
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const s = (box - 4) / Math.max(Math.max(...xs) - x0, Math.max(...ys) - y0);
  const ox = (box - (Math.max(...xs) - x0) * s) / 2;
  const oy = (box - (Math.max(...ys) - y0) * s) / 2;
  return pathOf(poly.map(([x, y]) => [ox + (x - x0) * s, oy + (y - y0) * s] as const));
}

export function NewsFile() {
  const cells = fileCells();
  return (
    <>
      <figure>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Cell file, one cell per news item, newest on the left" className="block w-full border-2 border-foreground">
          {cells.slice(news.length).map((c, i) => (
            <path key={i} d={pathOf(c.poly)} fill="var(--foreground)" fillOpacity={0.06} className="tissue-wall" />
          ))}
          {cells.slice(0, news.length).map((c, i) => (
            <g key={news[i].date + news[i].title}>
              <path d={pathOf(c.poly)} fill={kindColor[news[i].kind]} fillOpacity={0.8} className="tissue-wall" />
              <circle cx={Math.round(c.site[0])} cy={Math.round(c.site[1])} r={7} className="tissue-nucleus" />
            </g>
          ))}
        </svg>
        <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 text-sm text-muted-foreground">
          <span>{formatDate(news[0].date)}</span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="size-3 border border-foreground/60 bg-(--p1)" /> Data
            </span>
            <span className="flex items-center gap-2">
              <span className="size-3 border border-foreground/60 bg-(--p2)" /> Tool
            </span>
          </span>
          <span>{formatDate(news.at(-1)!.date)}</span>
        </figcaption>
      </figure>

      <ol className="mt-12 grid gap-x-12 md:grid-cols-2">
        {news.map((item, i) => (
          <li key={item.date + item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-foreground/20 py-5">
            <svg viewBox="0 0 40 40" aria-hidden className="size-10">
              <path d={glyphPath(cells[i].poly)} fill={kindColor[item.kind]} fillOpacity={0.75} className="tissue-wall" />
            </svg>
            <div>
              <p className="text-sm text-muted-foreground">
                {formatDate(item.date)} · {item.kind === "data" ? "Data" : "Tool"}
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

/** Footer epidermis: a thin band of relaxed cells stained across the palette. */
export function EpidermisBand({ className }: { className?: string }) {
  const clip = rectPolygon(0, 0, 1200, 70);
  const rand = mulberry32(hashSeed("tissue:epidermis"));
  const cells = relax(scatter(110, clip, rand, () => true), clip, 4).at(-1)!;
  return (
    <svg viewBox="0 0 1200 70" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      {cells.map((c, i) => (
        <path
          key={i}
          d={pathOf(c.poly)}
          fill={`var(--p${1 + Math.floor((c.centroid[0] / 1200) * 4 + (rand() - 0.5) * 0.8 + 4) % 4})`}
          fillOpacity={Math.round((0.55 + rand() * 0.4) * 100) / 100}
          className="tissue-wall"
        />
      ))}
    </svg>
  );
}
