// Leaf venation by space colonisation (Runions et al. 2005, open venation).
// Attractors are scattered inside a leaf outline; vein nodes grow a step D toward the attractors
// that have them as nearest node (within d_i), and an attractor is removed once a node comes within d_k.
// Vein width follows the pipe model: a segment's cross-section is proportional to the vein tips it feeds.
// Pure and seeded, so the server and the client grow exactly the same leaf.

export type Outline =
  "elliptic" | "lanceolate" | "ovate" | "cordate" | "linear";

export type LeafSpec = {
  outline: Outline;
  /** Blade length in user units, base (petiole junction) to tip. */
  length: number;
  /** Number of attractors, which is the data a leaf carries. */
  attractors: number;
  seed: string;
  /** Clockwise tilt in degrees, applied after growth. */
  tilt?: number;
  /** Animation frames the growth is split into. */
  frames?: number;
};

export type VeinGroup = { frame: number; width: number; d: string };

export type Leaf = {
  outline: string;
  petiole: string;
  petioleWidth: number;
  veins: VeinGroup[];
  /** Bounding box including the petiole, for the SVG viewBox. */
  box: { x: number; y: number; w: number; h: number };
  params: {
    D: number;
    di: number;
    dk: number;
    n: number;
    nodes: number;
    steps: number;
    left: number;
  };
};

// ---------------------------------------------------------------------------------------------
// Seeded randomness

export function hashSeed(...parts: (string | number)[]) {
  let h = 2166136261;
  for (const ch of parts.join("|")) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------------
// Outlines: half-width as a fraction of length, for t from base (0) to tip (1).

type Shape = {
  aspect: number;
  start: number;
  half: (t: number) => number;
  notch?: number;
};

const beta = (a: number, b: number) => {
  const peak = a / (a + b);
  const max = peak ** a * (1 - peak) ** b;
  return (t: number) => (t <= 0 || t >= 1 ? 0 : (t ** a * (1 - t) ** b) / max);
};

export const shapes: Record<Outline, Shape> = {
  elliptic: { aspect: 0.27, start: 0, half: beta(0.75, 0.95) },
  lanceolate: { aspect: 0.15, start: 0, half: beta(0.55, 1.35) },
  ovate: { aspect: 0.3, start: 0, half: beta(0.6, 1.05) },
  // Starts below the petiole junction so the two lobes round off either side of a sinus.
  cordate: {
    aspect: 0.4,
    start: -0.16,
    half: (t) => beta(0.42, 1.15)((t + 0.16) / 1.16),
    notch: 1.4,
  },
  linear: { aspect: 0.065, start: 0, half: beta(0.18, 0.55) },
};

/** Polygon around the blade, in leaf space: base at the origin, tip at (0, -length). */
function outlinePolygon(shape: Shape, length: number): [number, number][] {
  const S = 120;
  const right: [number, number][] = [];
  for (let i = 0; i <= S; i++) {
    const t = 1 - (i / S) * (1 - shape.start);
    const x = shape.half(t) * shape.aspect * length;
    if (shape.notch && t < 0) {
      const sinus = -t * shape.notch * shape.aspect * length;
      if (sinus >= x) break;
    }
    right.push([x, -t * length]);
  }
  if (shape.notch) {
    // Up the sinus to the petiole junction.
    const last = right[right.length - 1];
    right.push([last[0] * 0.35, last[1] * 0.35], [0, 0]);
  }
  const left = right
    .slice(0, -1)
    .reverse()
    .map(([x, y]) => [-x, y] as [number, number]);
  return [...right, ...left.slice(0, -1)];
}

function inside(poly: [number, number][], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      hit = !hit;
  }
  return hit;
}

function polygonArea(poly: [number, number][]) {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
    a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  return Math.abs(a / 2);
}

// ---------------------------------------------------------------------------------------------
// Growth

const f = (n: number) => (Math.round(n * 10) / 10).toString();

export function growLeaf({
  outline,
  length,
  attractors: n,
  seed,
  tilt = 0,
  frames = 28,
}: LeafSpec): Leaf {
  const shape = shapes[outline];
  const poly = outlinePolygon(shape, length);
  const rand = mulberry32(hashSeed(seed, outline, n));

  // Typical attractor spacing for an even scatter of n points over the blade.
  const spacing = Math.sqrt(polygonArea(poly) / Math.max(n, 1));
  const D = spacing * 0.32;
  const di = spacing * 2.4;
  const dk = spacing * 0.55;

  // Attractors by dart throwing with a minimum spacing, relaxed if the blade fills up.
  const minX = Math.min(...poly.map((p) => p[0]));
  const maxX = Math.max(...poly.map((p) => p[0]));
  const minY = Math.min(...poly.map((p) => p[1]));
  const maxY = Math.max(...poly.map((p) => p[1]));
  const margin = spacing * 0.25;
  const ax: number[] = [];
  const ay: number[] = [];
  let gap = spacing * 0.7;
  for (let tries = 0; ax.length < n && tries < n * 400; tries++) {
    if (tries > 0 && tries % (n * 40) === 0) gap *= 0.85;
    const x = minX + rand() * (maxX - minX);
    const y = minY + rand() * (maxY - minY);
    if (!inside(poly, x, y) || -y < margin) continue;
    if (
      !inside(poly, x + margin, y) ||
      !inside(poly, x - margin, y) ||
      !inside(poly, x, y - margin)
    )
      continue;
    let ok = true;
    for (let k = 0; k < ax.length && ok; k++)
      if ((ax[k] - x) ** 2 + (ay[k] - y) ** 2 < gap * gap) ok = false;
    if (ok) {
      ax.push(x);
      ay.push(y);
    }
  }

  // Vein nodes. Each attractor caches its nearest node, so a step only checks the new nodes.
  const nx: number[] = [0];
  const ny: number[] = [0];
  const parent: number[] = [-1];
  const born: number[] = [0];
  const children = new Map<number, number[]>();
  const alive = ax.map(() => true);
  const nearest = ax.map(() => 0);
  const dist = ax.map((x, k) => Math.hypot(x, ay[k]));
  let remaining = ax.length;
  let fresh = [0];
  let step = 0;
  const maxSteps = Math.ceil((length / D) * 4);
  const midribEnd = length * 0.94;
  const sway = (rand() - 0.5) * 0.05 * length;
  const bend = (t: number) =>
    sway * Math.sin(Math.PI * t) * shape.half(t) ** 0.5;
  let midTip = 0;

  while (remaining > 0 && step < maxSteps) {
    step++;
    for (let k = 0; k < ax.length; k++) {
      if (!alive[k]) continue;
      for (const i of fresh) {
        const d = Math.hypot(ax[k] - nx[i], ay[k] - ny[i]);
        if (d < dist[k]) {
          dist[k] = d;
          nearest[k] = i;
        }
      }
      if (dist[k] < dk) {
        alive[k] = false;
        remaining--;
      }
    }

    // Sum unit vectors toward each node's attractors.
    const pull = new Map<number, [number, number]>();
    for (let k = 0; k < ax.length; k++) {
      if (!alive[k] || dist[k] > di) continue;
      const i = nearest[k];
      const v = pull.get(i) ?? [0, 0];
      v[0] += (ax[k] - nx[i]) / dist[k];
      v[1] += (ay[k] - ny[i]) / dist[k];
      pull.set(i, v);
    }

    fresh = [];
    /** Adds a child of node i one step D along (dx, dy); returns it, or the near-identical sibling it would duplicate. */
    const add = (i: number, dx: number, dy: number) => {
      const len = Math.hypot(dx, dy);
      if (len < 1e-6) return -1;
      const x = nx[i] + (dx / len) * D;
      const y = ny[i] + (dy / len) * D;
      // A node whose attractors did not move on would sprout the same twig again: skip it.
      const siblings = children.get(i) ?? [];
      const twin = siblings.find(
        (c) => Math.hypot(nx[c] - x, ny[c] - y) < D * 0.5,
      );
      if (twin !== undefined) return twin;
      siblings.push(nx.length);
      children.set(i, siblings);
      nx.push(x);
      ny.push(y);
      parent.push(i);
      born.push(step);
      fresh.push(nx.length - 1);
      return nx.length - 1;
    };

    // The midrib differentiates first: it runs toward the tip at twice the vein
    // speed along a gentle seeded curve, and the colonising veins branch off it.
    for (let r = 0; r < 2 && -ny[midTip] < midribEnd; r++) {
      const t = Math.min(midribEnd, -ny[midTip] + D) / length;
      const next = add(midTip, bend(t) - nx[midTip], -t * length - ny[midTip]);
      if (next < 0) break;
      midTip = next;
    }

    for (const [i, [dx, dy]] of [...pull.entries()].sort((a, b) => a[0] - b[0]))
      add(i, dx, dy);
    if (fresh.length === 0) break;
  }

  // Pipe model: tips fed by each node, accumulated from the newest nodes back to the base.
  const tips = nx.map(() => 0);
  const hasChild = nx.map(() => false);
  for (let i = 1; i < nx.length; i++) hasChild[parent[i]] = true;
  for (let i = nx.length - 1; i >= 0; i--) {
    if (!hasChild[i]) tips[i] += 1;
    if (parent[i] >= 0) tips[parent[i]] += tips[i];
  }
  const maxWidth = length * 0.016;
  const minWidth = Math.max(spacing * 0.045, length * 0.0012);
  const widthOf = (t: number) =>
    minWidth + (maxWidth - minWidth) * Math.sqrt(t / tips[0]);

  // Tilt about the base.
  const a = (tilt * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const rot = (x: number, y: number): [number, number] => [
    x * cos - y * sin,
    x * sin + y * cos,
  ];

  // Group segments by growth frame and width band (tips in powers of two) so the SVG stays a few hundred paths.
  const groups = new Map<
    string,
    { frame: number; band: number; parts: string[] }
  >();
  const lastStep = Math.max(step, 1);
  for (let i = 1; i < nx.length; i++) {
    const p = parent[i];
    const frame = Math.min(
      frames - 1,
      Math.floor((born[i] / lastStep) * frames),
    );
    const band = Math.round(Math.log2(tips[i]));
    const key = `${frame}:${band}`;
    const g = groups.get(key) ?? { frame, band, parts: [] };
    const [x0, y0] = rot(nx[p], ny[p]);
    const [x1, y1] = rot(nx[i], ny[i]);
    g.parts.push(`M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}`);
    groups.set(key, g);
  }
  const veins = [...groups.values()]
    .sort((g, h) => g.frame - h.frame || h.band - g.band)
    .map((g) => ({
      frame: g.frame,
      width: Math.round(widthOf(Math.min(2 ** g.band, tips[0])) * 100) / 100,
      d: g.parts.join(""),
    }));

  const rotated = poly.map(([x, y]) => rot(x, y));
  const petioleLength = length * 0.12;
  const [px, py] = rot(0, petioleLength);
  const points = [...rotated, [px, py] as [number, number]];
  const pad = maxWidth * 2;
  const bx = Math.min(...points.map((p) => p[0])) - pad;
  const by = Math.min(...points.map((p) => p[1])) - pad;

  return {
    outline: `M${rotated.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z`,
    petiole: `M${f(px)} ${f(py)}L0 0`,
    petioleWidth: Math.round(maxWidth * 100) / 100,
    veins,
    box: {
      x: bx,
      y: by,
      w: Math.max(...points.map((p) => p[0])) + pad - bx,
      h: Math.max(...points.map((p) => p[1])) + pad - by,
    },
    params: {
      D: round(D),
      di: round(di),
      dk: round(dk),
      n: ax.length,
      nodes: nx.length,
      steps: step,
      left: remaining,
    },
  };
}

const round = (n: number) => Math.round(n * 10) / 10;
