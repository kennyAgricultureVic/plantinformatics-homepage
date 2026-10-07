"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { tools } from "@/content";
import { cn } from "@/lib/utils";
import { rule } from "./flood-section";
import { display, mono } from "./type";

type ToolEntry = (typeof tools)[number];

// Screenshot when one exists, otherwise a typographic stand-in: the initial, huge and outlined.
function ToolImage({ tool }: { tool: ToolEntry }) {
  if ("image" in tool) {
    return (
      <Image
        src={tool.image}
        alt={`${tool.name} screenshot`}
        width={1421}
        height={876}
        className={cn("w-full border-2", rule)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${tool.name} screenshot placeholder`}
      className={cn("@container relative flex aspect-[16/10] items-end overflow-hidden border-2 p-3", rule)}
    >
      <span
        aria-hidden
        className={cn(
          display,
          "absolute -top-[0.12em] right-[0.04em] text-[length:78cqw] leading-none dark:text-(--flood)",
        )}
      >
        {tool.name[0]}
      </span>
      <span className={cn(mono, "relative text-xs uppercase")}>Screenshot to come</span>
    </div>
  );
}

// Description, capabilities and link for the selected tool.
function ToolDetail({ tool }: { tool: ToolEntry }) {
  return (
    <div className="grid gap-6">
      <ToolImage tool={tool} />
      <p className="text-xl leading-snug font-medium sm:text-2xl">{tool.description}</p>
      <ul className={cn("border-t-2", rule)}>
        {tool.capabilities.map((c, i) => (
          <li key={c} className={cn(mono, "grid grid-cols-[2.5rem_1fr] border-b-2 py-2 text-sm", rule)}>
            <span className="font-bold">{String(i + 1).padStart(2, "0")}</span>
            {c}
          </li>
        ))}
      </ul>
      <a
        href={tool.url}
        className={cn(
          display,
          "inline-flex items-center justify-between gap-2 border-2 px-4 py-3 text-3xl",
          "hover:bg-(--ink) hover:text-(--flood) dark:border-(--flood) dark:hover:bg-(--flood) dark:hover:text-black",
          rule,
        )}
      >
        Open {tool.name}
        <ArrowUpRightIcon className="size-8" strokeWidth={3} />
      </a>
    </div>
  );
}

/**
 * Huge list of tool names. Hovering, focusing or tapping a name inverts it and swaps its
 * details into the sticky panel on desktop, or opens them inline under the name on small screens.
 */
export function ToolIndex() {
  const [active, setActive] = useState(0);

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <ol className={cn("@container border-t-2", rule)}>
        {tools.map((tool, i) => {
          const on = i === active;
          return (
            <li key={tool.slug} className={cn("border-b-2", rule)}>
              <button
                type="button"
                aria-expanded={on}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "flex w-full items-baseline gap-3 px-2 py-2 text-left focus-visible:outline-none",
                  on && "bg-(--ink) text-(--flood) dark:bg-(--flood) dark:text-black",
                )}
              >
                <span className={cn(mono, "w-8 shrink-0 text-xs font-bold")}>{String(i + 1).padStart(2, "0")}</span>
                <span className={cn(display, "text-[length:19cqw] leading-[0.85]")}>
                  {tool.name}
                </span>
              </button>
              {on && (
                <div className="pb-8 lg:hidden">
                  <ToolDetail tool={tool} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-20">
          <ToolDetail tool={tools[active]} />
        </div>
      </div>
    </div>
  );
}
