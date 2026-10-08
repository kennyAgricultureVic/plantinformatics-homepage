// Every design under src/app/designs/<slug>/ gets one entry here so it shows on the index page.

/**
 * Index page groups, in display order. Every earlier preview (and the run it came from) lives on
 * the `combined-previews` branch.
 */
export const runs = [
  { id: "reference", name: "Reference", description: "The plain layout every design starts from." },
  { id: "candidates", name: "Candidates", description: "The two directions being refined." },
] as const;

export type RunId = (typeof runs)[number]["id"];

export type Design = {
  slug: string;
  name: string;
  /** One sentence on the design direction. */
  description: string;
  run: RunId;
};

export const designs = [
  {
    slug: "starter",
    name: "Starter",
    description: "Plain reference layout wiring up every section and content export. Copy this to begin a new design.",
    run: "reference",
  },
  {
    slug: "lsystem",
    name: "L-system field",
    description: "Generative field of wheat and grasses grown from seeded L-system grammars.",
    run: "candidates",
  },
  {
    slug: "wind",
    name: "Wind over a crop",
    description: "A flow field bending a stand of stems, one per batch of accessions, that answers the pointer.",
    run: "candidates",
  },
] as const satisfies readonly Design[];
