import type { ReactNode } from "react";
import { Spectral } from "next/font/google";
import "./roots.css";

// Spectral: a screen serif with sharp, root-like serifs, set like a botanical plate.
const display = Spectral({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-roots",
});

export default function RootsLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} contents`}>{children}</div>;
}
