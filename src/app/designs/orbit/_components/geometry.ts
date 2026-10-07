// Shared, three-free geometry for the orbit scene. The WebGL scene and the static SVG
// fallback both read from here, so the fallback is a true still of the same scene.
import { crops, dataReleases, type Crop, type Hex } from "@/content";

/** One particle stands for this many genotyped accessions. */
export const PER_PARTICLE = 1000;

// Small deterministic PRNG so server and client agree on particle placement.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Particle = { angle: number; radius: number; y: number };

export type Cluster = {
  crop: Crop;
  index: number;
  accessions: number;
  /** Current (not superseded) releases for this crop, newest first. */
  releases: (typeof dataReleases)[number][];
  radius: number;
  tiltX: number;
  tiltZ: number;
  /** Radians per second around the cluster's own orbit. */
  speed: number;
  particles: Particle[];
};

const TILT_X = [0.35, -0.3, 0.6, -0.55, 0.12];
const TILT_Z = [0.18, -0.4, -0.12, 0.42, -0.6];

export const clusters: Cluster[] = crops.map((crop, index) => {
  const releases = dataReleases.filter((r) => r.crop === crop && !("superseded" in r));
  const accessions = releases.reduce((sum, r) => sum + r.accessions, 0);
  const count = Math.max(1, Math.round(accessions / PER_PARTICLE));
  const rand = mulberry32(index * 7919 + 17);
  const radius = 2.1 + index * 0.4;
  const spread = Math.min(2.4, 0.25 + count * 0.05);
  const phase = index * 1.37;
  const particles = Array.from({ length: count }, () => ({
    angle: phase + (rand() - 0.5) * spread,
    radius: radius + (rand() - 0.5) * 0.28,
    y: (rand() - 0.5) * 0.22,
  }));
  return {
    crop,
    index,
    accessions,
    releases,
    radius,
    tiltX: TILT_X[index % TILT_X.length],
    tiltZ: TILT_Z[index % TILT_Z.length],
    speed: 0.16 - index * 0.018,
    particles,
  };
});

/** Palette slot for a crop. Four colours, five crops: the fifth is a blend of p1 and p3. */
export const cropCss = (index: number) =>
  index < 4 ? `var(--p${index + 1})` : "color-mix(in srgb, var(--p1), var(--p3))";

const mixHex = (a: Hex, b: Hex): Hex => {
  const ch = (h: Hex, i: number) => parseInt(h.slice(i, i + 2), 16);
  const out = [1, 3, 5].map((i) => Math.round((ch(a, i) + ch(b, i)) / 2).toString(16).padStart(2, "0"));
  return `#${out.join("")}`;
};

export const cropHex = (index: number, colors: readonly [Hex, Hex, Hex, Hex]): Hex =>
  index < 4 ? colors[index] : mixHex(colors[0], colors[2]);

export const RACHIS = { bottom: -1.9, top: 1.2 };

type Vec = [number, number, number];

// Euler XYZ rotation matching three.js: v' = Rx(Ry(Rz v)).
export function rotate([x, y, z]: Vec, rx: number, ry: number, rz: number): Vec {
  let [a, b, c] = [x * Math.cos(rz) - y * Math.sin(rz), x * Math.sin(rz) + y * Math.cos(rz), z];
  [a, c] = [a * Math.cos(ry) + c * Math.sin(ry), -a * Math.sin(ry) + c * Math.cos(ry)];
  [b, c] = [b * Math.cos(rx) - c * Math.sin(rx), b * Math.sin(rx) + c * Math.cos(rx)];
  return [a, b, c];
}

/** Spikelets of the central grain head, two alternating rows up a short rachis. */
export const spikelets = Array.from({ length: 11 }, (_, k) => {
  const side = k % 2 === 0 ? 1 : -1;
  const y = -1.05 + k * 0.2;
  const taper = 1 - Math.abs(k - 4) * 0.06;
  const tilt = side * 0.42;
  const length = 0.26 * taper;
  // Tip of the spikelet, then an awn leaning outward and up.
  const tip = { x: side * 0.15 + Math.sin(tilt) * length, y: y + Math.cos(tilt) * length };
  const awnLen = 0.9 + k * 0.04;
  const awn = { x: tip.x + side * Math.sin(0.28) * awnLen, y: tip.y + Math.cos(0.28) * awnLen };
  // Pairs alternate between facing the camera and facing sideways, so the head reads as 3D from any angle.
  const turn = (Math.floor(k / 2) % 2) * (Math.PI / 2);
  const world = (x: number, py: number) => rotate([x, py, 0], 0, turn, 0);
  return {
    side,
    x: side * 0.15,
    y,
    tilt: -tilt,
    turn,
    scale: [0.13 * taper, length, 0.11 * taper] as const,
    centre3: world(side * 0.15, y),
    tip3: world(tip.x, tip.y),
    awn3: world(awn.x, awn.y),
  };
});

/** World position of a particle with its orbit advanced by `spin` radians. */
export function particleWorld(cluster: Cluster, p: Particle, spin = 0): Vec {
  const a = p.angle + spin;
  return rotate([Math.cos(a) * p.radius, p.y, -Math.sin(a) * p.radius], cluster.tiltX, 0, cluster.tiltZ);
}

/** Point on a cluster's orbit ring. */
export function ringWorld(cluster: Cluster, angle: number): Vec {
  return rotate([Math.cos(angle) * cluster.radius, 0, -Math.sin(angle) * cluster.radius], cluster.tiltX, 0, cluster.tiltZ);
}

/** Camera placement shared by the scene and the static projection. */
export const CAMERA = { position: [0, 1.4, 10.4] as Vec, fov: 38 };
