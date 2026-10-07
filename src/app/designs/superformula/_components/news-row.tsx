"use client";

import { useState, type CSSProperties } from "react";
import { formatDate } from "@/content";
import { cn } from "@/lib/utils";
import { fmt, newsShapes } from "./gielis";
import { useSeen } from "./hooks";
import { N, Shape } from "./shape";

const kind = {
  tool: { label: "Tool release", fill: "var(--p4)" },
  data: { label: "Data release", fill: "var(--p1)" },
} as const;

// Oldest on the left: the row reads as the hero's morph, one step per item.
const row = newsShapes.map((s, i) => ({ ...s, i })).toReversed();

/**
 * News as a row of shapes, one per item. The oldest item is the circle and each later item moves
 * the exponents one step toward the finished flower, which the newest item reaches.
 */
export function NewsRow() {
  const [active, setActive] = useState<number | null>(null);
  const [ref, seen] = useSeen<HTMLOListElement>();

  return (
    <div>
      <ol ref={ref} data-seen={seen} className="sf-step grid grid-cols-7 gap-x-2 gap-y-4 sm:grid-cols-13" aria-hidden>
        {row.map((s, step) => (
          <li
            key={s.item.date + s.item.title}
            style={{ "--i": step } as CSSProperties}
            onPointerEnter={() => setActive(s.i)}
            onPointerLeave={() => setActive(null)}
            className={cn("transition-opacity", active !== null && active !== s.i && "opacity-30")}
          >
            <Shape stroke="currentColor" params={s.params} fill={kind[s.item.kind].fill} className="w-full" />
            <p className="mt-2 text-center text-[0.65rem] tabular-nums opacity-60">{s.item.date.slice(0, 4)}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {Object.values(kind).map((k) => (
          <span key={k.label} className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ background: k.fill }} />
            {k.label}
          </span>
        ))}
        <span className="opacity-60">Left to right, oldest to newest: <N i={1} /> runs from 2 to {fmt(row.at(-1)!.params.n1)}.</span>
      </p>

      <ol className="mt-12 grid gap-x-12 md:grid-cols-2">
        {newsShapes.map((s, i) => (
          <li
            key={s.item.date + s.item.title}
            tabIndex={0}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className={cn(
              "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-foreground/20 py-5 outline-none transition-opacity focus-visible:bg-foreground/5",
              active !== null && active !== i && "opacity-40",
            )}
          >
            <Shape stroke="currentColor" params={s.params} fill={kind[s.item.kind].fill} className="mt-1 size-10" />
            <div>
              <p className="text-sm opacity-60">
                <time dateTime={s.item.date}>{formatDate(s.item.date)}</time> · {kind[s.item.kind].label}
              </p>
              <h3 className="mt-1 text-xl leading-tight font-bold">{s.item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-80">{s.item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
