import type { Metadata } from "next";
import { site } from "@/content";
import { Bento } from "./_components/bento";

export const metadata: Metadata = { title: `Bento | ${site.name}` };

// The homepage as a bento grid: mixed-size tiles that expand in place, with Hairline figures that wake on hover.
export default function BentoDesign() {
  return <Bento />;
}
