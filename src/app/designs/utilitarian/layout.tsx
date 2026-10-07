import type { ReactNode } from "react";
import "./utilitarian.css";

// No web fonts: the system UI stack is the fastest face there is.
export default function UtilitarianLayout({ children }: { children: ReactNode }) {
  return <div className="utilitarian flex min-h-full flex-col bg-background text-foreground">{children}</div>;
}
