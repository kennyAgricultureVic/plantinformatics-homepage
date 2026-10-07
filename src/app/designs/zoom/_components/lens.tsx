"use client";

import { useEffect, useRef, useState } from "react";
import { ScaleBar } from "./scale-bar";
import { Scene } from "./scenes";
import { formatLength, sceneStyle, scaleBar, steps, tone, widthAt, type StepIndex } from "./scale";

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The sticky lens beside the sections on wide screens. Scroll position sets a continuous camera
 * depth `z`: each step's zoom runs while the next section's top climbs from 95% to 35% of the
 * viewport. Writes go straight to the layers' styles in one rAF per scroll, so nothing re-renders
 * except the caption when the nearest step changes. Hidden under reduced motion (see page.tsx).
 */
export function Lens() {
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState<StepIndex>(0);

  useEffect(() => {
    const targets = steps.map((s) => document.getElementById(s.target));
    let frame = 0;

    const update = () => {
      frame = 0;
      const h = window.innerHeight;
      let z = 0;
      for (const el of targets.slice(1)) {
        if (el) z += clamp((0.95 * h - el.getBoundingClientRect().top) / (0.6 * h));
      }
      layers.current.forEach((layer, k) => {
        if (layer) Object.assign(layer.style, sceneStyle(k, z));
      });
      const { pct, label: text } = scaleBar(widthAt(z));
      if (bar.current) bar.current.style.width = `${pct * 2}%`;
      if (label.current) label.current.textContent = text;
      setStep(Math.round(z) as StepIndex);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const start = scaleBar(steps[0].width);

  return (
    <div className="sticky top-0 flex h-svh flex-col items-center justify-center py-8" aria-hidden="true">
      <div className="w-full max-w-[min(100%,68svh)]">
        <div className="relative aspect-square">
          <div className="absolute -inset-3 rounded-full border border-foreground/25" />
          <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-foreground bg-background">
            {steps.map((s, k) => (
              <div
                key={s.target}
                ref={(el) => {
                  layers.current[k] = el;
                }}
                className="absolute inset-0 origin-center will-change-transform"
                style={sceneStyle(k, 0)}
              >
                <Scene k={k as StepIndex} />
              </div>
            ))}
          </div>
          {[0, 90, 180, 270].map((a) => (
            <span
              key={a}
              className="absolute top-1/2 left-1/2 h-px w-[calc(50%+1.25rem)] origin-left bg-foreground"
              style={{ transform: `rotate(${a}deg)`, clipPath: "inset(0 0 0 calc(100% - 0.75rem))" }}
            />
          ))}
        </div>
        <div className="mt-8 flex items-baseline justify-between gap-4">
          <p className="flex items-center gap-2 font-(family-name:--font-zoom-display) text-xl">
            <span className="size-3 shrink-0 transition-colors" style={{ background: tone(step) }} />
            {steps[step].name}
          </p>
          <p className="text-sm text-muted-foreground">Field of view {formatLength(steps[step].width)}</p>
        </div>
        <ScaleBar pct={start.pct} label={start.label} barRef={bar} labelRef={label} className="mt-3" />
      </div>
    </div>
  );
}
