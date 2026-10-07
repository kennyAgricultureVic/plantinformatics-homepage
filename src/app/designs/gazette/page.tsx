import type { Metadata } from "next";
import Link from "next/link";
import { PalettePicker, PaletteProvider } from "@/components/palette";
import { funding, site } from "@/content";
import { Briefs } from "./_components/briefs";
import { Classifieds } from "./_components/classifieds";
import { edition, font, furniture } from "./_components/edition";
import { FrontPage } from "./_components/front-page";
import { Markets } from "./_components/markets";
import { Masthead } from "./_components/masthead";

export const metadata: Metadata = { title: `Gazette | ${site.name}` };

// Spot colours that print well on both newsprint and black: reds, a green, a blue, an ochre.
const shortlist = [117, 39, 1, 257, 155, 15, 143, 85] as const;

// Broadsheet newspaper. Ink and paper are fixed; the palette's first colour is the single
// spot ink, used for the nameplate, heavy rules, drop caps and halftone screens.
export default function GazetteDesign() {
  return (
    <PaletteProvider
      design="gazette"
      defaultId={shortlist[0]}
      shortlist={shortlist}
      className={`${font.text} flex-1 bg-(--paper) text-(--ink) selection:bg-(--p1) selection:text-(--p1-fg) [--ink:#16130f] [--paper:#f5f1e8] dark:[--ink:#fff] dark:[--paper:#000]`}
    >
      <div className="mx-auto w-full max-w-[84rem] px-4 sm:px-6 lg:px-10">
        <Masthead />
        <main>
          <FrontPage />
          <Briefs />
          <Markets />
          <Classifieds />
        </main>
        <Colophon />
      </div>
      <PalettePicker className="border-(--ink) bg-(--paper) text-(--ink)" />
    </PaletteProvider>
  );
}

// Imprint at the foot of the back page, carrying the funding acknowledgement.
function Colophon() {
  return (
    <footer className="mt-6 pb-10">
      <div className="h-1.5 bg-(--p1)" />
      <div className="mt-0.5 border-b border-(--ink)" />
      <div className="grid gap-6 py-6 md:grid-cols-[auto_1fr] md:gap-10">
        <p className={`${font.blackletter} text-4xl leading-none text-(--p1)`}>{site.name}</p>
        <div>
          <p className={`${furniture}`}>Printed with the support of</p>
          <p className="mt-2 max-w-3xl text-lg leading-snug">{funding.acknowledgement}</p>
          <p className={`${font.headline} mt-3 font-bold`}>
            {funding.partners.map((p, i) => (
              <span key={p}>
                {i > 0 && <span className="px-2 text-(--p1)">■</span>}
                {p}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className={`${furniture} flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-(--ink) pt-2`}>
        <span>
          Vol. {edition.volume} · No. {edition.number} · {edition.dateline}
        </span>
        <a href={site.github} className="hover:text-(--p1)">
          Source on GitHub
        </a>
        <Link href="/" className="hover:text-(--p1)">
          All designs
        </Link>
      </div>
    </footer>
  );
}
