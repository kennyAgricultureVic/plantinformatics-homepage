import type { ReactNode } from "react";
import { Schibsted_Grotesk } from "next/font/google";
import "./superformula.css";

// Schibsted Grotesk: a sturdy newspaper grotesque whose heavy weights hold up at plate size, and
// whose figures stay clear when set small in the parameter tables.
const display = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sf-display" });

export default function SuperformulaLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col font-(family-name:--font-sf-display)`}>{children}</div>;
}
