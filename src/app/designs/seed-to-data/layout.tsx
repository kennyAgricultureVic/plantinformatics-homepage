import type { ReactNode } from "react";
import { IBM_Plex_Mono, Syne } from "next/font/google";

// Syne carries the narrative headings; Plex Mono labels the pipeline like instrument readouts.
const syne = Syne({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-syne" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });

export default function SeedToDataLayout({ children }: { children: ReactNode }) {
  return <div className={`${syne.variable} ${plexMono.variable} flex flex-1 flex-col`}>{children}</div>;
}
