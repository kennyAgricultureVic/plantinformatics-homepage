import type { ReactNode } from "react";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  Martian_Mono,
} from "next/font/google";

const display = Bricolage_Grotesque({
  variable: "--tp-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});
const mono = Martian_Mono({ variable: "--tp-mono", subsets: ["latin"] });
const sans = Instrument_Sans({ variable: "--tp-sans", subsets: ["latin"] });

/**
 * Loads the trial-plots fonts and repaints the page tokens: field-book paper in light mode,
 * true black in dark. Overriding --background here also restyles the shared picker and toggle.
 */
export default function TrialPlotsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${display.variable} ${mono.variable} ${sans.variable} flex min-h-full flex-1 flex-col bg-background font-(family-name:--tp-sans) text-foreground [--background:#f1ede2] [--border:rgb(21_20_15/0.2)] [--foreground:#15140f] dark:[--background:#000] dark:[--border:rgb(255_255_255/0.22)] dark:[--foreground:#fff]`}
    >
      {children}
    </div>
  );
}
