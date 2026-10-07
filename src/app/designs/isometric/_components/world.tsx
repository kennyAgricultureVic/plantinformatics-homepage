"use client";

import type { CSSProperties, ReactNode } from "react";
import { Hairline } from "@/components/hairline";
import { sections, type SectionId } from "@/content";
import {
  BENCH,
  BOARD,
  FIELD_D,
  FIELD_W,
  GLASS,
  ISLAND,
  LAB,
  P,
  PLOT,
  RACK,
  PER_CRATE,
  PER_UNIT,
  STORE,
  WORLD_H,
  WORLD_W,
  cuboid,
  machines,
  notes,
  openW,
  plots,
  polyW,
  stacks,
  type V3,
} from "./iso";

export type WorldEvents = {
  /** Zone lit from outside (the legend), or null. */
  zoneOn: SectionId | null;
  /** Item lit from outside: "tool:<slug>", "release:<doi>" or "news:<date:title>". */
  focus: string | null;
  onZone: (zone: SectionId | null) => void;
  onFocus: (id: string | null) => void;
};

const zoneColor: Record<SectionId, string> = { about: "var(--z1)", tools: "var(--z2)", data: "var(--z3)", news: "var(--z4)" };
const zoneLabel = (id: SectionId) => sections.find((s) => s.id === id)?.label ?? id;
const on = (b: boolean) => (b ? "" : undefined);

/** A solid box: three filled faces and a silhouette. */
function Block({ b, pale, zoneSil }: { b: ReturnType<typeof cuboid>; pale?: boolean; zoneSil?: boolean }) {
  const p = pale ? "pale " : "";
  return (
    <>
      <path className={`${p}t lo`} d={b.top} />
      <path className={`${p}r lo`} d={b.right} />
      <path className={`${p}l lo`} d={b.left} />
      <path className={zoneSil ? "sil zone-sil" : "sil"} d={b.sil} />
    </>
  );
}

function Zone({ id, events, children }: { id: SectionId; events: WorldEvents; children: ReactNode }) {
  return (
    <a
      href={`#${id}`}
      aria-label={zoneLabel(id)}
      className="zone"
      data-on={on(events.zoneOn === id)}
      style={{ "--z": zoneColor[id] } as CSSProperties}
      onPointerEnter={() => events.onZone(id)}
      onPointerLeave={() => events.onZone(null)}
      onFocus={() => events.onZone(id)}
      onBlur={() => events.onZone(null)}
    >
      {children}
    </a>
  );
}

/** Two back walls of a cutaway room, with a window in the long one. */
function Room({ x, y, w, d, wall }: { x: number; y: number; w: number; d: number; wall: number }) {
  return (
    <>
      <Block b={cuboid(x - 2, y, -0.01, x + w, y + d, 2)} zoneSil />
      <Block b={cuboid(x - 2, y - 2, 2, x + w, y, wall)} pale />
      <Block b={cuboid(x - 2, y, 2, x, y + d, wall)} pale />
      <path
        className="nf lo"
        d={polyW([
          [x + w * 0.55, y, wall * 0.45],
          [x + w * 0.85, y, wall * 0.45],
          [x + w * 0.85, y, wall * 0.85],
          [x + w * 0.55, y, wall * 0.85],
        ])}
      />
      <path className="nf lo" d={openW([[x + w * 0.7, y, wall * 0.45], [x + w * 0.7, y, wall * 0.85]])} />
    </>
  );
}

const island = cuboid(ISLAND.x0, ISLAND.y0, -ISLAND.depth, ISLAND.x1, ISLAND.y1, 0);

function Island() {
  return (
    <>
      <path className="lo" d={island.top} />
      <path className="ground-r lo" d={island.right} />
      <path className="ground-l lo" d={island.left} />
      <path className="sil" d={island.sil} />
      {(
        [
          [
            [24, GLASS.y + GLASS.d + 1, 0],
            [24, -2, 0],
          ],
          [
            [FIELD_W, FIELD_D / 2, 0],
            [LAB.x - 12, FIELD_D / 2, 0],
            [LAB.x - 12, LAB.y + LAB.d / 2, 0],
            [LAB.x - 4, LAB.y + LAB.d / 2, 0],
          ],
          [
            [FIELD_W / 3, FIELD_D, 0],
            [FIELD_W / 3, STORE.y - 4, 0],
          ],
          [
            [FIELD_W - 8, FIELD_D, 0],
            [FIELD_W - 8, FIELD_D + 14, 0],
            [BOARD.x + 20, FIELD_D + 14, 0],
            [BOARD.x + 20, BOARD.y - 2, 0],
          ],
        ] as V3[][]
      ).map((path, i) => (
        <path key={i} className="dash" d={openW(path)} />
      ))}
    </>
  );
}

function Glasshouse() {
  const { x, y, w, d, h, ridge } = GLASS;
  const m = y + d / 2;
  const bars = (n: number) => Array.from({ length: n - 1 }, (_, i) => (i + 1) / n);
  return (
    <>
      <Block b={cuboid(x, y, -0.01, x + w, y + d, 1)} pale zoneSil />
      {/* back frame, seen through the glass */}
      <path
        className="nf lo"
        d={openW([
          [x, y + d, 0],
          [x, y + d, h],
          [x, m, h + ridge],
          [x, y, h],
          [x, y, 0],
        ])}
      />
      <path
        className="nf lo"
        d={openW([
          [x, y, h],
          [x + w, y, h],
          [x + w, y, 0],
        ])}
      />
      {/* potting benches with seedlings */}
      {[y + 4, y + d - 9].map((by) => (
        <g key={by}>
          <Block b={cuboid(x + 4, by, 1, x + w - 6, by + 5, 7)} />
          {Array.from({ length: 7 }, (_, i) => {
            const [cx, cy] = P(x + 7 + i * 5.6, by + 2.5, 7);
            return <circle key={i} className="dot" cx={cx} cy={cy - 2} r={1.6} />;
          })}
        </g>
      ))}
      {/* glass: gable end, long side, near roof slope */}
      <path
        className="glass zone-sil"
        d={polyW([
          [x + w, y, 0],
          [x + w, y + d, 0],
          [x + w, y + d, h],
          [x + w, m, h + ridge],
          [x + w, y, h],
        ])}
      />
      <path
        className="glass zone-sil"
        d={polyW([
          [x, y + d, 0],
          [x + w, y + d, 0],
          [x + w, y + d, h],
          [x, y + d, h],
        ])}
      />
      <path
        className="glass zone-sil"
        d={polyW([
          [x, y + d, h],
          [x + w, y + d, h],
          [x + w, m, h + ridge],
          [x, m, h + ridge],
        ])}
      />
      {bars(8).map((t) => (
        <path
          key={`l${t}`}
          className="nf lo"
          d={openW([
            [x + w * t, y + d, 0],
            [x + w * t, y + d, h],
            [x + w * t, m, h + ridge],
          ])}
        />
      ))}
      {bars(4).map((t) => (
        <path
          key={`r${t}`}
          className="nf lo"
          d={openW([
            [x + w, y + d * t, 0],
            [x + w, y + d * t, h + ridge * (1 - Math.abs(t - 0.5) * 2)],
          ])}
        />
      ))}
    </>
  );
}

function Field({ events }: { events: WorldEvents }) {
  return (
    <>
      {plots.map((p) => {
        const id = `crop:${p.crop}`;
        return (
          <g key={p.crop} className="item" data-on={on(events.focus === id)}>
            <Block b={cuboid(p.x, p.y, 0, p.x + PLOT, p.y + PLOT, 3)} />
            {Array.from({ length: 6 }, (_, k) => (
              <path
                key={k}
                className="nf lo"
                d={openW([
                  [p.x + 2, p.y + 2 + (k + 0.5) * 4, 3],
                  [p.x + PLOT - 2, p.y + 2 + (k + 0.5) * 4, 3],
                ])}
              />
            ))}
          </g>
        );
      })}
    </>
  );
}

/** One machine per tool, each drawn for what it does. */
function Machine({ slug, x0, x1, y }: { slug: string; x0: number; x1: number; y: number }) {
  const z = 2 + BENCH.h;
  const yb = y + BENCH.y0 + 2;
  const yf = y + BENCH.y1 - 2;
  const face = (pts: [number, number][], yy: number) => pts.map(([px, pz]) => [px, yy, pz] as V3);
  const screen = (draw: (yy: number) => ReactNode) => {
    const sy0 = yb + 3;
    const sy1 = sy0 + 1.6;
    return (
      <>
        <Block b={cuboid(x0 + 4, sy0 - 1, z, x1 - 4, sy1 + 1.5, z + 1.5)} />
        <path className="nf" d={openW([[(x0 + x1) / 2, sy1, z + 1.5], [(x0 + x1) / 2, sy1, z + 4]])} />
        <Block b={cuboid(x0, sy0, z + 4, x1, sy1, z + 15)} />
        {draw(sy1)}
      </>
    );
  };
  switch (slug) {
    case "pretzel":
      // aligned maps: three chromosome bars and the links between them
      return screen((yy) => (
        <>
          {[12.5, 9.5, 6.5].map((zz) => (
            <path
              key={zz}
              className="nf hi"
              d={openW(face([[x0 + 1.5, z + zz], [x1 - 1.5, z + zz]], yy))}
            />
          ))}
          {(
            [
              [2.5, 12.5, 6, 9.5],
              [7.5, 12.5, 3.5, 9.5],
              [4.5, 9.5, 8.5, 6.5],
              [8, 9.5, 5, 6.5],
            ] as const
          ).map(([a, za, b, zb], i) => (
            <path key={i} className="nf" d={openW(face([[x0 + a, z + za], [x0 + b, z + zb]], yy))} />
          ))}
        </>
      ));
    case "fairybread":
      // a PCA scatter in two clusters
      return screen((yy) => (
        <>
          {Array.from({ length: 16 }, (_, i) => {
            const a = i * 2.39996;
            const r = Math.sqrt((i % 8) + 0.5) * 0.9;
            const cx = (i < 8 ? x0 + 3.6 : x0 + 7.4) + Math.cos(a) * r;
            const cz = (i < 8 ? z + 10.5 : z + 7.5) + Math.sin(a) * r * 0.9;
            const [px, py] = P(cx, yy, cz);
            return <circle key={i} className="dot" cx={px} cy={py} r={1.3} />;
          })}
          <path className="nf lo" d={openW(face([[x0 + 1.5, z + 5.5], [x0 + 1.5, z + 13.5]], yy))} />
          <path className="nf lo" d={openW(face([[x0 + 1.5, z + 5.5], [x1 - 1.5, z + 5.5]], yy))} />
        </>
      ));
    case "genolink":
      // a switch with a row of ports
      return (
        <>
          <Block b={cuboid(x0, yb, z, x1, yf, z + 5)} />
          {Array.from({ length: 5 }, (_, i) => {
            const [px, py] = P(x0 + 1.6 + i * 2, yf, z + 2.5);
            return <circle key={i} className="dot led" cx={px} cy={py} r={1.4} />;
          })}
          <path className="nf" d={openW([[x1 - 2, yb + 1, z + 5], [x1 - 2, yb + 1, z + 12]])} />
        </>
      );
    case "brioche":
      // an oven: reanchoring, baked in batches
      return (
        <>
          <Block b={cuboid(x0, yb, z, x1, yf, z + 11)} />
          <path
            className="nf"
            d={polyW(face([[x0 + 1.5, z + 1.5], [x1 - 1.5, z + 1.5], [x1 - 1.5, z + 8], [x0 + 1.5, z + 8]], yf))}
          />
          <path
            className="nf lo"
            d={polyW(face([[x0 + 3, z + 3], [x1 - 3, z + 3], [x1 - 3, z + 6.5], [x0 + 3, z + 6.5]], yf))}
          />
          <path className="nf hi" d={openW(face([[x0 + 3, z + 9.5], [x1 - 3, z + 9.5]], yf))} />
          <Block b={cuboid(x1 - 3.5, yb + 1, z + 11, x1 - 1.5, yb + 3, z + 16)} />
        </>
      );
    default:
      return <Block b={cuboid(x0, yb, z, x1, yf, z + 8)} />;
  }
}

function Lab({ events }: { events: WorldEvents }) {
  const { x, y } = LAB;
  const rack = cuboid(x + RACK.x0, y + RACK.y0, 2, x + RACK.x1, y + RACK.y1, RACK.h);
  const genolink = machines.find((m) => m.slug === "genolink");
  return (
    <>
      <Room {...LAB} />
      {genolink && (
        <path
          className="nf"
          d={openW([
            [x + genolink.x0 + 2, y + BENCH.y0 + 3, 2 + BENCH.h + 3],
            [x + genolink.x0 + 2, y + BENCH.y0 - 3, 2 + BENCH.h + 3],
            [x + RACK.x1, y + BENCH.y0 - 3, 2 + BENCH.h + 3],
          ])}
        />
      )}
      <Block b={rack} />
      {Array.from({ length: 10 }, (_, i) => {
        const zz = 6 + i * 4;
        return (
          <g key={i}>
            <path
              className="nf lo"
              d={openW([
                [x + RACK.x1, y + RACK.y0 + 1, zz],
                [x + RACK.x1, y + RACK.y1 - 1, zz],
              ])}
            />
            {[0, 1].map((k) => {
              const [px, py] = P(x + RACK.x1, y + RACK.y0 + 2 + k * 2.2, zz + 2);
              return <circle key={k} className="dot led" cx={px} cy={py} r={1.2} />;
            })}
          </g>
        );
      })}
      <Block b={cuboid(x + BENCH.x0, y + BENCH.y0, 2, x + BENCH.x1, y + BENCH.y1, 2 + BENCH.h)} />
      {[0.25, 0.5, 0.75].map((t) => (
        <path
          key={t}
          className="nf lo"
          d={openW([
            [x + BENCH.x0 + (BENCH.x1 - BENCH.x0) * t, y + BENCH.y1, 3],
            [x + BENCH.x0 + (BENCH.x1 - BENCH.x0) * t, y + BENCH.y1, 1 + BENCH.h],
          ])}
        />
      ))}
      {machines.map((m) => {
        const id = `tool:${m.slug}`;
        return (
          <g
            key={m.slug}
            className="item"
            data-on={on(events.focus === id)}
            onPointerEnter={() => events.onFocus(id)}
            onPointerLeave={() => events.onFocus(null)}
          >
            <Machine slug={m.slug} x0={x + m.x0} x1={x + m.x1} y={y} />
          </g>
        );
      })}
    </>
  );
}

function Store({ events }: { events: WorldEvents }) {
  const { x, y } = STORE;
  const crateH = PER_CRATE / PER_UNIT;
  const ordered = [...stacks].sort((a, b) => a.x0 + a.y0 - (b.x0 + b.y0));
  return (
    <>
      <Room {...STORE} />
      {ordered.map((s) => {
        const id = `release:${s.id}`;
        const [x0, y0, x1, y1] = [x + s.x0, y + s.y0, x + s.x1, y + s.y1];
        const top = 2 + s.h;
        const seams = Array.from({ length: Math.floor(s.h / crateH) }, (_, k) => 2 + (k + 1) * crateH).filter(
          (zz) => zz < top - 0.5,
        );
        return (
          <g
            key={s.id}
            className="item"
            data-on={on(events.focus === id)}
            onPointerEnter={() => events.onFocus(id)}
            onPointerLeave={() => events.onFocus(null)}
          >
            <Block b={cuboid(x0, y0, 2, x1, y1, top)} pale={"superseded" in s.release} />
            {seams.map((zz) => (
              <path
                key={zz}
                className="nf"
                d={openW([
                  [x0, y1, zz],
                  [x1, y1, zz],
                  [x1, y0, zz],
                ])}
              />
            ))}
          </g>
        );
      })}
    </>
  );
}

function Board({ events }: { events: WorldEvents }) {
  const { x, y, w, d } = BOARD;
  const fy = y + 12.5;
  return (
    <>
      <Block b={cuboid(x, y, -0.01, x + w, y + d, 1)} pale zoneSil />
      <Block b={cuboid(x + 4, y + 10, 1, x + 6.5, fy, 40)} />
      <Block b={cuboid(x + w - 6.5, y + 10, 1, x + w - 4, fy, 40)} />
      <Block b={cuboid(x + 2, y + 10, 14, x + w - 2, fy, 41)} zoneSil />
      <Block b={cuboid(x, y + 8.5, 41, x + w, y + 14, 43)} />
      {notes.map((n) => {
        const id = `news:${n.id}`;
        const corners: V3[] = [
          [x + n.x0, fy, n.z0],
          [x + n.x1, fy, n.z0],
          [x + n.x1, fy, n.z1],
          [x + n.x0, fy, n.z1],
        ];
        const [px, py] = P(x + (n.x0 + n.x1) / 2, fy, n.z1 - 0.9);
        return (
          <g
            key={n.id}
            className="item"
            data-on={on(events.focus === id)}
            style={{ "--z": n.item.kind === "tool" ? "var(--z2)" : "var(--z3)" } as CSSProperties}
            onPointerEnter={() => events.onFocus(id)}
            onPointerLeave={() => events.onFocus(null)}
          >
            <path className="t lo" d={polyW(corners)} />
            <path className="sil" d={polyW(corners)} />
            <circle className="dot" cx={px} cy={py} r={1.5} />
          </g>
        );
      })}
    </>
  );
}

/** Figure box width in world pixels (height is 4/5 of it), and where its base sits in that box (from the top). */
const FIG_W = 210;
const FIG_BASE = 0.6;
/** The flat, wide figures are drawn a little smaller so they stay on their plot. */
const FIG_SCALE: Partial<Record<string, number>> = { lentil: 0.7, chickpea: 0.85 };

/**
 * The whole station as one fixed-size box of WORLD_W x WORLD_H pixels: an SVG of the buildings,
 * with the Hairline crop figures laid over their field plots. Position and scale it from outside.
 */
export function World({ events, figures = true }: { events: WorldEvents; figures?: boolean }) {
  return (
    <div className="iso-world relative" style={{ width: WORLD_W, height: WORLD_H }}>
      <svg
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        width={WORLD_W}
        height={WORLD_H}
        className="absolute inset-0 overflow-visible"
        role="group"
      >
        <Island />
        <Zone id="about" events={events}>
          <Glasshouse />
          <Field events={events} />
        </Zone>
        <Zone id="tools" events={events}>
          <Lab events={events} />
        </Zone>
        <Zone id="data" events={events}>
          <Store events={events} />
        </Zone>
        <Zone id="news" events={events}>
          <Board events={events} />
        </Zone>
      </svg>
      {figures && (
        <div className="iso-figures">
          {plots.map((p) => {
            const [px, py] = P(p.x + PLOT / 2, p.y + PLOT / 2, 3);
            const w = FIG_W * (FIG_SCALE[p.figure] ?? 1);
            return (
              <div
                key={p.crop}
                className="absolute"
                style={{ left: px - w / 2, top: py - ((w * 4) / 5) * FIG_BASE, width: w }}
                onPointerEnter={() => {
                  events.onZone("about");
                  events.onFocus(`crop:${p.crop}`);
                }}
                onPointerLeave={() => {
                  events.onZone(null);
                  events.onFocus(null);
                }}
              >
                <Hairline figure={p.figure} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
