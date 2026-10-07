import type { ReactNode } from "react";
import { Archivo_Narrow, Big_Shoulders } from "next/font/google";

// Heavy condensed grotesque for poster type, cut for display sizes via the optical size axis.
const display = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-poster-display",
});

// Narrow workhorse sans for body copy in the detail grids.
const text = Archivo_Narrow({
  subsets: ["latin"],
  variable: "--font-poster-text",
});

// Scopes the poster fonts to this design. Colour changes ease in so a new palette reads as a reprint.
export default function PosterLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${text.variable} flex min-h-full flex-col font-(family-name:--font-poster-text) [&_*]:transition-[background-color,color,fill,stroke,border-color] [&_*]:duration-500`}
    >
      {children}
    </div>
  );
}
