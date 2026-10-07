import type { ReactNode } from "react";
import { Bodoni_Moda, DM_Mono } from "next/font/google";

// Bodoni for the display face: Didone contrast reads like an engraved mathematical plate.
// DM Mono carries the numbers, coordinates and labels.
const display = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-phyllo-display",
});

const mono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-phyllo-mono",
});

export default function PhyllotaxisLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} ${mono.variable} flex min-h-full flex-col`}>{children}</div>;
}
