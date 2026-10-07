import type { ReactNode } from "react";
import { Gloock } from "next/font/google";
import "./fern.css";

// Gloock: a high-contrast engraved serif, set large like the caption of a botanical plate.
const display = Gloock({ subsets: ["latin"], weight: "400", variable: "--font-fern-display" });

export default function FernLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} contents`}>{children}</div>;
}
