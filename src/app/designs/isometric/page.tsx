import type { Metadata } from "next";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { site } from "@/content";
import { Station } from "./_components/station";

export const metadata: Metadata = { title: `Isometric station | ${site.name}` };

// One isometric research station drawn in the Hairline line style. Each zone takes one palette colour:
// field plots --p1, lab --p2, seed store --p3, noticeboard --p4.
export default function IsometricDesign() {
  return (
    <PaletteProvider design="isometric" defaultId={300} shortlist={[300, 260, 287, 282, 293, 264, 252, 274, 346]}>
      <Station />
      <PalettePicker />
    </PaletteProvider>
  );
}
