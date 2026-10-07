import type { ReactNode } from "react";
import { Pixelify_Sans } from "next/font/google";
import "./pixel.css";

// Pixel display face, headings only. Body text stays in the site sans.
const display = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixel-display" });

// Scopes the Pixel art farm fonts to this design.
export default function PixelLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
