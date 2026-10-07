import type { ReactNode } from "react";
import { Outfit } from "next/font/google";
import "./isometric.css";

// Geometric sans with round bowls, close to the even single-stroke weight of the Hairline drawings.
const display = Outfit({ subsets: ["latin"], variable: "--font-iso-display" });

// Scopes the Isometric station font to this design.
export default function IsometricLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
