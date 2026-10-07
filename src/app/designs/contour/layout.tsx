import type { ReactNode } from "react";
import { Sora } from "next/font/google";

// Geometric sans with open counters, close to the lettering on survey sheets.
const display = Sora({ subsets: ["latin"], variable: "--font-contour-display" });

// Scopes the Topographic survey display face to this design.
export default function ContourLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
