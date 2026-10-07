import type { Metadata } from "next";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { site } from "@/content";
import { About } from "./_components/about";
import { Colophon } from "./_components/colophon";
import { Data } from "./_components/data";
import { Masthead } from "./_components/masthead";
import { News } from "./_components/news";
import { Tools } from "./_components/tools";

export const metadata: Metadata = { title: `Constructivist poster | ${site.name}` };

// Shortlist leans on Wada's own 1930s poster colours: reds, chrome yellows, deep greens and near blacks.
const shortlist = [190, 313, 298, 221, 216, 232, 251, 155, 247, 340];

// Constructivist poster design: each section is a full-viewport poster printed from the palette,
// with its detail content set in a strict grid on paper underneath.
export default function PosterDesign() {
  return (
    <PaletteProvider design="poster" defaultId={190} shortlist={shortlist} className="bg-[#f1ede4] text-black dark:bg-black dark:text-white">
      <Masthead />
      <main>
        <About />
        <Tools />
        <Data />
        <News />
      </main>
      <Colophon />
      <PalettePicker className="border-t-8 border-current" />
    </PaletteProvider>
  );
}
