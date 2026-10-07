import type { ReactNode } from "react";
import { Fraunces } from "next/font/google";
import "./zoom.css";

// Soft, optical-size serif for headings: reads like the captions in a natural history atlas. Upright only.
const display = Fraunces({ subsets: ["latin"], style: "normal", axes: ["opsz", "SOFT"], variable: "--font-zoom-display" });

// Scopes the Powers of ten fonts to this design.
export default function ZoomLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
