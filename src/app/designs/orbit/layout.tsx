import type { ReactNode } from "react";
import { Space_Grotesk } from "next/font/google";

// Geometric grotesque with a slightly technical edge, suited to a 3D instrument panel.
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-orbit-display" });

// Scopes the Orbit display face to this design. Body text stays on the site default.
export default function OrbitLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} flex min-h-full flex-col`}>{children}</div>;
}
