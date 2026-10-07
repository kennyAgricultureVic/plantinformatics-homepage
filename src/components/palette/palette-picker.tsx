"use client";

import { ShuffleIcon } from "lucide-react";
import { combinations, getCombination, type Combination } from "@/content";
import { cn } from "@/lib/utils";
import { usePalette } from "./palette-provider";

const describe = (c: Combination) => `Combination ${c.id}: ${c.colors.map((col) => col.name).join(", ")}`;

function Swatch({ combination, active, onSelect }: { combination: Combination; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-label={describe(combination)}
      title={describe(combination)}
      className={cn(
        "flex h-10 w-16 shrink-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-foreground",
        active && "outline-2 outline-foreground",
      )}
    >
      {combination.colors.map((c) => (
        <span key={c.hex} className="h-full flex-1" style={{ background: c.hex }} />
      ))}
    </button>
  );
}

/**
 * Bottom-of-page strip for switching Wada colour combinations. Place it as the last
 * element inside <PaletteProvider>. Restyle the container with className if needed.
 */
export function PalettePicker({ className }: { className?: string }) {
  const { combination, shortlist, setId } = usePalette();

  const shuffle = () => {
    const others = combinations.filter((c) => c.id !== combination.id);
    setId(others[Math.floor(Math.random() * others.length)].id);
  };

  return (
    <section aria-label="Colour palette" className={cn("border-t bg-background text-foreground", className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center">
        <div className="text-sm md:w-64 md:shrink-0">
          <p className="font-medium">Combination {combination.id}</p>
          <p className="text-muted-foreground">{combination.colors.map((c) => c.name).join(", ")}</p>
        </div>
        <div className="flex flex-wrap gap-3 p-1">
          {shortlist.map((id) => (
            <Swatch key={id} combination={getCombination(id)} active={id === combination.id} onSelect={() => setId(id)} />
          ))}
        </div>
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex h-10 shrink-0 items-center gap-2 border px-3 text-sm hover:bg-muted md:ml-auto"
        >
          <ShuffleIcon className="size-4" />
          Random from the dictionary
        </button>
      </div>
      <p className="mx-auto max-w-6xl px-6 pb-6 text-xs text-muted-foreground">
        Colours from Sanzo Wada, A Dictionary of Color Combinations (1933).
      </p>
    </section>
  );
}
