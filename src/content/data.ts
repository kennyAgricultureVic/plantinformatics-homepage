// AGG genotype data releases and the standards behind them, sourced from sample-content.md.

export type Crop = "Wheat" | "Barley" | "Chickpea" | "Field pea" | "Lentil";

export type DataRelease = {
  crop: Crop;
  accessions: number;
  /** Reference assembly the genotypes are anchored against. */
  assembly: string;
  doi: `https://doi.org/${string}`;
  /** ISO date (YYYY-MM-DD). */
  released: string;
  /** Set when a later release of the same crop includes all of these accessions. */
  superseded?: true;
};

export const dataReleases = [
  { crop: "Wheat", accessions: 32_656, assembly: "IWGSC RefSeq v2.1", doi: "https://doi.org/10.7910/DVN/MOBTA8", released: "2026-07-30" },
  { crop: "Barley", accessions: 27_242, assembly: "Morex v3", doi: "https://doi.org/10.7910/DVN/LXU0WD", released: "2026-06-17" },
  { crop: "Field pea", accessions: 5_635, assembly: "Cameor v2", doi: "https://doi.org/10.7910/DVN/A6WGYS", released: "2025-09-08" },
  { crop: "Lentil", accessions: 6_308, assembly: "CDC Redberry (Lcu.2RBY)", doi: "https://doi.org/10.7910/DVN/T0TDAS", released: "2025-08-14" },
  { crop: "Chickpea", accessions: 1_813, assembly: "CDC Frontier gnm3", doi: "https://doi.org/10.7910/DVN/ECQ4NC", released: "2025-08-14" },
  { crop: "Chickpea", accessions: 11_071, assembly: "CDC Frontier gnm3", doi: "https://doi.org/10.7910/DVN/SQFKJW", released: "2025-01-16" },
  { crop: "Wheat", accessions: 12_606, assembly: "IWGSC RefSeq v2.1", doi: "https://doi.org/10.7910/DVN/CRSI0B", released: "2024-08-23", superseded: true },
  { crop: "Barley", accessions: 13_989, assembly: "Morex v3", doi: "https://doi.org/10.7910/DVN/H6SNVM", released: "2024-08-15", superseded: true },
] as const satisfies readonly DataRelease[];

/** Unique accessions across all releases, for headline stats. Skips superseded releases so nothing is counted twice. */
export const totalAccessions = dataReleases.reduce((sum, r) => ("superseded" in r ? sum : sum + r.accessions), 0);

/** Crops with at least one release. */
export const crops = [...new Set(dataReleases.map((r) => r.crop))];

/** Marker mappings and in-silico calls that keep datasets comparable across assemblies. */
export const standards = [
  {
    name: "Wheat Barley Infinium 40k BeadChip",
    detail: "Marker positions remapped with Brioche v2 to IWGSC RefSeq v1.0, IWGSC RefSeq v2.1 and Morex v3.",
  },
  {
    name: "10+ Wheat Genomes",
    detail: "In-silico genotype calls for the Walkowiak et al. 2020 assemblies using Brioche v2, with de novo gene annotations (White et al. 2024).",
  },
  {
    name: "Barley Pangenome v2",
    detail: "In-silico genotype calls for the Jayakodi et al. 2024 assemblies using Brioche v2.",
  },
  {
    name: "Wheat stripe rust meta QTLs",
    detail: "QTLs from Tong et al. 2024 and Micheni et al. 2026 on IWGSC RefSeq v2.1.",
  },
] as const;
