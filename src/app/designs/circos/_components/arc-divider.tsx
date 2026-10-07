import type { SectionId } from "@/content";
import { TAU, annulus, cropSegments, maxRelease, newsTicks, spoke, toolSegments } from "./geometry";

// The hero ring unrolled onto a shallow arc across the page width.
const RR = 2400;
const SPREAD = Math.asin(500 / RR);
const CENTER = [500, RR + 50] as const;
const at = (t: number) => -SPREAD + (t / TAU) * 2 * SPREAD;

const band = (r0: number, r1: number, t0: number, t1: number) => annulus(RR + r0, RR + r1, at(t0), at(t1), CENTER);

/**
 * Section divider that reuses the Circos ring: every segment drawn faintly, with the ones
 * belonging to `section` brought forward (tools in palette colour, crops with release bars, news ticks).
 */
export function ArcDivider({ section }: { section: Exclude<SectionId, "about"> }) {
  return (
    <svg viewBox="0 0 1000 110" className="h-auto w-full" aria-hidden>
      {cropSegments.map((crop) => (
        <g key={crop.key}>
          {crop.bands.map((b, i) => (
            <path
              key={b.item}
              d={band(-14, 0, b.start, b.end)}
              className={
                section === "data" ? (i % 2 ? "fill-foreground/45" : "fill-foreground/85") : "fill-foreground/12"
              }
            />
          ))}
          {section === "data" &&
            crop.releases.map((arc) => (
              <path
                key={arc.id}
                d={band(6, 6 + 34 * Math.sqrt(arc.release.accessions / maxRelease), arc.start, arc.end)}
                className={"superseded" in arc.release ? "fill-foreground/25" : "fill-foreground"}
              />
            ))}
        </g>
      ))}
      {toolSegments.map((tool) => (
        <path
          key={tool.key}
          d={band(-14, 0, tool.start, tool.end)}
          style={section === "tools" ? { fill: tool.color } : undefined}
          className={section === "tools" ? undefined : "fill-foreground/12"}
        />
      ))}
      {section === "news" && (
        <g strokeWidth={4} strokeLinecap="round">
          {newsTicks.map((t) => (
            <path
              key={t.index}
              d={spoke(RR + 6, RR + 38, at(t.angle), CENTER)}
              style={{ stroke: t.color ?? "var(--foreground)" }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
