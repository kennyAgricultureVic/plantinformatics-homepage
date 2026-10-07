// Organisation-level copy shared by every design. Edit wording here, not in designs.

import { crops, totalAccessions } from "./data";
import { formatNumber } from "./format";
import { tools } from "./tools";

export const site = {
  name: "Plant Informatics",
  tagline: "Open digital tools and genotype data for the Australian grains industry",
  summary:
    "We are a Victorian Government team supporting the Australian grains industry through open digital tools and genotype data, with the Australian Grains Genebank (AGG) at the centre. As the largest agricultural genotyping effort in the world, we connect AGG data to past, present and future pre-breeding projects.",
  goal: "Bridge the gap between bioinformatics and breeding, so industry can make decisions on data that is easy to access and use.",
  objectives: [
    "Release AGG genotype data publicly, anchored to documented reference assemblies",
    "Build open source tools that make that data explorable without bioinformatics expertise",
    "Keep datasets comparable by remapping markers as new genome assemblies arrive",
  ],
  stats: [
    { value: formatNumber(totalAccessions), label: "Genotypes released publicly" },
    { value: String(crops.length), label: "Crops released" },
    { value: String(tools.length), label: "Open source tools" },
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
