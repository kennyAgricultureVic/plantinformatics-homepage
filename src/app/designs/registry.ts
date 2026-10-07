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
  {
    slug: "chromosome",
    name: "Genome browser",
    description: "The page is a genome browser: a chromosome ideogram for navigation and each section drawn as a track.",
  },
  {
    slug: "poster",
    name: "Constructivist poster",
    description: "Full-viewport posters of flat colour fields, geometric shapes and angled condensed type.",
  },
  {
    slug: "phyllotaxis",
    name: "Phyllotaxis",
    description: "Generative golden-angle sunflower with one floret per genotyped accession, coloured by crop.",
  },
  {
    slug: "lsystem",
    name: "L-system field",
    description: "Generative field of wheat and grasses grown from seeded L-system grammars.",
  },
  {
    slug: "herbarium",
    name: "Herbarium",
    description: "Each tool mounted as a botanical specimen sheet with line drawings and determination labels.",
  },
  {
    slug: "trial-plots",
    name: "Trial plots",
    description: "Aerial view of a field trial: a squarified treemap of data releases sized by accessions.",
  },
  {
    slug: "brutal",
    name: "Oversized type",
    description: "Typography as the design, with viewport-wide numbers and palette colour flooding each section.",
  },
  {
    slug: "seed-to-data",
    name: "Seed to data",
    description: "One sticky diagram follows a seed from the genebank to a breeder's decision as you scroll.",
  },
  {
    slug: "gazette",
    name: "Gazette",
    description: "A broadsheet front page led by news, with data releases set like a financial table.",
  },
  {
    slug: "circos",
    name: "Circos",
    description: "A circular Circos plot linking crops, data releases and the tools that serve them.",
  },
] as const satisfies readonly Design[];
