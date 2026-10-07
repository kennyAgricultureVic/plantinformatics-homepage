import Image from "next/image";
import { tools } from "@/content";
import { font, furniture, halftone, pageOf } from "./edition";
import { SectionHead } from "./section-head";

// Page four, the back page: each tool as a classified advertisement in ruled columns.
export function Classifieds() {
  return (
    <section id="tools" className="scroll-mt-4 py-12">
      <SectionHead page={pageOf.tools} title="Classifieds">
        Open source software, free to all comers. Apply within.
      </SectionHead>
      <div className="mt-6 grid gap-y-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-(--ink)">
        {tools.map((tool, i) => (
          <Advert key={tool.slug} tool={tool} number={i + 1} />
        ))}
      </div>
    </section>
  );
}

// One ad: box number, name in heavy caps, a printed cut, run-in copy and the reply address.
function Advert({ tool, number }: { tool: (typeof tools)[number]; number: number }) {
  const host = new URL(tool.url).host + new URL(tool.url).pathname.replace(/\/$/, "");

  return (
    <article className="flex flex-col lg:px-6 lg:first:pl-0 lg:last:pr-0">
      <p className={`${furniture} flex justify-between border-t-4 border-(--p1) pt-2`}>
        <span>Box {String(number).padStart(3, "0")}</span>
        <span className="text-(--p1)">Free</span>
      </p>
      <h3 className={`${font.headline} mt-2 text-4xl leading-none font-black tracking-tight uppercase`}>{tool.name}</h3>
      <p className={`${font.label} mt-2 text-sm leading-snug font-semibold`}>{tool.summary}</p>

      <div className="mt-4 border border-(--ink) p-1">
        {"image" in tool ? <Duotone src={tool.image} alt={`${tool.name} screenshot`} /> : <Cut label={tool.name} />}
      </div>

      <p className={`${font.text} mt-4 leading-snug text-pretty hyphens-auto`}>{tool.description}</p>
      <p className={`${font.text} mt-3 text-[0.95rem] leading-snug text-pretty hyphens-auto`}>
        {tool.capabilities.map((c) => (
          <span key={c}>
            <span className="text-(--p1)" aria-hidden>
              ■{" "}
            </span>
            {c}.{" "}
          </span>
        ))}
      </p>
      <div className="mt-auto pt-4">
        <a href={tool.url} className="block border-y border-(--ink) py-2 hover:bg-(--p1) hover:text-(--p1-fg)">
          <span className={`${furniture} block`}>Apply</span>
          <span className={`${font.label} block text-sm [overflow-wrap:anywhere]`}>{host}</span>
        </a>
      </div>
    </article>
  );
}

// Screenshot printed as a two-colour duotone: greyscale plate with the spot ink multiplied over it.
function Duotone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-left-top grayscale contrast-125 dark:invert" />
      <div className="absolute inset-0 bg-(--p1) opacity-60 mix-blend-multiply" />
    </div>
  );
}

// Stand-in cut for tools without a screenshot: a graded halftone with the name set across it.
function Cut({ label }: { label: string }) {
  return (
    <div role="img" aria-label={`${label} screenshot placeholder`} className="relative flex aspect-[16/10] items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 ${halftone} [mask-image:linear-gradient(135deg,black,transparent_75%)]`} />
      <span className={`${font.headline} relative bg-(--paper) px-2 text-2xl italic`}>{label}</span>
    </div>
  );
}
