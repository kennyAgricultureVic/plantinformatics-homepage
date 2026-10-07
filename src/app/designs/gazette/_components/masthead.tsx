import { ThemeToggle } from "@/components/theme-toggle";
import type { ReactNode } from "react";
import { formatDate, site } from "@/content";
import { contents, edition, font, furniture, latestTool, pageOf } from "./edition";

// Front page nameplate: index strip with the theme toggle, two ears, the blackletter
// title in the spot colour, and the dateline bar between heavy and hairline rules.
export function Masthead() {
  return (
    <header className="pt-3">
      <div className={`${furniture} flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-(--ink) pb-2`}>
        <span>
          Vol. {edition.volume} · No. {edition.number}
        </span>
        <nav aria-label="Sections" className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="hidden sm:inline">Inside:</span>
          {contents.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="underline-offset-4 hover:text-(--p1) hover:underline">
              {s.label} <span className="text-(--p1)">p.{pageOf[s.id]}</span>
            </a>
          ))}
        </nav>
        <span className="ml-auto -my-2">
          <ThemeToggle />
        </span>
      </div>

      <div className="grid items-center gap-4 py-5 md:grid-cols-[11rem_1fr_11rem] md:py-7">
        <Ear title="Today's figure" className="text-left">
          <span className={`${font.headline} block text-3xl font-black tabular-nums`}>{site.stats[0].value}</span>
          <span className={`${font.text} italic`}>{site.stats[0].label}</span>
        </Ear>

        <div className="text-center">
          <h1 className={`${font.blackletter} text-[clamp(2.6rem,11vw,7.25rem)] leading-[0.9] lg:text-[clamp(4rem,7.4vw,7.25rem)] lg:whitespace-nowrap text-(--p1)`}>
            {site.name}
          </h1>
        </div>

        {latestTool && (
          <Ear title="Latest software" className="text-right">
            <span className={`${font.headline} block text-xl leading-tight font-bold`}>{latestTool.title}</span>
            <span className={`${font.text} italic`}>Out {formatDate(latestTool.date)}. Classifieds, p.{pageOf.tools}</span>
          </Ear>
        )}
      </div>

      <p className={`${font.text} mx-auto max-w-3xl pb-4 text-center text-lg italic leading-snug sm:text-xl`}>{site.tagline}</p>

      <div className="h-1.5 bg-(--p1)" />
      <div className={`${furniture} flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-(--ink) py-2`}>
        <time dateTime={edition.date}>{edition.dateline}</time>
        <span className="hidden md:inline">Open data edition</span>
        <span>Price: nil. Open access</span>
      </div>
      <div className="mt-0.5 border-b border-(--ink)" />
    </header>
  );
}

// Boxed corner panel either side of the nameplate. Hidden on narrow screens.
function Ear({ title, className, children }: { title: string; className: string; children: ReactNode }) {
  return (
    <aside className={`hidden border border-(--ink) p-2.5 text-sm leading-snug md:block ${className}`}>
      <p className={`${furniture} mb-1 text-(--p1)`}>{title}</p>
      {children}
    </aside>
  );
}
