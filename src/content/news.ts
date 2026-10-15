// News and updates, newest first. Tool releases come from the GitHub releases of
// Pretzel, Fairybread, Brioche and Genolink, dated by when each was published.
// Only the first release of each minor version (1.2.0, 1.3.0); later patches are left out.

export type NewsKind = "tool" | "data";

export type NewsItem = {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  kind: NewsKind;
  title: string;
  body: string;
  /** Release notes, for tool releases. */
  url?: string;
};

const gh = "https://github.com/plantinformatics";

export const news = [
  {
    date: "2026-10-15",
    kind: "tool",
    title: "Genolink v1.6.0",
    body: "Brings together v1.2 to v1.6: works on phones and tablets, adds pedigree, MLS status and every alias to passport data, advanced name and alias search, a historical accessions filter, multiple dataset DOIs per accession, and a resizable Genotype Explorer.",
    url: `${gh}/genolink/releases/tag/v1.6.0`,
  },
  {
    date: "2026-08-10",
    kind: "data",
    title: "Wheat stripe rust meta QTLs",
    body: "Added wheat stripe rust QTLs from Tong et al. 2024 and Micheni et al. 2026 on IWGSC RefSeq v2.1.",
  },
  {
    date: "2026-08-10",
    kind: "tool",
    title: "Fairybread v1.4.0",
    body: "Variance explained on the PCA axes, table rows coloured to match the plot, crop subsets such as wheat without synthetics, and CSV export with column selection.",
    url: `${gh}/fairybread/releases/tag/v1.4.0`,
  },
  {
    date: "2026-07-30",
    kind: "data",
    title: "32,656 wheat accessions genotyped",
    body: "Added genotypes for 32,656 wheat AGG accessions, updated in-silico calls for the 10+ Wheat Genomes using Brioche v2, and remapped the Wheat Barley 40k BeadChip to IWGSC RefSeq v2.1 and v1.0.",
  },
  {
    date: "2026-07-29",
    kind: "tool",
    title: "Genolink v1.1.1",
    body: "Shows which subsets each accession belongs to in results and exports, and fixes resetting the subset filter.",
    url: `${gh}/genolink/releases/tag/v1.1.1`,
  },
  {
    date: "2026-07-21",
    kind: "tool",
    title: "Genolink v1.0.0",
    body: "First release. Search Genesys passport data and retrieve genotypes for the selected accessions from one or more Gigwa servers.",
    url: `${gh}/genolink/releases/tag/v1.0.0`,
  },
  {
    date: "2026-06-19",
    kind: "tool",
    title: "Pretzel v3.11.0",
    body: "Display, sort and search accessions by null genotypes. Also SVG export to the clipboard, exact-match feature search with up to 500 results, and password strength checks.",
    url: `${gh}/pretzel/releases/tag/v3.11.0`,
  },
  {
    date: "2026-06-17",
    kind: "data",
    title: "27,242 barley accessions genotyped",
    body: "Added genotypes for 27,242 barley AGG accessions, in-silico calls for Barley Pangenome v2, and 40k BeadChip positions on Morex v3.",
  },
  {
    date: "2026-05-11",
    kind: "tool",
    title: "Fairybread v1.3.0",
    body: "Choose which principal components to plot, and add a third for a 3D view.",
    url: `${gh}/fairybread/releases/tag/v1.3.0`,
  },
  {
    date: "2026-05-04",
    kind: "tool",
    title: "Fairybread v1.2.0",
    body: "Biological status from Genolink passport data, passport fetching moved to an API route, and the latest barley release.",
    url: `${gh}/fairybread/releases/tag/1.2.0`,
  },
  {
    date: "2026-04-28",
    kind: "tool",
    title: "Brioche v2.0.0",
    body: "Anchors genotype matrices, VCFs and DArT reports to a chosen reference as a standard VCF, tracks null and multi-allelic states, accepts priors files, and writes an HTML summary report. Comes with a full user guide.",
    url: `${gh}/brioche/releases/tag/v2.0.0`,
  },
  {
    date: "2026-04-24",
    kind: "tool",
    title: "Fairybread v1.1.0",
    body: "Paste in a custom list of accessions to match and filter by, and pick the plot palette on a new settings page.",
    url: `${gh}/fairybread/releases/tag/v1.1.0`,
  },
  {
    date: "2026-03-30",
    kind: "tool",
    title: "Fairybread v1.0.0",
    body: "First release. Explore PCA plots linked to a passport data table, with filtering, grouping and dark mode.",
    url: `${gh}/fairybread/releases/tag/1.0.0`,
  },
  {
    date: "2025-11-28",
    kind: "tool",
    title: "Pretzel v3.10.0",
    body: "A passport table for filtering and selecting accessions by Genolink passport fields, and links in dataset metadata.",
    url: `${gh}/pretzel/releases/tag/v3.10.0`,
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
    body: "Added 6,308 lentil accessions on CDC Redberry, and an updated chickpea release of 12,884 accessions on CDC Frontier gnm3 that adds 1,813 to the January release.",
  },
  {
    date: "2025-07-24",
    kind: "tool",
    title: "Pretzel v3.9.0",
    body: "Genolink and Genesys passport data in the Genotype Table headers, with sorting and grouping of accessions by passport fields.",
    url: `${gh}/pretzel/releases/tag/v3.9.0`,
  },
  {
    date: "2025-06-24",
    kind: "tool",
    title: "Pretzel v3.8.0",
    body: "Changes from AGG working group and workshop feedback: partial-name feature search, heterozygous genotype matching, and opening Genolink with the selected accessions.",
    url: `${gh}/pretzel/releases/tag/v3.8.0`,
  },
  {
    date: "2025-03-31",
    kind: "tool",
    title: "Pretzel v3.7.0",
    body: "Search genotype data for accessions carrying a defined haplotype across multiple chromosomes, plus documentation links in the interface.",
    url: `${gh}/pretzel/releases/tag/v3.7.0`,
  },
  {
    date: "2025-03-31",
    kind: "tool",
    title: "Pretzel v3.6.0",
    body: "Search samples by their genotype at selected SNPs, and VCF download is back.",
    url: `${gh}/pretzel/releases/tag/v3.6.0`,
  },
  {
    date: "2025-02-27",
    kind: "tool",
    title: "Pretzel v3.5.0",
    body: "Dataset collections: datasets grouped into crop tabs in the Dataset Explorer, with category filters and a CSV report of all datasets.",
    url: `${gh}/pretzel/releases/tag/v3.5.0`,
  },
  {
    date: "2025-01-16",
    kind: "data",
    title: "11,071 chickpea accessions genotyped",
    body: "Added genotypes for 11,071 chickpea AGG accessions anchored against CDC Frontier gnm3.",
  },
  {
    date: "2025-01-15",
    kind: "tool",
    title: "Pretzel v3.4.0",
    body: "Clearer search feedback with loading and no-result messages, help links, and a reorganised BLAST search form.",
    url: `${gh}/pretzel/releases/tag/v3.4.0`,
  },
  {
    date: "2025-01-15",
    kind: "tool",
    title: "Pretzel v3.3.0",
    body: "Usability improvements to the left panel, the Dataset Explorer and VCF genotype search.",
    url: `${gh}/pretzel/releases/tag/v3.3.0`,
  },
  {
    date: "2025-01-15",
    kind: "tool",
    title: "Pretzel v3.2.0",
    body: "An updated Germinate connection.",
    url: `${gh}/pretzel/releases/tag/v3.2.0`,
  },
  {
    date: "2025-01-15",
    kind: "tool",
    title: "Pretzel v3.1.0",
    body: "Fixes for issues reported after v3.0.0, including unpredictable BLAST results.",
    url: `${gh}/pretzel/releases/tag/v3.1.0`,
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
    body: "An upgraded frontend, genotype search by dataset, SNP names and samples, BrAPI additions, and single-command install with docker compose.",
    url: `${gh}/pretzel/releases/tag/v3.0.0`,
  },
  {
    date: "2024-10-14",
    kind: "tool",
    title: "Brioche v1.0.0",
    body: "First release of the pipeline for remapping markers and reanchoring genotypes to new reference genomes.",
    url: `${gh}/brioche/releases/tag/v1.0.0`,
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
  {
    date: "2021-08-30",
    kind: "tool",
    title: "Pretzel v2.10.0",
    body: "Displays synteny blocks.",
    url: `${gh}/pretzel/releases/tag/v2.10.0`,
  },
  {
    date: "2021-06-25",
    kind: "tool",
    title: "Pretzel v2.8.0",
    body: "DNA sequence search with BLAST, and a persistent server request cache.",
    url: `${gh}/pretzel/releases/tag/v2.8.0`,
  },
  {
    date: "2020-05-12",
    kind: "tool",
    title: "Pretzel v2.1.0",
    body: "Axis tracks show the detail of sub-elements, DAWN JBrowse joins external lookup, and axis zoom is kept in the URL.",
    url: `${gh}/pretzel/releases/tag/v2.1.0`,
  },
  {
    date: "2020-03-13",
    kind: "tool",
    title: "Pretzel v2.0",
    body: "Tracks drawn as rectangles within split axes, loaded progressively.",
    url: `${gh}/pretzel/releases/tag/v2.0`,
  },
  {
    date: "2020-01-13",
    kind: "tool",
    title: "Pretzel v1.2.0",
    body: "Progressive loading for large datasets, hierarchical dataset browsing with feature search, and mouse-wheel zoom and pan.",
    url: `${gh}/pretzel/releases/tag/v1.2.0_release`,
  },
] as const satisfies readonly NewsItem[];
