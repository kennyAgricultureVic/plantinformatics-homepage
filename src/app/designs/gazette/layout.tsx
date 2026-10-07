import type { ReactNode } from "react";
import { Libre_Franklin, Newsreader, Playfair_Display, UnifrakturMaguntia } from "next/font/google";

// Nameplate: blackletter, the classic broadsheet masthead.
const blackletter = UnifrakturMaguntia({ weight: "400", subsets: ["latin"], variable: "--font-gz-blackletter" });
// Headlines: high contrast display serif, set heavy.
const headline = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-gz-headline" });
// Body copy: a serif drawn for news text.
const text = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-gz-text" });
// Kickers, tables and furniture: a Franklin Gothic style sans.
const label = Libre_Franklin({ subsets: ["latin"], variable: "--font-gz-label" });

// Loads the Gazette fonts as CSS variables. `contents` keeps the root flex layout untouched.
export default function GazetteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`contents ${blackletter.variable} ${headline.variable} ${text.variable} ${label.variable}`}>{children}</div>
  );
}
