"use client";

import { useState } from "react";
import { formatDate, news } from "@/content";
import { cn } from "@/lib/utils";
import { vogel } from "./vogel";

const C = 1;
const florets = news.map((item, i) => ({ item, ...vogel(i + 1, C) }));
const extent = C * Math.sqrt(news.length) + 0.6;

const kindStyle = {
  tool: { fill: "var(--p1)", text: "var(--p1-fg)", label: "Tool release" },
  data: { fill: "var(--p3)", text: "var(--p3-fg)", label: "Data release" },
} as const;

/**
 * News as a thirteen floret spiral: the newest item is floret 1 at the centre and older items wind
 * outward. Hovering or focusing a list entry lights up its floret, and the other way round.
 */
export function NewsSpiral() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="grid gap-12 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="md:sticky md:top-24 md:self-start">
        <svg viewBox={`${-extent} ${-extent} ${extent * 2} ${extent * 2}`} className="mx-auto w-full max-w-60 md:max-w-sm" aria-hidden>
          {florets.map(({ item, x, y }, i) => {
            const style = kindStyle[item.kind];
            const on = active === null || active === i;
            return (
              <g
                key={item.date + item.title}
                transform={`translate(${x} ${y})`}
                opacity={on ? 1 : 0.2}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                className="transition-opacity"
              >
                <circle r={0.46} fill={style.fill} />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={0.36}
                  fill={style.text}
                  className="font-(family-name:--font-phyllo-mono)"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="mt-6 flex justify-center gap-6 font-(family-name:--font-phyllo-mono) text-xs">
          {Object.values(kindStyle).map((k) => (
            <span key={k.label} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: k.fill }} />
              {k.label}
            </span>
          ))}
        </p>
      </div>

      <ol className="grid">
        {news.map((item, i) => (
          <li
            key={item.date + item.title}
            tabIndex={0}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className={cn(
              "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-foreground/15 py-5 outline-none transition-opacity focus-visible:bg-foreground/5",
              active !== null && active !== i && "opacity-40",
            )}
          >
            <span className="font-(family-name:--font-phyllo-mono) text-sm tabular-nums" style={{ color: kindStyle[item.kind].fill }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <time dateTime={item.date} className="font-(family-name:--font-phyllo-mono) text-xs uppercase tracking-widest opacity-60">
                {formatDate(item.date)} · {kindStyle[item.kind].label}
              </time>
              <h3 className="mt-1 font-(family-name:--font-phyllo-display) text-2xl leading-tight">{item.title}</h3>
              <p className="mt-2 max-w-prose text-sm leading-relaxed opacity-80">{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
