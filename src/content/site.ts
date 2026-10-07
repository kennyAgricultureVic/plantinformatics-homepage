// Organisation-level copy shared by every design. Edit wording here, not in designs.

export const site = {
  name: "Plant Informatics",
  tagline: "Open digital tools and genotype data for the Australian grains industry",
  summary:
    "We are a state government team supporting the Australian grains industry through digital tools and genotype data, with the Australian Grains Genebank (AGG) at the centre. Our integrated tool ecosystem and shared data standard connect AGG data to past, present and future pre-breeding projects.",
  goal: "Bridge the gap between bioinformatics and breeding, so industry can make decisions on data that is easy to access and use.",
  objectives: [
    "Release AGG genotype data publicly, anchored to documented reference assemblies",
    "Build open source tools that make that data explorable without bioinformatics expertise",
    "Keep datasets interoperable through a shared data standard and remapping as new genomes arrive",
  ],
  stats: [
    { value: "80,000+", label: "Genotypes released publicly" },
    { value: "6", label: "Crops covered" },
    { value: "4", label: "Open tools" },
  ],
  github: "https://github.com/plantinformatics",
} as const;

/**
 * Canonical section anchors. Every design should render these ids so links like
 * `/designs/foo#tools` work the same across designs.
 */
export const sections = [
  { id: "about", label: "About" },
  { id: "tools", label: "Tools" },
  { id: "data", label: "Data" },
  { id: "news", label: "News" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const funding = {
  // TODO: confirm exact funding acknowledgement wording and partner list with the team.
  acknowledgement:
    "This work is supported by the Australian Grains Genebank Strategic Partnership, a joint investment between Agriculture Victoria and the Grains Research and Development Corporation (GRDC).",
  partners: ["Agriculture Victoria", "Grains Research and Development Corporation", "Australian Grains Genebank"],
} as const;
