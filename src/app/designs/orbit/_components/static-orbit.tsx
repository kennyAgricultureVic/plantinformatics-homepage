import type { Crop } from "@/content";
import { CAMERA, RACHIS, clusters, cropCss, particleWorld, ringWorld, rotate, spikelets } from "./geometry";

// Perspective projection with the same camera as the WebGL scene, so this still matches it.
const [cx, cy, cz] = CAMERA.position;
const len = Math.hypot(cx, cy, cz);
const f = [-cx / len, -cy / len, -cz / len];
const u = [0, -f[2], f[1]];
const k = 1 / Math.tan((CAMERA.fov * Math.PI) / 360);
const VIEW_Y = 0.4; // the scene's resting turn

// Rounded so server and client render identical attributes (Math.sin/cos can differ in the last digit).
const r4 = (n: number) => Math.round(n * 1e4) / 1e4;

function project(p: [number, number, number]) {
  const [x, y, z] = rotate(p, 0, VIEW_Y, 0);
  const d = [x - cx, y - cy, z - cz];
  const depth = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
  return { x: r4((d[0] / depth) * k), y: r4(-((d[1] * u[1] + d[2] * u[2]) / depth) * k), depth: r4(depth) };
}

const pts = (list: { x: number; y: number }[]) => list.map((p) => `${p.x.toFixed(4)},${p.y.toFixed(4)}`).join(" ");

const rings = clusters.map((c) => pts(Array.from({ length: 97 }, (_, i) => project(ringWorld(c, (i / 96) * Math.PI * 2)))));

const particles = clusters
  .flatMap((c) => c.particles.map((p) => ({ crop: c.crop, index: c.index, ...project(particleWorld(c, p)) })))
  .sort((a, b) => b.depth - a.depth);

const grain = {
  rachis: [project([0, RACHIS.bottom, 0]), project([0, RACHIS.top, 0])],
  spikelets: spikelets.map((s) => {
    const centre = project(s.centre3);
    const tip = project(s.tip3);
    // The ellipse runs from its centre to the projected tip, so it leans as the 3D one does.
    const [dx, dy] = [tip.x - centre.x, tip.y - centre.y];
    return {
      centre,
      tip,
      awn: project(s.awn3),
      rx: r4((s.scale[0] * k) / centre.depth),
      ry: r4(Math.hypot(dx, dy)),
      deg: r4((Math.atan2(dx, -dy) * 180) / Math.PI),
    };
  }),
};

/** Still of the orbit scene in SVG: used without WebGL, with reduced motion, and while the scene loads. */
export function StaticOrbit({ active, className }: { active?: Crop | null; className?: string }) {
  return (
    <svg viewBox="-1.05 -1.05 2.1 2.1" className={className} role="img" aria-label="Genotyped accessions orbiting a grain head, grouped by crop">
      <g fill="none" strokeWidth={0.004}>
        {clusters.map((c, i) => (
          <polyline
            key={c.crop}
            points={rings[i]}
            stroke={cropCss(c.index)}
            strokeOpacity={active ? (active === c.crop ? 0.9 : 0.15) : 0.4}
          />
        ))}
      </g>
      <g className="text-foreground" stroke="currentColor" strokeLinecap="round">
        <line x1={grain.rachis[0].x} y1={grain.rachis[0].y} x2={grain.rachis[1].x} y2={grain.rachis[1].y} strokeWidth={0.012} />
        {grain.spikelets.map((s, i) => (
          <g key={i}>
            <line x1={s.tip.x} y1={s.tip.y} x2={s.awn.x} y2={s.awn.y} strokeWidth={0.003} strokeOpacity={0.6} />
            <ellipse
              cx={s.centre.x}
              cy={s.centre.y}
              rx={s.rx}
              ry={s.ry}
              transform={`rotate(${s.deg} ${s.centre.x} ${s.centre.y})`}
              fill="currentColor"
              strokeWidth={0}
            />
          </g>
        ))}
      </g>
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={r4((0.075 * k) / p.depth)}
          fill={cropCss(p.index)}
          opacity={active && active !== p.crop ? 0.25 : 1}
        />
      ))}
    </svg>
  );
}
