import type { CSSProperties } from "react";
import type { Leaf } from "./venation";

type LeafSvgProps = {
  leaf: Leaf;
  /** CSS colour for the blade, from the palette. */
  fill: string;
  /** Accessible name; leave out for decorative leaves. */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * A grown leaf as SVG: palette blade, theme-ink veins grouped by growth frame (animated by <Grow>)
 * and by pipe-model width.
 */
export function LeafSvg({ leaf, fill, label, className, style }: LeafSvgProps) {
  const hairline = leaf.petioleWidth * 0.09;
  return (
    <svg
      viewBox={`${leaf.box.x} ${leaf.box.y} ${leaf.box.w} ${leaf.box.h}`}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
      className={className}
      style={style}
    >
      <path d={leaf.outline} fill={fill} className="ven-blade" />
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={leaf.outline} strokeWidth={hairline} className="ven-blade" />
        <path
          d={leaf.petiole}
          strokeWidth={leaf.petioleWidth}
          className="ven-frame"
        />
        {leaf.veins.map((v, i) => (
          <path
            key={i}
            d={v.d}
            strokeWidth={v.width}
            className="ven-frame"
            style={{ "--frame": v.frame } as CSSProperties}
          />
        ))}
      </g>
    </svg>
  );
}
