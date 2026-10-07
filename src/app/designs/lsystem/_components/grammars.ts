// The grammars this design grows. Field crops fill the hero; specimens illustrate each tool.

import type { ToolSlug } from "@/content";
import type { Grammar } from "./lsystem";

export const wheat = {
  name: "wheat",
  axiom: "[-S][+S]S",
  rules: {
    S: [
      { p: 0.4, s: "F[+L]FS" },
      { p: 0.4, s: "F[-L]FS" },
      { p: 0.2, s: "FFS" },
    ],
  },
  flower: { S: "H" },
  angle: 9,
  generations: 6,
} as const satisfies Grammar;

export const barley = {
  name: "barley",
  axiom: "[+S]S",
  rules: {
    S: [
      { p: 0.5, s: "F[--L]FS" },
      { p: 0.5, s: "F[++L]FS" },
    ],
  },
  flower: { S: "B" },
  angle: 12,
  generations: 5,
} as const satisfies Grammar;

export const grass = {
  name: "grass",
  axiom: "[--L][++L][-L][+L]X",
  rules: {
    X: [
      { p: 0.5, s: "F[+X]F[-X]FX" },
      { p: 0.25, s: "F[-X]FX" },
      { p: 0.25, s: "F[+X]FX" },
    ],
  },
  flower: { X: "o" },
  angle: 20,
  generations: 4,
} as const satisfies Grammar;

/** Field mix: species and how often each is sown. */
export const fieldCrops = [
  { grammar: wheat, share: 0.5, size: 1 },
  { grammar: barley, share: 0.3, size: 1.05 },
  { grammar: grass, share: 0.2, size: 0.55 },
] as const;

/** One specimen per tool, chosen to echo what the tool does. */
export const specimens = {
  // Pretzel: a twining field pea, all tendrils and knots.
  pretzel: {
    name: "field pea",
    axiom: "A",
    rules: {
      A: [
        { p: 0.45, s: "F[+K][-K]F+A" },
        { p: 0.3, s: "F[-T]F[+K]-A" },
        { p: 0.25, s: "F[+T]F[-K]A" },
      ],
    },
    flower: { A: "[+T][-T]" },
    angle: 28,
    generations: 7,
  },
  // Genolink: a bracketed branching plant, every node a junction.
  genolink: {
    name: "branching weed",
    axiom: "X",
    rules: {
      X: [{ p: 1, s: "F[+X][-X]FX" }],
      F: [
        { p: 0.7, s: "FF" },
        { p: 0.3, s: "F" },
      ],
    },
    flower: { X: "o" },
    angle: 24,
    generations: 5,
  },
  // Fairybread: a lentil whose scattered pods read like a PCA cloud.
  fairybread: {
    name: "lentil",
    axiom: "A",
    rules: {
      A: [
        { p: 0.35, s: "F[+P][-K]A" },
        { p: 0.35, s: "F[-P][+K]A" },
        { p: 0.3, s: "F[+A][-A]" },
      ],
    },
    flower: { A: "P" },
    angle: 34,
    generations: 7,
  },
  // Brioche: a single wheat stem, remapped node by node to its ear.
  brioche: {
    name: "wheat",
    axiom: "S",
    rules: {
      S: [
        { p: 0.5, s: "F[+L]FS" },
        { p: 0.5, s: "F[-L]FS" },
      ],
    },
    flower: { S: "H" },
    angle: 8,
    generations: 6,
  },
} as const satisfies Record<ToolSlug, Grammar>;

/** Human-readable production lines, e.g. "S → F[+L]FS  0.4". */
export const productions = (g: Grammar) => [
  `ω  ${g.axiom}`,
  ...Object.entries(g.rules).flatMap(([sym, options]) =>
    options.map((o) => `${sym} → ${o.s}${options.length > 1 ? `  ${o.p}` : ""}`),
  ),
  ...Object.entries(g.flower).map(([sym, s]) => `${sym} ⇒ ${s}`),
  `δ ${g.angle}°  n ${g.generations}`,
];
