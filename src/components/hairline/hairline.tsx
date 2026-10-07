"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import HL from "./generated/kernel.js";
import { figures } from "./generated";
import type { HairlineFigureName } from "./generated/names";

type Figure = {
  name: string;
  means: string;
  range: [number, number, number];
  mount: (
    host: { stage: HTMLElement; svg: SVGSVGElement; read: { textContent: string | null } },
    value: number,
  ) => { set: (value: number) => void; destroy: () => void };
};

type Define = (hl: unknown, hairline: (figure: Figure) => void) => void;

const load = (name: HairlineFigureName) => {
  let figure: Figure | undefined;
  (figures[name] as Define)(HL, (f) => (figure = f));
  if (!figure) throw new Error(`hairline: ${name} did not register.`);
  return figure;
};

/** Intensity 0..1 to the figure's own number: two straight lines meeting at 0.5, as on the bench. */
const scale = ([lo, mid, hi]: Figure["range"], i: number) =>
  i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - mid);

type HairlineProps = {
  figure: HairlineFigureName;
  /** 0 to 1, the figure's main parameter (stagger, spread and so on). Defaults to 0.5. */
  intensity?: number;
  /** Called with the figure's read-out, e.g. "spikelet 04" or "rest". */
  onRead?: (text: string) => void;
  className?: string;
};

/**
 * One animated isometric Hairline line figure that answers the pointer, drawn in a 5:4 box.
 * Colours come from CSS variables on any ancestor: --hairline-plate (fill, usually the ground),
 * --hairline-hi (highlight stroke), --hairline-edge (silhouette), --hairline-mid (inner lines),
 * --hairline-lo (dim lines) and --hairline-stroke (width, default 0.9). Defaults follow the
 * `.dark` class. Reduced motion is honoured by the kernel.
 */
export function Hairline({ figure, intensity = 0.5, onRead, className }: HairlineProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<{ set: (v: number) => void; range: Figure["range"] } | null>(null);
  const onReadRef = useRef(onRead);
  const intensityRef = useRef(intensity);

  useEffect(() => {
    onReadRef.current = onRead;
    intensityRef.current = intensity;
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    HL.inject(document);
    const f = load(figure);
    stage.setAttribute("aria-label", f.means);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage) as SVGSVGElement;
    let text: string | null = null;
    const read = {
      get textContent() {
        return text;
      },
      set textContent(value: string | null) {
        text = value == null ? "" : String(value);
        onReadRef.current?.(text);
      },
    };
    const handle = f.mount({ stage, svg, read }, scale(f.range, intensityRef.current));
    handleRef.current = { set: handle.set, range: f.range };
    return () => {
      handleRef.current = null;
      handle.destroy();
      svg.remove();
    };
  }, [figure]);

  useEffect(() => {
    const h = handleRef.current;
    if (h) h.set(scale(h.range, intensity));
  }, [intensity]);

  return <div ref={stageRef} data-hairline={figure} role="img" className={cn("w-full", className)} />;
}
