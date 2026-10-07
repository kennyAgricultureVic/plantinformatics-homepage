"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PackNode } from "./pack";
import type { PodDatum } from "./seed-head";

type PodProps = {
  pod: PackNode<PodDatum>;
  /** Fill for each seed, in child order. */
  colors: readonly string[];
  /** Seeds drawn as rings instead of filled, in child order. */
  hollow?: readonly boolean[];
  /** Pod wall colour. */
  wall: string;
  /** "capsule" adds a stalk and a crown, like a poppy head; "plain" is just the wall. */
  shape: "capsule" | "plain";
  /** One entry per seed, rendered as a list beside the pod. */
  items: readonly ReactNode[];
  label: string;
  /** Bullet diameter in px per unit of seed radius, so list bullets keep the seeds' relative sizes. */
  bullet?: number;
  className?: string;
  listClassName?: string;
};


const round = (v: number) => Math.round(v * 1000) / 1000;

/**
 * A pod with its seeds packed inside, beside a list with one row per seed. Hovering a seed or a
 * row lights up both. Seeds grow in once when the pod scrolls into view.
 */
export function Pod({ pod, colors, hollow, wall, shape, items, label, bullet = 7, className, listClassName }: PodProps) {
  const [hot, setHot] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const R = pod.r;
  const capsule = shape === "capsule";
  const top = -R - (capsule ? R * 0.28 : 1);
  const bottom = R + (capsule ? R * 0.55 : 1);
  const side = R + 1;
  const crown = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (1.18 + (0.64 * i) / 8);
    return {
      x: round(Math.cos(a) * R * 0.42),
      y: round(-R * 1.02 + Math.sin(a) * R * 0.04),
      tx: round(Math.cos(a) * R * 0.5),
      ty: round(-R * 1.22 + Math.abs(i - 4) * R * 0.02),
    };
  });

  return (
    <div className={cn("grid items-start gap-8", className)}>
      <svg
        ref={ref}
        viewBox={`${-side} ${top} ${side * 2} ${bottom - top}`}
        data-seen={seen}
        className="pk-pod block w-full max-w-44 sm:max-w-64"
        role="img"
        aria-label={label}
        onPointerLeave={() => setHot(null)}
      >
        {capsule && (
          <>
            <path d={`M 0 ${R} C ${R * 0.06} ${R * 1.2}, ${-R * 0.08} ${R * 1.35}, ${R * 0.04} ${bottom}`} fill="none" stroke={wall} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            {crown.map((c, i) => (
              <line key={i} x1={c.x} y1={c.y} x2={c.tx} y2={c.ty} stroke={wall} strokeWidth={1.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </>
        )}
        <circle r={R} fill={`color-mix(in oklab, ${wall} 14%, var(--background))`} stroke={wall} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        {pod.children?.map((seed, i) => (
          <circle
            key={i}
            cx={seed.x}
            cy={seed.y}
            r={hollow?.[i] ? seed.r - 0.12 : seed.r}
            fill={hollow?.[i] ? "var(--background)" : colors[i]}
            stroke={hot === i ? "var(--foreground)" : hollow?.[i] ? colors[i] : "none"}
            strokeWidth={hot === i ? 2.5 : 1.5}
            vectorEffect="non-scaling-stroke"
            className="pk-seed cursor-default"
            style={{ animationDelay: `${120 + i * 90}ms` }}
            onPointerEnter={() => setHot(i)}
          />
        ))}
      </svg>
      <ul className={cn("grid gap-3", listClassName)} onPointerLeave={() => setHot(null)}>
        {items.map((item, i) => {
          const r = pod.children?.[i].r ?? 1;
          return (
            <li
              key={i}
              onPointerEnter={() => setHot(i)}
              className={cn("grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-3 transition-opacity", hot !== null && hot !== i && "opacity-45")}
            >
              <span className="flex h-6 items-center justify-center">
                <span
                  className="shrink-0 rounded-full"
                  style={{
                    width: r * bullet,
                    height: r * bullet,
                    background: hollow?.[i] ? "transparent" : colors[i],
                    boxShadow: hollow?.[i] ? `inset 0 0 0 1.5px ${colors[i]}` : undefined,
                  }}
                />
              </span>
              <div>{item}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
