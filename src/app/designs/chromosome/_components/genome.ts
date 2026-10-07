import { sections, totalAccessions, type SectionId } from "@/content";

/**
 * The page is drawn as one chromosome, "chrPI", whose length is the number of genotypes released.
 * Each section owns an equal quarter of it, so rulers, the ideogram and the locus readout agree.
 */
export const chromosomeLength = totalAccessions;

const quarter = chromosomeLength / sections.length;

/** Cytoband name, palette slot and coordinate range for every section, in page order. */
export const bands = sections.map((s, i) => ({
  ...s,
  band: i < 2 ? `p${2 - i}` : `q${i - 1}`,
  color: paletteVar(i),
  start: Math.round(i * quarter) + 1,
  end: Math.round((i + 1) * quarter),
}));

export const bandFor = (id: SectionId) => bands.find((b) => b.id === id) ?? bands[0];

/** `var(--p1)`..`var(--p4)`, cycling, for inline styles where Tailwind classes cannot be dynamic. */
export function paletteVar(i: number) {
  return `var(--p${(i % 4) + 1})`;
}

/** Palette colour thinned toward transparent, for fills that sit behind text. */
export const tint = (color: string, percent: number) => `color-mix(in oklab, ${color} ${percent}%, transparent)`;

/** Small seeded PRNG (mulberry32) so drawn signals are identical on server and client. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
