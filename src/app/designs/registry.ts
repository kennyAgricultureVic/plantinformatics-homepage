// Every design under src/app/designs/<slug>/ gets one entry here so it shows on the index page.

export type Design = {
  slug: string;
  name: string;
  /** One sentence on the design direction. */
  description: string;
};

export const designs = [
  {
    slug: "starter",
    name: "Starter",
    description: "Plain reference layout wiring up every section and content export. Copy this to begin a new design.",
  },
] as const satisfies readonly Design[];
