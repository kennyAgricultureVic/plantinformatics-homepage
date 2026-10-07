import type { Ref } from "react";
import { cn } from "@/lib/utils";

type ScaleBarProps = {
  /** Bar length as a share of the lens width, 0 to 100. */
  pct: number;
  label: string;
  barRef?: Ref<HTMLSpanElement>;
  labelRef?: Ref<HTMLSpanElement>;
  className?: string;
};

/** A map-style scale bar: a ruled line with end ticks and its length. */
export function ScaleBar({ pct, label, barRef, labelRef, className }: ScaleBarProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm tabular-nums", className)}>
      <span className="relative h-3 w-1/2 shrink-0">
        <span
          ref={barRef}
          className="absolute inset-y-0 left-0 border-x-2 border-current after:absolute after:inset-x-0 after:top-1/2 after:h-0.5 after:-translate-y-1/2 after:bg-current"
          style={{ width: `${pct * 2}%` }}
        />
      </span>
      <span ref={labelRef}>{label}</span>
    </div>
  );
}
