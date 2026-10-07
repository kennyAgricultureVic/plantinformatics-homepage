import { formatNumber } from "@/content";
import { cn } from "@/lib/utils";
import { isSuperseded, plotStyle, plots, type Plot } from "../_lib/plots";
import { squarify, type Rect, type Tile } from "../_lib/squarify";

// Field dimensions in grid cells. Desktop is a wide paddock; mobile collapses to a tall strip.
const wide: Rect = { x: 0, y: 0, w: 16, h: 9 };
const tall: Rect = { x: 0, y: 0, w: 6, h: 13 };

const letters = "ABCDEFGHIJKLMNOP".split("");

/** Absolute position of a tile as percentages of the field. */
const place = (t: Rect, field: Rect) => ({
  left: `${(t.x / field.w) * 100}%`,
  top: `${(t.y / field.h) * 100}%`,
  width: `${(t.w / field.w) * 100}%`,
  height: `${(t.h / field.h) * 100}%`,
});

/** Survey crosses at the grid intersections inside one tile, like the fiducials on an aerial photo. */
function Crosses({ tile }: { tile: Rect }) {
  const xs = Array.from(
    { length: Math.ceil(tile.w) + 1 },
    (_, i) => Math.floor(tile.x) + i,
  ).filter((x) => x > tile.x && x < tile.x + tile.w);
  const ys = Array.from(
    { length: Math.ceil(tile.h) + 1 },
    (_, i) => Math.floor(tile.y) + i,
  ).filter((y) => y > tile.y && y < tile.y + tile.h);
  return (
    <svg
      aria-hidden
      viewBox={`${tile.x} ${tile.y} ${tile.w} ${tile.h}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full text-foreground/45"
    >
      {xs.flatMap((x) =>
        ys.map((y) => (
          <path
            key={`${x}-${y}`}
            d={`M${x - 0.12} ${y}h0.24M${x} ${y - 0.12}v0.24`}
            stroke="currentColor"
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
        )),
      )}
    </svg>
  );
}

/**
 * One plot of the field map: a crop fill linking to the release DOI, survey crosses, and a stake tag
 * naming it. The tile is a size container so the tag grows on big plots and folds to one line on short ones.
 */
function PlotTile({ tile, field }: { tile: Tile<Plot>; field: Rect }) {
  const plot = tile.item;
  const old = isSuperseded(plot);
  return (
    <div
      className="group absolute overflow-hidden [container-type:size]"
      style={place(tile, field)}
    >
      <a
        href={plot.doi}
        className="absolute inset-[3px] block outline-offset-[-3px] focus-visible:outline-3 focus-visible:outline-foreground"
        style={plotStyle(plot)}
        aria-label={`Plot ${plot.plot}: ${plot.crop}, ${formatNumber(plot.accessions)} accessions on ${plot.assembly}${old ? ", superseded" : ""}. Open DOI.`}
      />
      <Crosses tile={tile} />
      <span
        aria-hidden
        className="pointer-events-none absolute top-2.5 left-2.5 [@container(max-height:4.5rem)]:top-1.5 [@container(max-height:4.5rem)]:whitespace-nowrap max-w-[calc(100%-1.25rem)] bg-background px-1.5 py-1 text-foreground transition-transform group-hover:-translate-y-0.5 [@container(min-width:9rem)_and_(min-height:6.5rem)]:top-4 [@container(min-width:9rem)_and_(min-height:6.5rem)]:left-4 [@container(min-width:9rem)_and_(min-height:6.5rem)]:px-2.5 [@container(min-width:9rem)_and_(min-height:6.5rem)]:py-2"
      >
        <span className="block [@container(max-height:4.5rem)]:mr-1.5 [@container(max-height:4.5rem)]:inline font-(family-name:--tp-mono) text-[9px] leading-tight tracking-wider uppercase [@container(max-height:4.5rem)_and_(max-width:13rem)]:hidden">
          {plot.plot}
          {old && " · superseded"}
          <span className="ml-1 opacity-0 transition-opacity group-hover:opacity-100">
            DOI ↗
          </span>
        </span>
        <span className="block [@container(max-height:4.5rem)]:mr-1.5 [@container(max-height:4.5rem)]:inline font-(family-name:--tp-display) text-sm leading-none font-bold tracking-tight [@container(min-width:9rem)_and_(min-height:6.5rem)]:my-1 [@container(min-width:9rem)_and_(min-height:6.5rem)]:text-2xl [@container(min-width:18rem)_and_(min-height:14rem)]:text-4xl">
          {plot.crop}
        </span>
        <span className="block [@container(max-height:4.5rem)]:mr-1.5 [@container(max-height:4.5rem)]:inline font-(family-name:--tp-mono) text-[10px] tabular-nums [@container(max-height:4.5rem)_and_(max-width:8rem)]:hidden">
          {formatNumber(plot.accessions)}
        </span>
        <span className="hidden font-(family-name:--tp-mono) text-[10px] leading-snug [@container(min-width:12rem)_and_(min-height:9rem)]:block">
          {plot.assembly}
        </span>
      </span>
    </div>
  );
}

/** A treemap of every release laid into one field, sized by accessions. */
function Field({ field, className }: { field: Rect; className?: string }) {
  const tiles = squarify(plots, (p) => p.accessions, field);
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ aspectRatio: `${field.w} / ${field.h}` }}
    >
      {tiles.map((t) => (
        <PlotTile key={t.item.doi} tile={t} field={field} />
      ))}
    </div>
  );
}

/**
 * Hero field map. On md+ a 16 by 9 paddock with lettered columns and numbered ranges;
 * on phones the same releases re-squarify into a tall vertical strip.
 */
export function FieldMap() {
  return (
    <figure>
      <div className="hidden md:grid md:grid-cols-[1.75rem_1fr] md:grid-rows-[1.5rem_auto]">
        <span />
        <ol
          aria-hidden
          className="grid grid-cols-16 font-(family-name:--tp-mono) text-[11px] text-foreground/60"
        >
          {letters.map((l) => (
            <li key={l} className="border-l border-foreground/25 pl-1">
              {l}
            </li>
          ))}
        </ol>
        <ol
          aria-hidden
          className="grid grid-rows-9 font-(family-name:--tp-mono) text-[11px] text-foreground/60"
        >
          {Array.from({ length: wide.h }, (_, i) => (
            <li key={i} className="border-t border-foreground/25 pt-1">
              {i + 1}
            </li>
          ))}
        </ol>
        <Field field={wide} />
      </div>
      <Field field={tall} className="md:hidden" />
    </figure>
  );
}
