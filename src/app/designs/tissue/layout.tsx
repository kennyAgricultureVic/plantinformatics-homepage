import type { ReactNode } from "react";
import { Figtree } from "next/font/google";
import "./tissue.css";

// Figtree: a clean geometric sans with open counters, like the labels on a stained slide.
const display = Figtree({ subsets: ["latin"], variable: "--font-tissue" });

export default function TissueLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col font-(family-name:--font-tissue)`}>{children}</div>;
}
