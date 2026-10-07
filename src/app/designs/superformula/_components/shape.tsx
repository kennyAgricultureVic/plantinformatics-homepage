import type { SVGProps } from "react";
import { fmt, shapePath, type Params } from "./gielis";

type ShapeProps = { params: Params; fill?: string; stroke?: string; label?: string } & Omit<SVGProps<SVGSVGElement>, "fill" | "stroke">;

/** One superformula outline in a unit viewBox, filled and optionally stroked. */
export function Shape({ params, fill = "currentColor", stroke, label, ...svg }: ShapeProps) {
  return (
    <svg viewBox="-1.06 -1.06 2.12 2.12" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} {...svg}>
      <path
        d={shapePath(params, 1, -Math.PI / 2, 240)}
        fill={fill}
        stroke={stroke ?? "none"}
        strokeWidth={stroke ? 1.25 : undefined}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The parameter set beside a shape, set as a small table of values. */
export function ParamTable({ params, notes }: { params: Params; notes?: Partial<Record<"m" | "n1" | "n2" | "n3", string>> }) {
  const rows = [
    ["m", params.m],
    [<N key={1} i={1} />, params.n1],
    [<N key={2} i={2} />, params.n2],
    [<N key={3} i={3} />, params.n3],
  ] as const;
  const keys = ["m", "n1", "n2", "n3"] as const;
  return (
    <dl className="grid grid-cols-[2rem_auto_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 text-base">
      {rows.map(([name, value], i) => (
        <div key={keys[i]} className="contents">
          <dt className="font-semibold">{name}</dt>
          <dd className="text-right font-semibold">{fmt(value)}</dd>
          <dd className="text-xs opacity-60">{notes?.[keys[i]] ?? ""}</dd>
        </div>
      ))}
    </dl>
  );
}

/** n with a subscript index, set in the text face rather than Unicode subscript digits. */
export function N({ i }: { i: 1 | 2 | 3 }) {
  return (
    <span className="whitespace-nowrap">
      n<sub className="text-[0.65em]">{i}</sub>
    </span>
  );
}
