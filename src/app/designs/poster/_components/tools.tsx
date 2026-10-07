import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { tools } from "@/content";
import { Detail, Kicker, Sheet, display, ink, paint, type Slot } from "./print";

// Bar colour per tool. Slot 3 leads because it always differs from the slot 2 field.
const bars = [3, 4, 1, 3] as const satisfies readonly Slot[];

/**
 * Tools poster: a rising staircase of diagonal bars, one per tool, over a giant outlined
 * tool count. Each bar links to that tool's cell in the grid underneath.
 */
export function Tools() {
  return (
    <>
      <Sheet id="tools" field={2}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <span
            className={`${display} absolute -top-[6vh] -right-[2vw] text-[clamp(20rem,80vmin,60rem)] leading-[0.75] text-transparent`}
            style={{ WebkitTextStroke: "3px var(--p2-fg)" }}
          >
            {tools.length}
          </span>
          <div className="absolute -top-[18vmin] -left-[18vmin] size-[48vmin] rounded-full" style={{ background: ink(1) }} />
          <div className="absolute top-0 right-[18%] h-full w-[3px] rotate-[22deg]" style={{ background: ink(4) }} />
        </div>

        <div className="relative px-4 pt-6 sm:px-8 md:pt-10">
          <Kicker id="tools" />
        </div>

        <ol className="flex flex-1 -rotate-[14deg] flex-col justify-center gap-3 py-24 pl-[6vw] md:gap-4">
          {tools.map((tool, i) => (
            <li key={tool.slug} style={{ marginLeft: `calc(${i} * clamp(1rem, 7vw, 8rem))` }}>
              <a
                href={`#tool-${tool.slug}`}
                style={paint(bars[i])}
                className="group flex w-[min(130%,62rem)] items-end justify-between gap-6 px-6 py-3 md:px-10"
              >
                <span className={`${display} pt-[0.1em] text-[clamp(3.2rem,11vw,9rem)] group-hover:underline`}>{tool.name}</span>
                <span className="hidden max-w-[24ch] pb-3 text-right text-sm leading-tight sm:block md:text-base">{tool.summary}</span>
              </a>
            </li>
          ))}
        </ol>
      </Sheet>

      <Detail>
        {tools.map((tool, i) => (
          <article
            key={tool.slug}
            id={`tool-${tool.slug}`}
            className="col-span-4 flex scroll-mt-16 flex-col border-t-8 pt-5 md:col-span-6"
            style={{ borderColor: ink(bars[i]) }}
          >
            <header className="flex items-start gap-4">
              <span
                className={`${display} flex size-12 shrink-0 items-center justify-center border-2 border-current text-2xl`}
                style={paint(bars[i])}
              >
                {i + 1}
              </span>
              <h3 className={`${display} text-5xl md:text-6xl`}>{tool.name}</h3>
            </header>
            <div className="mt-6 border-4 border-current">
              {"image" in tool ? (
                <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="block w-full" />
              ) : (
                <ImagePlaceholder label={tool.name} className="border-0 text-current" />
              )}
            </div>
            <p className="mt-6 text-lg leading-relaxed">{tool.description}</p>
            <ul className="mt-6 grid gap-2 border-t-2 border-current pt-4">
              {tool.capabilities.map((c) => (
                <li key={c} className="grid grid-cols-[1.25rem_1fr] gap-2 leading-snug">
                  <span aria-hidden className="mt-1.5 size-2.5 border-2 border-current" style={{ background: ink(bars[i]) }} />
                  {c}
                </li>
              ))}
            </ul>
            <a
              href={tool.url}
              className={`${display} mt-8 flex items-center justify-between gap-2 border-4 border-current px-4 pt-3 pb-2 text-2xl hover:underline`}
            >
              Open {tool.name}
              <ArrowUpRightIcon className="size-7" strokeWidth={3} />
            </a>
          </article>
        ))}
      </Detail>
    </>
  );
}
