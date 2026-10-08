"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { WindIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "wind-lines";

const WindLines = createContext<{ on: boolean; toggle: () => void }>({ on: true, toggle: () => {} });

/** Whether the canvases draw their streamlines. Stems are always drawn. */
export const useWindLines = () => useContext(WindLines).on;

export function WindLinesProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(true);

  // Read after mount so the server render and first client render agree.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "off") setOn(false);
    } catch {}
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {}
  };

  return <WindLines value={{ on, toggle }}>{children}</WindLines>;
}

/** Header button that shows or hides the wind lines on every canvas. */
export function WindLinesToggle() {
  const { on, toggle } = useContext(WindLines);
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={on}
      aria-label={on ? "Hide wind lines" : "Show wind lines"}
      title={on ? "Hide wind lines" : "Show wind lines"}
      onClick={toggle}
      className={cn(!on && "text-muted-foreground opacity-50")}
    >
      <WindIcon />
    </Button>
  );
}
