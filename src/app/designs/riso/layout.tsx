import type { ReactNode } from "react";
import { Dela_Gothic_One } from "next/font/google";
import "./riso.css";

// Heavy, slightly blobby gothic that looks right pushed through a stencil drum.
const display = Dela_Gothic_One({ weight: "400", subsets: ["latin"], variable: "--font-riso-display" });

// Scopes the Risograph font, paper and ink variables to this design.
export default function RisoLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} riso flex min-h-full flex-1 flex-col bg-white text-black dark:bg-black dark:text-white`}>{children}</div>;
}
