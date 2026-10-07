// News and updates, newest first. Sourced from sample-content.md.

export type NewsKind = "tool" | "data";

export type NewsItem = {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  kind: NewsKind;
  title: string;
  body: string;
};

export const news = [
  {
    date: "2026-08-10",
    kind: "data",
    title: "Wheat stripe rust meta QTLs",
    body: "Added wheat stripe rust QTLs from Tong et al. 2024 and Micheni et al. 2026 on IWGSC RefSeq v2.1.",
  },
  {
    date: "2026-07-30",
    kind: "data",
    title: "32,656 wheat accessions genotyped",
    body: "Added genotypes for 32,656 wheat AGG accessions, updated in-silico calls for the 10+ Wheat Genomes using Brioche v2, and remapped the Wheat Barley 40k BeadChip to IWGSC RefSeq v2.1 and v1.0.",
  },
  {
    date: "2026-06-17",
    kind: "tool",
    title: "Pretzel v3.11.0",
    body: "Display and filter null alleles in genotype data. Also loaded 27,242 barley AGG accessions, in-silico calls for Barley Pangenome v2, and 40k BeadChip positions on Morex v3.",
  },
  {
    date: "2025-09-08",
    kind: "data",
    title: "5,635 field pea accessions genotyped",
    body: "Added genotypes for 5,635 field pea AGG accessions anchored against the Cameor v2 assembly.",
  },
  {
    date: "2025-08-14",
    kind: "data",
    title: "Lentil and chickpea releases",
    body: "Added 6,308 lentil accessions on CDC Redberry and a further 1,813 chickpea accessions on CDC Frontier gnm3.",
  },
  {
    date: "2025-07-25",
    kind: "tool",
    title: "Pretzel v3.9.0",
    body: "Deeper integration of passport data via Genolink.",
  },
  {
    date: "2025-05-25",
    kind: "tool",
    title: "Pretzel v3.8.0",
    body: "New features and fixes, documented in the release notes.",
  },
  {
    date: "2025-04-30",
    kind: "tool",
    title: "Pretzel v3.7.3: haplotype search",
    body: "Search genotype data for accessions carrying user-defined haplotypes.",
  },
  {
    date: "2025-01-16",
    kind: "data",
    title: "11,071 chickpea accessions genotyped",
    body: "Added genotypes for 11,071 chickpea AGG accessions anchored against CDC Frontier gnm3.",
  },
  {
    date: "2024-11-01",
    kind: "data",
    title: "10+ Wheat Genomes",
    body: "Added the 10+ Wheat Genomes from Walkowiak et al. 2020, with de novo gene annotations (White et al. 2024) and Wheat Barley 40k v1.1 mappings.",
  },
  {
    date: "2024-10-23",
    kind: "tool",
    title: "Pretzel v3.0.0",
    body: "VCF Search use case and a range of improvements.",
  },
  {
    date: "2024-08-23",
    kind: "data",
    title: "12,606 hexaploid wheat accessions genotyped",
    body: "Added genotypes anchored against IWGSC RefSeq v2.1.",
  },
  {
    date: "2024-08-15",
    kind: "data",
    title: "13,989 barley accessions genotyped",
    body: "Added genotypes anchored against Morex v3.",
  },
] as const satisfies readonly NewsItem[];
