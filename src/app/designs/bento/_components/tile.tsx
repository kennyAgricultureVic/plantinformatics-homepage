"use client";

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useRef,
  useState,
  ViewTransition,
  type CSSProperties,
  type ReactNode,
} from "react";
import { XIcon } from "lucide-react";
import { Hairline, type HairlineFigureName } from "@/components/hairline";
import { cn } from "@/lib/utils";

type BoardValue = { open: string | null; toggle: (id: string) => void };

const Board = createContext<BoardValue>({ open: null, toggle: () => {} });

/** Holds which single tile is expanded. Toggling runs in a transition so <ViewTransition> animates the reflow. */
export function BentoBoard({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (id: string) => startTransition(() => setOpen((cur) => (cur === id ? null : id)));
  return <Board value={{ open, toggle }}>{children}</Board>;
}

/** Palette slot used as the tile's ground (light) or border (dark). 0 is a plain, unflooded tile. */
export type Tone = 0 | 1 | 2 | 3 | 4;

const toneStyle = (tone: Tone) =>
  (tone === 0
    ? { "--tone": "var(--background)", "--tone-fg": "var(--foreground)" }
    : { "--tone": `var(--p${tone})`, "--tone-fg": `var(--p${tone}-fg)` }) as CSSProperties;

type TileProps = {
  id: string;
  tone: Tone;
  /** Grid span classes while collapsed, e.g. "lg:col-span-2 row-span-2". Expanded tiles span the full row. */
  span?: string;
  /** Accessible name for the expand control. Omit for a tile that does not expand. */
  label?: string;
  /** Hairline figure that wakes (raises its intensity) while the tile is hovered, focused or open. */
  figure?: HairlineFigureName;
  className?: string;
  children: (state: { open: boolean; figure: ReactNode }) => ReactNode;
};

export function Tile({ id, tone, span, label, figure, className, children }: TileProps) {
  const { open: openId, toggle } = useContext(Board);
  const open = openId === id;
  const [awake, setAwake] = useState(false);
  const [readout, setReadout] = useState("");
  const openRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(open);

  // Move focus with the expansion so keyboard users land in the content, and back out on close.
  useEffect(() => {
    if (open === wasOpen.current) return;
    wasOpen.current = open;
    (open ? closeRef : openRef).current?.focus({ preventScroll: false });
  }, [open]);

  const art = figure ? (
    <figure className="w-full">
      <Hairline figure={figure} intensity={open ? 0.9 : awake ? 0.8 : 0.15} onRead={setReadout} />
      <figcaption className="bento-muted mt-1 h-4 text-right text-xs" aria-hidden>
        {awake || open ? readout : ""}
      </figcaption>
    </figure>
  ) : null;

  return (
    <ViewTransition name={`bento-${id}`} default="bento-tile">
      <article
        style={toneStyle(tone)}
        onPointerEnter={() => setAwake(true)}
        onPointerLeave={() => setAwake(false)}
        onFocus={() => setAwake(true)}
        onBlur={() => setAwake(false)}
        onKeyDown={(e) => {
          if (open && e.key === "Escape") toggle(id);
        }}
        className={cn(
          "bento-tile relative flex flex-col overflow-hidden rounded-2xl p-5 sm:p-6",
          tone === 0 && "bento-plain",
          open ? "col-span-full" : span,
          label && !open && "cursor-pointer transition-[filter] hover:brightness-[1.04] dark:hover:brightness-125",
          className,
        )}
      >
        {label && !open && (
          <button
            ref={openRef}
            type="button"
            aria-expanded={false}
            aria-label={`Open ${label}`}
            onClick={() => toggle(id)}
            className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-(--f) focus-visible:ring-inset"
          />
        )}
        {label && open && (
          <button
            ref={closeRef}
            type="button"
            aria-expanded
            aria-label={`Close ${label}`}
            onClick={() => toggle(id)}
            className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-md border bento-rule hover:bg-(--f) hover:text-(--g) focus-visible:ring-3 focus-visible:ring-(--f) focus-visible:outline-none"
          >
            <XIcon className="size-4" />
          </button>
        )}
        {children({ open, figure: art })}
      </article>
    </ViewTransition>
  );
}
