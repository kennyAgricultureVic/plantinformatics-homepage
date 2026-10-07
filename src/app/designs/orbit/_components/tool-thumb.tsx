"use client";

import dynamic from "next/dynamic";
import type { ToolSlug } from "@/content";
import { use3D } from "./use-3d";

const ToolScene = dynamic(() => import("./scene").then((m) => m.ToolScene), { ssr: false });

// Flat versions of the 3D thumbnails, for no WebGL or reduced motion.
function StaticGlyph({ slug, index }: { slug: ToolSlug; index: number }) {
  const color = `var(--p${(index % 4) + 1})`;
  return (
    <svg viewBox="-1 -1 2 2" className="size-full" aria-hidden>
      {slug === "pretzel" && (
        <path
          d="M0 0.55 C-0.9 -0.1 -0.6 -0.75 -0.15 -0.5 C0.25 -0.25 0.3 0.25 -0.35 0.45 M0 0.55 C0.9 -0.1 0.6 -0.75 0.15 -0.5 C-0.25 -0.25 -0.3 0.25 0.35 0.45"
          fill="none"
          stroke={color}
          strokeWidth={0.16}
          strokeLinecap="round"
        />
      )}
      {slug === "genolink" && (
        <g fill="none" strokeWidth={0.13}>
          <circle cx={-0.3} r={0.45} stroke={color} />
          <ellipse cx={0.3} rx={0.45} ry={0.16} className="stroke-foreground" />
        </g>
      )}
      {slug === "fairybread" &&
        Array.from({ length: 45 }, (_, i) => {
          const c = i % 3;
          const a = i * 2.4;
          const r = 0.12 + ((i * 37) % 10) * 0.025;
          const cx = Math.round(((c - 1) * 0.5 + Math.cos(a) * r) * 1e4) / 1e4;
          const cy = Math.round(((c === 1 ? -0.3 : 0.15) + Math.sin(a) * r) * 1e4) / 1e4;
          return <circle key={i} cx={cx} cy={cy} r={0.045} fill={color} />;
        })}
      {slug === "brioche" && (
        <g strokeWidth={0.1} strokeLinecap="round">
          <line x1={-0.85} y1={-0.45} x2={0.85} y2={-0.45} className="stroke-foreground" />
          <line x1={-0.85} y1={0.45} x2={0.85} y2={0.45} stroke={color} />
          {Array.from({ length: 6 }, (_, i) => {
            const x = Math.round((-0.75 + i * 0.3) * 100) / 100;
            return <line key={i} x1={x} y1={-0.45} x2={Math.round((x + (i % 3) * 0.12 - 0.12) * 100) / 100} y2={0.45} stroke={color} strokeWidth={0.03} />;
          })}
        </g>
      )}
    </svg>
  );
}

/** Small 3D thumbnail of a tool, falling back to a flat glyph. */
export function ToolThumb({ slug, index }: { slug: ToolSlug; index: number }) {
  const live = use3D();
  return (
    <div className="aspect-square w-full">{live ? <ToolScene slug={slug} index={index} /> : <StaticGlyph slug={slug} index={index} />}</div>
  );
}
