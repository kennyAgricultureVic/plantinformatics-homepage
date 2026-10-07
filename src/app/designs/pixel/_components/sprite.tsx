import type { SVGProps } from "react";

// Palette slots as literal Tailwind classes. Only these six colours exist in the pixel world.
const fills: Record<string, string> = {
  k: "fill-black",
  w: "fill-white",
  "1": "fill-(--p1)",
  "2": "fill-(--p2)",
  "3": "fill-(--p3)",
  "4": "fill-(--p4)",
};

type SpriteProps = {
  rows: readonly string[];
  x?: number;
  y?: number;
  /** Mirror horizontally (the sprite still occupies the same box). */
  flip?: boolean;
  /** Extra character to class mappings, e.g. { a: "fill-(--p1)" }. */
  colors?: Record<string, string>;
} & Omit<SVGProps<SVGGElement>, "x" | "y">;

/** Draws a character-grid sprite as SVG rects, merging horizontal runs of one colour. */
export function Sprite({ rows, x = 0, y = 0, flip, colors, ...rest }: SpriteProps) {
  const width = Math.max(...rows.map((r) => r.length));
  const rects = rows.flatMap((row, j) => {
    const out = [];
    for (let i = 0; i < row.length; ) {
      const c = row[i];
      let k = i + 1;
      while (k < row.length && row[k] === c) k++;
      const fill = colors?.[c] ?? fills[c];
      if (c !== "." && fill) out.push(<rect key={`${j}-${i}`} x={i} y={j} width={k - i} height={1} className={fill} />);
      i = k;
    }
    return out;
  });
  const mirror = flip ? ` translate(${width} 0) scale(-1 1)` : "";
  return (
    <g transform={`translate(${x} ${y})${mirror}`} {...rest}>
      {rects}
    </g>
  );
}

/** Dither patterns for one SVG: 50% and 25% checkers of a palette colour, black or white. */
export function DitherDefs({ prefix }: { prefix: string }) {
  const swatches = { p1: "fill-(--p1)", p3: "fill-(--p3)", p4: "fill-(--p4)", k: "fill-black", w: "fill-white" };
  return (
    <defs>
      {Object.entries(swatches).map(([name, fill]) => (
        <g key={name}>
          <pattern id={`${prefix}-${name}-50`} width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" className={fill} />
            <rect x="1" y="1" width="1" height="1" className={fill} />
          </pattern>
          <pattern id={`${prefix}-${name}-25`} width="2" height="2" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" className={fill} />
          </pattern>
        </g>
      ))}
    </defs>
  );
}

/** Sky bands for day (palette colour fading to white) and night (black with a palette glow at the horizon). */
export function Sky({
  prefix,
  width,
  height,
  stars,
  twinkleClassName,
}: {
  prefix: string;
  width: number;
  height: number;
  stars: readonly (readonly [number, number])[];
  twinkleClassName?: string;
}) {
  const band = height / 4;
  return (
    <g>
      <rect width={width} height={height} className="fill-white dark:fill-black" />
      <g className="dark:hidden">
        <rect width={width} height={band} className="fill-(--p4)" />
        <rect y={band} width={width} height={band} fill={`url(#${prefix}-p4-50)`} />
        <rect y={band * 2} width={width} height={band} fill={`url(#${prefix}-p4-25)`} />
      </g>
      <g className="hidden dark:inline">
        <rect y={band * 2} width={width} height={band} fill={`url(#${prefix}-p4-25)`} />
        <rect y={band * 3} width={width} height={band} fill={`url(#${prefix}-p4-50)`} />
        {stars.map(([sx, sy], i) => (
          <rect
            key={i}
            x={sx}
            y={sy}
            width="1"
            height="1"
            className={i % 3 === 0 ? `fill-white ${twinkleClassName ?? ""}` : "fill-white"}
            style={{ animationDelay: `${(i % 5) * 0.3}s` }}
          />
        ))}
      </g>
    </g>
  );
}
