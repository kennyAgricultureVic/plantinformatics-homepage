import type { CSSProperties } from "react";

/**
 * The descent, one scale step per section. `width` is the lens's field of view in metres;
 * each step is drawn about ten times closer than the last, the labels give the real scale.
 */
export const steps = [
  { target: "about", name: "Field trial", width: 40 },
  { target: "tools", name: "Single plant", width: 1 },
  { target: "data", name: "Seed", width: 0.008 },
  { target: "news", name: "Cell and chromosome", width: 5e-5 },
  { target: "funding", name: "DNA helix", width: 1e-8 },
] as const;

export type StepIndex = 0 | 1 | 2 | 3 | 4;

/** The palette shifts one step per scale: colour `j` of step `k`. */
export const tone = (k: number, j = 0) => `var(--p${((k + j) % 4) + 1})`;

/** A palette colour thinned into the page ground (white in light mode, black in dark). */
export const mix = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, var(--background))`;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Field of view at a continuous position `z` (0 = field, 4 = DNA), interpolated in log space. */
export const widthAt = (z: number) => {
  const i = clamp(Math.floor(z), 0, steps.length - 2);
  const t = clamp(z - i);
  const a = Math.log10(steps[i].width);
  const b = Math.log10(steps[i + 1].width);
  return 10 ** (a + (b - a) * t);
};

const units = [
  [1, "m"],
  [1e-2, "cm"],
  [1e-3, "mm"],
  [1e-6, "µm"],
  [1e-9, "nm"],
] as const;

export const formatLength = (metres: number) => {
  const [size, unit] = units.find(([u]) => metres >= u * 0.999) ?? units[units.length - 1];
  const n = metres / size;
  return `${n >= 10 ? Math.round(n) : Number(n.toPrecision(1))} ${unit}`;
};

/** A classic scale bar: a round length near a quarter of the view, and its share of the lens width. */
export const scaleBar = (width: number) => {
  const target = width / 4;
  const exp = Math.floor(Math.log10(target));
  const f = target / 10 ** exp;
  const nice = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * 10 ** exp;
  return { pct: (nice / width) * 100, label: formatLength(nice) };
};

/**
 * Where scene `k` sits when the camera is at `z`: ten times larger per step passed, so the next
 * scene grows out of the centre of this one and this one swells past the rim as it fades.
 */
export const sceneStyle = (k: number, z: number): CSSProperties => {
  const d = z - k;
  const opacity = d >= 0 ? clamp(1 - d / 0.6) : clamp((d + 1) / 0.5);
  return {
    transform: `scale(${10 ** clamp(d, -1.2, 1.2)})`,
    opacity,
    visibility: opacity <= 0 ? "hidden" : "visible",
  };
};
