import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page frame shared by the overlay and every row, so content sits exactly on the visible columns. */
export const frame = "mx-auto w-full max-w-[1440px] px-4 md:px-8";

/** 4 columns on phones, 12 from md up, same gutters as the overlay. */
export const columns = "grid grid-cols-4 gap-x-4 md:grid-cols-12 md:gap-x-6";

/** One row of the modular grid. */
export function Row({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn(frame, columns, className)}>{children}</div>;
}

/** The 12-column grid drawn faintly behind the page. Purely decorative. */
export function GridOverlay() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className={cn(frame, columns, "h-full")}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-full border-x border-black/[0.06] bg-black/[0.018] dark:border-white/[0.09] dark:bg-white/[0.025]",
              i >= 4 && "hidden md:block",
            )}
          />
        ))}
      </div>
    </div>
  );
}
