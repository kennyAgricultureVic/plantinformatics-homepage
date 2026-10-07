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
  {
    slug: "isometric",
    name: "Isometric station",
    description: "One isometric research station drawn in Hairline lines, with each section a room or plot in the same world.",
  },
  {
    slug: "swiss",
    name: "Swiss grid",
    description: "International Typographic Style: a visible modular grid, one grotesque and a single accent colour per section.",
  },
  {
    slug: "bento",
    name: "Bento",
    description: "The homepage as a grid of mixed-size tiles that expand in place, with Hairline crop figures that wake on hover.",
  },
  {
    slug: "blueprint",
    name: "Blueprint",
    description: "Engineering drawing sheets with title blocks, dimension lines and a parts list of data releases.",
  },
  {
    slug: "riso",
    name: "Risograph zine",
    description: "A small-press zine printed in overprinted palette inks with halftones and misregistration.",
  },
  {
    slug: "zoom",
    name: "Powers of ten",
    description: "One scroll-driven zoom from field trial to plant, seed, cell and DNA.",
  },
  {
    slug: "orbit",
    name: "Orbit",
    description: "A real-time 3D seed orbited by particles for the genotyped accessions, coloured by crop.",
  },
  {
    slug: "exhibit",
    name: "Exhibition",
    description: "A gallery walk where each tool is a Hairline figure on a plinth with a wall placard.",
  },
  {
    slug: "pixel",
    name: "Pixel farm",
    description: "A 16-bit farming world where crop rows grow with accession counts and tools are buildings to visit.",
  },
  {
    slug: "contour",
    name: "Topographic survey",
    description: "A contour map with a hill per data release, its height the accession count, crossed by a waypoint route.",
  },
  {
    slug: "utilitarian",
    name: "Utilitarian",
    description: "Function first: a persistent index, one fixed layout per tool and a sortable data table, colour only where it means something.",
  },
] as const satisfies readonly Design[];
