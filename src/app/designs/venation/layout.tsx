import type { ReactNode } from "react";
import { Young_Serif } from "next/font/google";
import "./venation.css";

// Young Serif: a soft, heavy old-style serif, like the captions on a botanical plate.
const display = Young_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-ven-display",
});

export default function VenationLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${display.variable} flex min-h-full flex-col`}>
      {children}
    </div>
  );
}
