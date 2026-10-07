import { formatDate, news } from "@/content";
import { cn } from "@/lib/utils";
import { hashSeed, mulberry32 } from "./venation";

const count = news.length;

/** A secondary vein from the midrib up and out to an item, with a seeded veinlet or two. */
function SecondaryVein({
  seed,
  width,
  className,
}: {
  seed: string;
  width: number;
  className?: string;
}) {
  const rand = mulberry32(hashSeed(seed));
  const lift = 18 + rand() * 10;
  const d = `M0 56C20 ${50 - rand() * 6} 44 ${lift + 12} 72 ${lift}`;
  const twigs = Array.from({ length: 1 + Math.floor(rand() * 2) }, () => {
    const t = 0.35 + rand() * 0.4;
    const x = t * 72;
    const y = 56 - t * (56 - lift) - 2;
    const up = rand() > 0.5;
    return `M${x.toFixed(1)} ${y.toFixed(1)}l${(6 + rand() * 6).toFixed(1)} ${(up ? -1 : 1) * (5 + rand() * 6)}`;
  }).join("");
  return (
    <svg
      viewBox="0 0 80 64"
      aria-hidden
      className={cn("absolute top-0 h-16 w-20 overflow-visible", className)}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d={d} strokeWidth={width} className="ven-frame" />
        <path d={twigs} strokeWidth={0.8} className="ven-frame" />
      </g>
    </svg>
  );
}

/**
 * News as one midrib: the newest item is the tip, each item a secondary vein, and the midrib
 * thickens toward the base the way the pipe model says it must, carrying every vein above it.
 */
export function NewsMidrib() {
  return (
    <div className="relative">
      <svg
        viewBox="0 0 10 100"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-y-0 left-0 h-full w-2.5 -translate-x-1/2 md:left-1/2"
      >
        <path d="M4.6 0H5.4L6.6 100H3.4Z" fill="currentColor" />
      </svg>
      <ol className="grid gap-12 pt-6 md:gap-6">
        {news.map((n, i) => {
          const right = i % 2 === 0;
          // Each secondary vein feeds one item; its width grows a little toward the base like the midrib.
          const width = 1.2 + (i / count) * 1.6;
          return (
            <li
              key={n.date + n.title}
              className={cn(
                "relative pl-20 md:w-1/2 md:not-first:-mt-10",
                right
                  ? "md:ml-auto md:pl-24"
                  : "md:pr-24 md:pl-0 md:text-right",
              )}
            >
              <SecondaryVein
                seed={n.title}
                width={width}
                className={
                  right
                    ? "left-0"
                    : "left-0 md:right-0 md:left-auto md:-scale-x-100"
                }
              />
              <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                <time dateTime={n.date}>{formatDate(n.date)}</time>
                {" · "}
                <span className="text-(--ink0)">
                  {n.kind === "tool" ? "Tool release" : "Data release"}
                </span>
              </p>
              <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
                {n.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{n.body}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
