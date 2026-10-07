// Every design under src/app/designs/<slug>/ gets one entry here so it shows on the index page.

/** Design runs, in the order they appear on the index page. Each plan in `plans/` is one run. */
export const runs = [
  { id: "reference", name: "Reference", description: "The plain layout every design starts from." },
  { id: "first", name: "First run", description: "Ten directions from plans/ten-designs.md." },
  { id: "second", name: "Second run", description: "Eleven styles from plans/eleven-more-designs.md." },
  {
    id: "generative",
    name: "Generative growth",
    description: "Eight designs drawn by a plant growth rule, in the family of Phyllotaxis and L-system field.",
  },
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
    slug: "chromosome",
    name: "Genome browser",
    description: "The page is a genome browser: a chromosome ideogram for navigation and each section drawn as a track.",
    run: "first",
  },
  {
    slug: "poster",
    name: "Constructivist poster",
    description: "Full-viewport posters of flat colour fields, geometric shapes and angled condensed type.",
    run: "first",
  },
  {
    slug: "phyllotaxis",
    name: "Phyllotaxis",
    description: "Generative golden-angle sunflower with one floret per genotyped accession, coloured by crop.",
    run: "first",
  },
  {
    slug: "lsystem",
    name: "L-system field",
    description: "Generative field of wheat and grasses grown from seeded L-system grammars.",
    run: "first",
  },
  {
    slug: "herbarium",
    name: "Herbarium",
    description: "Each tool mounted as a botanical specimen sheet with line drawings and determination labels.",
    run: "first",
  },
  {
    slug: "trial-plots",
    name: "Trial plots",
    description: "Aerial view of a field trial: a squarified treemap of data releases sized by accessions.",
    run: "first",
  },
  {
    slug: "brutal",
    name: "Oversized type",
    description: "Typography as the design, with viewport-wide numbers and palette colour flooding each section.",
    run: "first",
  },
  {
    slug: "seed-to-data",
    name: "Seed to data",
    description: "One sticky diagram follows a seed from the genebank to a breeder's decision as you scroll.",
    run: "first",
  },
  {
    slug: "gazette",
    name: "Gazette",
    description: "A broadsheet front page led by news, with data releases set like a financial table.",
    run: "first",
  },
  {
    slug: "circos",
    name: "Circos",
    description: "A circular Circos plot linking crops, data releases and the tools that serve them.",
    run: "first",
  },
  {
    slug: "isometric",
    name: "Isometric station",
    description: "One isometric research station drawn in Hairline lines, with each section a room or plot in the same world.",
    run: "second",
  },
  {
    slug: "swiss",
    name: "Swiss grid",
    description: "International Typographic Style: a visible modular grid, one grotesque and a single accent colour per section.",
    run: "second",
  },
  {
    slug: "bento",
    name: "Bento",
    description: "The homepage as a grid of mixed-size tiles that expand in place, with Hairline crop figures that wake on hover.",
    run: "second",
  },
  {
    slug: "blueprint",
    name: "Blueprint",
    description: "Engineering drawing sheets with title blocks, dimension lines and a parts list of data releases.",
    run: "second",
  },
  {
    slug: "riso",
    name: "Risograph zine",
    description: "A small-press zine printed in overprinted palette inks with halftones and misregistration.",
    run: "second",
  },
  {
    slug: "zoom",
    name: "Powers of ten",
    description: "One scroll-driven zoom from field trial to plant, seed, cell and DNA.",
    run: "second",
  },
  {
    slug: "orbit",
    name: "Orbit",
    description: "A real-time 3D seed orbited by particles for the genotyped accessions, coloured by crop.",
    run: "second",
  },
  {
    slug: "exhibit",
    name: "Exhibition",
    description: "A gallery walk where each tool is a Hairline figure on a plinth with a wall placard.",
    run: "second",
  },
  {
    slug: "pixel",
    name: "Pixel farm",
    description: "A 16-bit farming world where crop rows grow with accession counts and tools are buildings to visit.",
    run: "second",
  },
  {
    slug: "contour",
    name: "Topographic survey",
    description: "A contour map with a hill per data release, its height the accession count, crossed by a waypoint route.",
    run: "second",
  },
  {
    slug: "utilitarian",
    name: "Utilitarian",
    description: "Function first: a persistent index, one fixed layout per tool and a sortable data table, colour only where it means something.",
    run: "second",
  },
  {
    slug: "venation",
    name: "Leaf venation",
    description: "Leaf veins grown by space colonisation, with vein density set by accession counts.",
    run: "generative",
  },
  {
    slug: "turing",
    name: "Reaction-diffusion",
    description: "Gray-Scott Turing patterns seeded from the data releases, shifting from spots to stripes down the page.",
    run: "generative",
  },
  {
    slug: "roots",
    name: "Root architecture",
    description: "The page grows downward as a branching root system, with one root tip per batch of accessions.",
    run: "generative",
  },
  {
    slug: "tissue",
    name: "Plant tissue",
    description: "A relaxed Voronoi section of plant cells, one cell per batch of accessions, stained in palette colours.",
    run: "generative",
  },
  {
    slug: "fern",
    name: "Fern fractal",
    description: "Iterated function system ferns plotted with one point per genotyped accession.",
    run: "generative",
  },
  {
    slug: "wind",
    name: "Wind over a crop",
    description: "A flow field bending a stand of stems, one per batch of accessions, that answers the pointer.",
    run: "generative",
  },
  {
    slug: "packing",
    name: "Seed packing",
    description: "Hierarchical circle packing of crops and releases, like seeds filling a head.",
    run: "generative",
  },
  {
    slug: "superformula",
    name: "Superformula",
    description: "Gielis superformula outlines whose symmetry and shape come from the data.",
    run: "generative",
  },
] as const satisfies readonly Design[];
