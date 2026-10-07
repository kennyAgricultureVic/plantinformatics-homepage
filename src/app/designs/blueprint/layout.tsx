import type { ReactNode } from "react";
import { Saira_Condensed } from "next/font/google";

// Narrow engineering-lettering face for headings, title blocks and dimension text.
const display = Saira_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-blueprint-display",
});

// Scopes the Blueprint font to this design.
export default function BlueprintLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
