import { formatDate, news } from "@/content";
import { font, furniture, halftone, leadStory, pageOf } from "./edition";
import { SectionHead } from "./section-head";

const kindLabel = { tool: "Software", data: "Data" } as const;

// Page two: every other news item as a brief, flowed down ruled newspaper columns.
// Software briefs carry a solid spot square, data briefs a screened one.
export function Briefs() {
  const briefs = news.filter((n) => n !== leadStory);

  return (
    <section id="news" className="scroll-mt-4 py-12">
      <SectionHead page={pageOf.news} title="News in brief">
        {briefs.length} dispatches from the release log, newest first.
      </SectionHead>
      <div className="mt-6 gap-8 [column-rule:1px_solid_var(--ink)] sm:columns-2 lg:columns-4">
        {briefs.map((n, i) => (
          <article key={n.date + n.title} className="mb-6 break-inside-avoid border-b border-dotted border-(--ink) pb-5">
            <p className={`${furniture} flex items-center gap-2`}>
              <span className={`size-2.5 shrink-0 ${n.kind === "tool" ? "bg-(--p1)" : `${halftone} outline outline-(--p1)`}`} />
              {kindLabel[n.kind]}
              <time dateTime={n.date} className="ml-auto">
                {formatDate(n.date)}
              </time>
            </p>
            <h3
              className={`${font.headline} mt-2 leading-tight font-bold text-balance ${i === 0 ? "text-3xl" : "text-xl"}`}
            >
              {n.title}
            </h3>
            <p className={`${font.text} mt-2 leading-relaxed text-pretty hyphens-auto`}>{n.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
