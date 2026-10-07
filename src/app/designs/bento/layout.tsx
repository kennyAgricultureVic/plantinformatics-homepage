import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./bento.css";

// Rounded geometric grotesque with tight figures: suits big dashboard numbers on tiles.
const display = Manrope({ subsets: ["latin"], variable: "--font-bento-display" });

// Scopes the Bento font to this design.
export default function BentoLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
