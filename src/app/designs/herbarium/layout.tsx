import type { ReactNode } from "react";
import { Cormorant_Garamond, Courier_Prime, Homemade_Apple } from "next/font/google";

// Herbarium type: a classic old-style serif for determinations, a typewriter for label fields,
// and a collector's hand for pencilled notes. Exposed as --hb-serif, --hb-type and --hb-hand.
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--hb-serif" });
const type = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--hb-type" });
const hand = Homemade_Apple({ subsets: ["latin"], weight: "400", variable: "--hb-hand" });

export default function HerbariumLayout({ children }: { children: ReactNode }) {
  return <div className={`${serif.variable} ${type.variable} ${hand.variable} contents`}>{children}</div>;
}
