"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { tools } from "@/content";
import { DitherDefs, Sky, Sprite } from "./sprite";
import { cropSprites, farmer, toolSigns } from "./sprites";

const W = 192;
const H = 84;
const ground = 64;
const top = 18; // crop the empty sky above the roofs
const speed = 70; // units per second
const reach = 7; // how close the farmer must stand to a door
const minX = 4;
const maxX = W - 11;
const doors = tools.map((_, i) => 24 + i * 48);
const roofs = ["fill-(--p1)", "fill-(--p2)", "fill-(--p4)", "fill-(--p1)"] as const;
const stars = [[8, 22], [40, 30], [66, 21], [97, 27], [118, 20], [150, 26], [178, 23], [140, 33]] as const;

// The farmer's x is its left edge; this centres it on a door.
const standAt = (door: number) => door - 3;
const nearest = (x: number) => {
  const i = doors.findIndex((d) => Math.abs(standAt(d) - x) <= reach);
  return i === -1 ? null : i;
};
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Shop sign on the gable. Drawn above the night dither so it stays legible.
function Sign({ cx, index }: { cx: number; index: number }) {
  return (
    <g>
      <rect x={cx - 6} y={27} width={13} height={12} className="fill-black" />
      <rect x={cx - 5} y={28} width={11} height={10} className="fill-white" />
      <Sprite rows={toolSigns[tools[index].slug]} x={cx - 4} y={28} />
    </g>
  );
}

function Building({ cx, index }: { cx: number; index: number }) {
  const roof = roofs[index % roofs.length];
  const steps = [36, 32, 28, 24, 20, 16, 12];
  return (
    <g>
      <rect x={cx - 15} y={41} width={30} height={23} className="fill-black" />
      <rect x={cx - 14} y={42} width={28} height={22} className="fill-white" />
      {steps.map((w, k) => (
        <rect key={`o${k}`} x={cx - w / 2 - 1} y={40 - k * 2 - 1} width={w + 2} height={3} className="fill-black" />
      ))}
      {steps.map((w, k) => (
        <rect key={`r${k}`} x={cx - w / 2} y={40 - k * 2} width={w} height={2} className={roof} />
      ))}
      {/* Door and windows; windows glow at night. */}
      <rect x={cx - 3} y={53} width={7} height={11} className="fill-black" />
      <rect x={cx + 2} y={58} width={1} height={1} className="fill-white" />
      {[cx - 12, cx + 6].map((wx) => (
        <g key={wx}>
          <rect x={wx} y={45} width={6} height={6} className="fill-black" />
          <rect x={wx + 1} y={46} width={4} height={4} className="fill-(--p4) dark:fill-white" />
        </g>
      ))}
    </g>
  );
}

/**
 * Tools as buildings on a village street. Walk the farmer with the arrow keys or click a building;
 * standing at a door opens a dialogue box about that tool. The tool articles below hold the same
 * content as plain links, so nothing here is required reading.
 */
export function Village() {
  const [x, setX] = useState(standAt(doors[0]) - 14);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [frame, setFrame] = useState(0);
  const pos = useRef(x);
  const dir = useRef(0);
  const target = useRef<number | null>(null);
  const raf = useRef<number | null>(null);
  const walked = useRef(0);

  const active = nearest(x);
  const tool = active === null ? null : tools[active];

  const tick = (last: number) => (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    let step = 0;
    if (dir.current) step = dir.current * speed * dt;
    else if (target.current !== null) {
      const delta = target.current - pos.current;
      step = Math.sign(delta) * Math.min(Math.abs(delta), speed * dt);
      if (Math.abs(delta) < 0.5) target.current = null;
    }
    if (step) {
      pos.current = Math.min(maxX, Math.max(minX, pos.current + step));
      walked.current += Math.abs(step);
      setX(pos.current);
      setFacing(step > 0 ? 1 : -1);
      setFrame(Math.floor(walked.current / 4) % 2);
    }
    if (dir.current || target.current !== null) raf.current = requestAnimationFrame(tick(now));
    else {
      raf.current = null;
      setFrame(0);
    }
  };

  const start = () => {
    if (raf.current === null) raf.current = requestAnimationFrame((now) => tick(now)(now));
  };

  const walkTo = (to: number) => {
    dir.current = 0;
    if (reducedMotion()) {
      target.current = null;
      setFacing(to >= pos.current ? 1 : -1);
      pos.current = to;
      setX(to);
      return;
    }
    target.current = to;
    start();
  };

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const d = e.key === "ArrowLeft" ? -1 : 1;
    if (reducedMotion()) {
      // Jump door to door instead of walking.
      const here = pos.current;
      const next = d > 0 ? doors.find((door) => standAt(door) > here + 1) : [...doors].reverse().find((door) => standAt(door) < here - 1);
      if (next !== undefined) walkTo(standAt(next));
      return;
    }
    target.current = null;
    dir.current = d;
    start();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") dir.current = 0;
  };

  return (
    <div>
      <div
        tabIndex={0}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        aria-label="Village street. Use the left and right arrow keys to walk the farmer to a building."
        className="relative border-4 border-black outline-none focus-visible:border-(--p1) dark:border-white dark:focus-visible:border-(--p1)"
      >
        <svg viewBox={`0 ${top} ${W} ${H - top}`} className={`px-crisp block h-auto w-full`} aria-hidden>
          <DitherDefs prefix="village" />
          <Sky prefix="village" width={W} height={ground} stars={stars} twinkleClassName="px-twinkle" />
          {doors.map((cx, i) => (
            <Building key={cx} cx={cx} index={i} />
          ))}
          <rect y={ground} width={W} height={H - ground} className="fill-(--p3)" />
          <rect y={ground + 2} width={W} height={8} className="fill-white" />
          <rect y={ground + 2} width={W} height={8} fill="url(#village-k-25)" />
          {[0, 48, 96, 144].map((fx) => (
            <Sprite key={fx} rows={cropSprites.Wheat} x={fx + 46} y={ground - 8} colors={{ a: "fill-(--p1)", s: "fill-black" }} />
          ))}
          <rect width={W} height={H} fill="url(#village-k-50)" className="hidden dark:inline" />
          {/* Windows stay lit above the night dither. */}
          {doors.map((cx) =>
            [cx - 11, cx + 7].map((wx) => <rect key={`${cx}-${wx}`} x={wx} y={46} width={4} height={4} className="hidden fill-white dark:inline" />),
          )}
          {doors.map((cx, i) => (
            <Sign key={cx} cx={cx} index={i} />
          ))}
          <Sprite rows={farmer[frame]} x={x} y={ground - 2} flip={facing < 0} />
          {tools.map((t, i) => {
            const w = t.name.length * 3.4 + 6;
            return (
              <g key={t.slug}>
                <rect x={doors[i] - w / 2} y={H - 10} width={w} height={9} className="fill-black" />
                <text
                  x={doors[i]}
                  y={H - 3.5}
                  textAnchor="middle"
                  fontSize={6}
                  className="fill-white font-(family-name:--font-pixel-display)"
                >
                  {t.name}
                </text>
              </g>
            );
          })}
        </svg>
        {/* Click targets over each building. */}
        {tools.map((t, i) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => walkTo(standAt(doors[i]))}
            aria-label={`Walk to ${t.name}`}
            className="absolute top-[12%] h-[60%] w-[18%] -translate-x-1/2 cursor-pointer outline-none focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-(--p1)"
            style={{ left: `${(doors[i] / W) * 100}%` }}
          />
        ))}
      </div>

      {/* Dialogue box. */}
      <div
        aria-live="polite"
        className={`px-notch mt-4 min-h-36 border-4 border-black bg-black p-5 text-white dark:border-white`}
      >
        {tool ? (
          <>
            <p className="font-(family-name:--font-pixel-display) text-2xl">{tool.name}</p>
            <p className="mt-2 max-w-2xl">{tool.summary}</p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <a href={tool.url} className="inline-flex items-center gap-1 bg-(--p1) px-3 py-1.5 font-medium text-(--p1-fg)">
                Open {tool.name} <ArrowUpRightIcon className="size-4" />
              </a>
              <a href={`#tool-${tool.slug}`} className="py-1.5 font-medium underline underline-offset-4">
                Read more
              </a>
            </p>
          </>
        ) : (
          <p className="max-w-2xl">
            Walk the farmer to a door with the arrow keys, or click a building. Every tool is also listed in full below.
          </p>
        )}
      </div>
    </div>
  );
}
