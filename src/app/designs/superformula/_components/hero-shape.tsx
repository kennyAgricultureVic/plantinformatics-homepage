"use client";

import { useState } from "react";
import { CIRCLE, fmt, heroMapping, heroParams, lerpParams, outline, shapePath } from "./gielis";
import { useMorph, useSeen } from "./hooks";
import { N } from "./shape";

const start = { m: heroParams.m, ...CIRCLE };
const spokes = Array.from({ length: heroParams.m }, (_, i) => -Math.PI / 2 + (i / heroParams.m) * Math.PI * 2);
const rows = [
  { key: "m", label: "m" },
  { key: "n1", label: <N i={1} /> },
  { key: "n2", label: <N i={2} /> },
  { key: "n3", label: <N i={3} /> },
] as const;

/**
 * The hero flower. It starts as the circle every superformula passes through (n₁ = n₂ = n₃ = 2)
 * and moves its exponents once to the values the content gives, with the parameters ticking beside it.
 */
export function HeroShape() {
  const [run, setRun] = useState(0);
  const [ref, seen] = useSeen<HTMLButtonElement>();
  const t = useMorph(2600, run, seen);
  const p = lerpParams(start, heroParams, t);
  const path = shapePath(p);
  const centre = Math.min(...outline(p, 180));

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_13rem] md:items-end">
      <button
        ref={ref}
        type="button"
        onClick={() => setRun((r) => r + 1)}
        aria-label="Grow the flower again"
        className="group relative block w-full cursor-pointer outline-none"
      >
        <svg viewBox="-1.12 -1.12 2.24 2.24" className="w-full overflow-visible" aria-hidden>
          <circle r={1} fill="none" stroke="currentColor" strokeOpacity={0.25} strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
          <circle r={0.5} fill="none" stroke="currentColor" strokeOpacity={0.12} vectorEffect="non-scaling-stroke" />
          {spokes.map((a) => (
            <line
              key={a}
              x2={(1.1 * Math.cos(a)).toFixed(3)}
              y2={(1.1 * Math.sin(a)).toFixed(3)}
              stroke="currentColor"
              strokeOpacity={0.15}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={path} fill="var(--p1)" stroke="currentColor" strokeWidth={1.25} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
          <circle r={Math.max(centre * 0.82, 0.04).toFixed(3)} fill="var(--p2)" stroke="currentColor" strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="absolute right-0 bottom-0 text-xs opacity-0 transition-opacity group-hover:opacity-60 group-focus-visible:opacity-60">
          Click to grow again
        </span>
      </button>

      <dl className="grid grid-cols-[2.25rem_4rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-3 border-t border-foreground pt-4">
        {rows.map((r) => (
          <div key={r.key} className="contents">
            <dt className="text-xl font-bold">{r.label}</dt>
            <dd className="text-right text-3xl font-bold">{fmt(p[r.key])}</dd>
            <dd className="text-xs leading-snug opacity-70">{heroMapping[r.key].note}</dd>
          </div>
        ))}
        <dt className="text-xl font-bold">a, b</dt>
        <dd className="text-right text-3xl font-bold">1</dd>
        <dd className="text-xs leading-snug opacity-70">held fixed</dd>
      </dl>
    </div>
  );
}
