import type { ReactNode } from "react";
import { Bricolage_Grotesque, Space_Mono } from "next/font/google";

// Condensed, extra bold grotesque for the giant type (width axis pulled in via font-variation-settings).
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth", "opsz"],
  variable: "--font-brutal-display",
});

// Monospace for labels, indices and metadata.
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-brutal-mono",
});

// Scopes the brutal fonts to this design only.
export default function BrutalLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} ${mono.variable} flex min-h-full flex-col font-(family-name:--font-brutal-display)`}>
      {children}
    </div>
  );
}
