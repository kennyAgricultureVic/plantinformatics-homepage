import type { ReactNode } from "react";
import { JetBrains_Mono, Unbounded } from "next/font/google";

// Wide, round-shouldered display face that echoes the ring geometry.
const display = Unbounded({ subsets: ["latin"], variable: "--font-circos-display" });

// Monospace for plot labels, coordinates and readouts.
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-circos-mono" });

// Scopes the Circos fonts to this design.
export default function CircosLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} ${mono.variable} flex min-h-full flex-col`}>{children}</div>;
}
