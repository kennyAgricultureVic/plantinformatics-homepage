import type { ReactNode } from "react";
import { site } from "@/content";
import { edition, font, furniture } from "./edition";

// Top of an inside page: the running head (title, date, folio) over a spot rule, then
// the section name in heavy caps with an italic standfirst beside it.
export function SectionHead({ page, title, children }: { page: number; title: string; children?: ReactNode }) {
  return (
    <header>
      <div className={`${furniture} flex justify-between gap-4 border-b border-(--ink) pb-1.5`}>
        <span>{site.name}</span>
        <span className="hidden sm:inline">{edition.dateline}</span>
        <span>Page {page}</span>
      </div>
      <div className="mt-0.5 h-1.5 bg-(--p1)" />
      <div className="flex flex-col gap-2 border-b border-(--ink) py-4 md:flex-row md:items-end md:justify-between md:gap-8">
        <h2 className={`${font.headline} text-[clamp(2.75rem,8vw,6rem)] leading-[0.85] font-black tracking-tight uppercase`}>{title}</h2>
        {children && <p className={`${font.text} max-w-md text-lg italic leading-snug md:text-right`}>{children}</p>}
      </div>
    </header>
  );
}
