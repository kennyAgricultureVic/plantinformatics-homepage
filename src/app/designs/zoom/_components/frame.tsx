import { cn } from "@/lib/utils";
import { formatLength, scaleBar, steps, tone, type StepIndex } from "./scale";
import { ScaleBar } from "./scale-bar";
import { Scene } from "./scenes";

/**
 * One step's scene in its own small lens, shown inside the section on narrow screens and whenever
 * the sticky lens is off (reduced motion). Static by default; zooms in on scroll where CSS allows.
 */
export function Frame({ k, className }: { k: StepIndex; className?: string }) {
  const { pct, label } = scaleBar(steps[k].width);
  return (
    <figure className={cn("w-full max-w-72", className)}>
      <div className="zoom-frame relative aspect-square overflow-hidden rounded-full border-2 border-foreground" aria-hidden="true">
        <div className="zoom-frame-scene absolute inset-0">
          <Scene k={k} />
        </div>
      </div>
      <figcaption className="mt-4">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3">
          <span className="flex items-center gap-2 font-(family-name:--font-zoom-display) text-lg">
            <span className="size-2.5 shrink-0" style={{ background: tone(k) }} />
            {steps[k].name}
          </span>
          <span className="text-xs whitespace-nowrap text-muted-foreground">Field of view {formatLength(steps[k].width)}</span>
        </span>
        <ScaleBar pct={pct} label={label} className="mt-2" />
      </figcaption>
    </figure>
  );
}
