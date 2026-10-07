import type { ReactNode } from "react";
import { Darker_Grotesque } from "next/font/google";

// Darker Grotesque: a tight, low-slung grotesque whose heavy weights read like the dark
// activator stripes, and whose light weights sit back like the substrate between them.
const display = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--font-turing-display",
});

export default function TuringLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
