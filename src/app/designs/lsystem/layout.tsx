import type { ReactNode } from "react";
import { Antonio, Spline_Sans_Mono } from "next/font/google";
import "./lsystem.css";

// Tall condensed display face reads like a row of stalks; a mono for the grammars.
const display = Antonio({ subsets: ["latin"], variable: "--font-lsys-display" });
const grammar = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-lsys-grammar" });

export default function LsystemLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} ${grammar.variable} contents`}>{children}</div>;
}
