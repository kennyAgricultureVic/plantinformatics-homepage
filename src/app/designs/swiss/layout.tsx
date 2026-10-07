import type { ReactNode } from "react";
import { Inter_Tight } from "next/font/google";

// One grotesque for everything: the point of the International Typographic Style.
const grotesque = Inter_Tight({ subsets: ["latin"], variable: "--font-swiss" });

// Scopes the Swiss font to this design.
export default function SwissLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${grotesque.variable} flex min-h-full flex-col font-(family-name:--font-swiss)`}>{children}</div>
  );
}
