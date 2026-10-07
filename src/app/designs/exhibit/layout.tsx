import type { ReactNode } from "react";
import { Instrument_Serif } from "next/font/google";
import "./exhibit.css";

// A quiet, high-contrast serif for wall vinyl and placards. Upright only.
const display = Instrument_Serif({ weight: "400", style: "normal", subsets: ["latin"], variable: "--font-exhibit-display" });

// Scopes the Exhibit font to this design.
export default function ExhibitLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} contents`}>{children}</div>;
}
