// Tool showcase content, sourced from application-descriptions.md.

export type Tool = {
  slug: string;
  name: string;
  /** One line pitch for compact layouts. */
  summary: string;
  description: string;
  capabilities: readonly string[];
  url: string;
  /** Path under /public. Undefined means no screenshot yet: render <ImagePlaceholder />. */
  image?: string;
};

export const tools = [
  {
    slug: "pretzel",
    name: "Pretzel",
    summary: "Interactive viewer for integrating genetic and genomic datasets in real time.",
    description:
      "Pretzel displays and integrates genetic and genomic datasets in real time. The public AGG Pretzel instance holds every genotype dataset released by the AGG Strategic Partnership, plus curated datasets connecting research and breeding knowledge to the genebank.",
    capabilities: [
      "Aligns genetic maps and chromosome-scale assemblies against each other",
      "Visualises genes, markers and QTLs alongside genotype data",
      "Filters and intersects genotype datasets, and searches for user-defined haplotypes",
      "Upload your own datasets from Excel templates, with group-based sharing",
      "Links to the Crop Ontology API for QTL trait definitions",
    ],
    url: "https://agg.plantinformatics.io/",
  },
  {
    slug: "genolink",
    name: "Genolink",
    summary: "Middleware joining genotype databases with Genesys-PGR passport data.",
    description:
      "Genolink connects genotype databases with Genesys-PGR, the genebank passport data repository, so tools like Pretzel and Fairybread can combine passport and genotype data without duplicating it.",
    capabilities: [
      "Real-time access to up-to-date passport and genotype data, with no sync issues",
      "Filter accessions by passport information or by accession and genotype ID lists",
      "Consolidates retrieval across multiple genomic platforms",
      "Exposes an API other tools build on",
    ],
    url: "https://genolink.plantinformatics.io/",
  },
  {
    slug: "fairybread",
    name: "Fairybread",
    summary: "Explore PCA of crop germplasm collections linked to passport metadata.",
    description:
      "Fairybread combines PCA coordinates with passport metadata sourced from Genesys via Genolink, so users can inspect genetic diversity patterns visually and in tabular form.",
    capabilities: [
      "Interactive PCA scatter plot with lasso selection, zoom and pan",
      "Linked passport table that stays in sync with the plot in both directions",
      "Match a pasted list of accessions against a crop dataset",
      "Wheat, barley, chickpea, field pea, lentil and lupin",
      "Share specific views by URL",
    ],
    url: "https://fairybread.plantinformatics.io/",
    image: "/fairybread.png",
  },
  {
    slug: "brioche",
    name: "Brioche",
    summary: "Pipeline for remapping markers and reanchoring genotypes to new reference genomes.",
    description:
      "Brioche maps genetic markers onto reference genomes and reanchors genotype data as new assemblies become available, bridging existing genotype datasets and the growing number of pangenome assemblies.",
    capabilities: [
      "Remaps markers between reference genomes and reanchors existing genotype calls",
      "Generates in-silico genotype calls for whole reference genomes",
      "Flags markers that map to repetitive or ambiguous regions",
      "Merges independent datasets onto one shared reference",
      "Works across probe capture, DArT and GBS data, for any species",
    ],
    url: "https://github.com/plantinformatics/brioche",
  },
] as const satisfies readonly Tool[];

export type ToolSlug = (typeof tools)[number]["slug"];
