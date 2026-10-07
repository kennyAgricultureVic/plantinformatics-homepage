import type { ReactNode } from "react";
import { Red_Hat_Display } from "next/font/google";
import "./packing.css";

// Red Hat Display: round bowls and tight apertures, a face that already looks packed.
// It carries the whole design, from the hero count down to the captions.
const display = Red_Hat_Display({ subsets: ["latin"], variable: "--font-pk" });

export default function PackingLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col font-(family-name:--font-pk)`}>{children}</div>;
}
