// The seven pipeline stages the sticky diagram walks through. Shared by the server-rendered
// chapters (markers) and the client diagram (shapes), so their order and colours stay in sync.

export type Slot = 1 | 2 | 3 | 4;

export const stages = [
  { key: "seed", label: "Seed", slot: 1, caption: "Every story starts with a seed in the genebank." },
  { key: "sample", label: "DNA sample", slot: 2, caption: "A seedling is sampled and its DNA extracted." },
  { key: "calls", label: "Genotype calls", slot: 3, caption: "Thousands of markers become genotype calls." },
  { key: "remap", label: "Remapping", slot: 4, caption: "Brioche moves every call onto a newer assembly." },
  { key: "join", label: "Passport join", slot: 1, caption: "Genolink pairs each genotype with its passport." },
  { key: "views", label: "Views", slot: 2, caption: "Pretzel and Fairybread make the diversity visible." },
  { key: "decision", label: "Decision", slot: 3, caption: "A breeder picks the next seeds to sow." },
] as const satisfies readonly { key: string; label: string; slot: Slot; caption: string }[];

export type StageIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** CSS colour for a palette slot, e.g. `var(--p3)`. */
export const slotColor = (slot: Slot) => `var(--p${slot})` as const;

/** Two digit stage number for labels: 0 -> "01". */
export const stageNumber = (i: number) => String(i + 1).padStart(2, "0");
