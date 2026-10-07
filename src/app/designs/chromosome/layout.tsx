import type { ReactNode } from "react";
import { IBM_Plex_Sans, Martian_Mono } from "next/font/google";

// Martian Mono carries the genome browser voice (track names, coordinates, headlines);
// IBM Plex Sans keeps longer reading copy calm.
const martian = Martian_Mono({ variable: "--font-martian", subsets: ["latin"] });
const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"] });

export default function ChromosomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${martian.variable} ${plex.variable} flex min-h-full flex-1 flex-col font-(family-name:--font-plex)`}>
      {children}
    </div>
  );
}
