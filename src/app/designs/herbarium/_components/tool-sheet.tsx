import Image from "next/image";
import { ArrowUpRightIcon } from "lucide-react";
import { formatDate, news, site, tools, type Crop, type ToolSlug } from "@/content";
import { binomials, specimens } from "./botany";
import { cn } from "@/lib/utils";
import { Field, Label, Pencil, Sheet, Specimen, Stamp, standardTapes, stampInk } from "./mount";

type Tool = (typeof tools)[number];

/** Which crop is drawn on each tool's sheet. */
const toolCrop = {
  pretzel: "Wheat",
  genolink: "Barley",
  fairybread: "Chickpea",
  brioche: "Field pea",
} satisfies Record<ToolSlug, Crop>;

// Envelope glued to the top of a sheet for loose fragments. Here it holds the screenshot,
// or stays sealed until one is supplied.
function Packet({ tool }: { tool: Tool }) {
  return (
    <div className="relative w-full max-w-80 border border-current/25 bg-[#f4edda] p-2 pt-6 dark:bg-black">
      <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-5 w-full">
        <polyline points="0,0 50,10 100,0" fill="none" stroke="currentColor" strokeOpacity={0.3} vectorEffect="non-scaling-stroke" />
      </svg>
      {"image" in tool ? (
        <Image src={tool.image} alt={`${tool.name} screenshot`} width={1421} height={876} className="w-full border border-current/15" />
      ) : (
        <div
          role="img"
          aria-label={`${tool.name} screenshot placeholder`}
          className="grid aspect-[16/10] place-items-center border border-dashed border-current/30 font-(family-name:--hb-type) text-[10px] tracking-widest uppercase"
        >
          Screenshot to follow
        </div>
      )}
      <p className="mt-1.5 font-(family-name:--hb-type) text-[10px] tracking-widest uppercase">Fragment packet</p>
    </div>
  );
}

/**
 * One tool mounted as a herbarium specimen: fragment packet and accession stamp at the top,
 * a crop drawing taped down, annotation slips for capabilities, and a determination label
 * whose date and determination come from the latest news item that mentions the tool.
 */
export function ToolSheet({ tool, index }: { tool: Tool; index: number }) {
  const crop = toolCrop[tool.slug];
  const Drawing = specimens[crop];
  const mention = news.find((n) => n.title.includes(tool.name) || n.body.includes(tool.name));
  const accession = `PI ${String(index + 1).padStart(4, "0")}`;

  const flip = index % 2 === 1;

  return (
    <Sheet className="p-5 sm:p-8">
      <article aria-labelledby={`${tool.slug}-name`} className="grid gap-6 @3xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] @3xl:gap-x-12">
        <div className={cn("flex items-start justify-between gap-4 @3xl:row-start-1", flip ? "@3xl:col-start-1" : "@3xl:col-start-2")}>
          <Packet tool={tool} />
          <Stamp top="Plant Inf." bottom={accession} className="mt-3 mr-1 shrink-0" />
        </div>

        <div className={cn("relative @3xl:row-span-2 @3xl:row-start-1", flip ? "@3xl:col-start-2" : "@3xl:col-start-1")}>
          <Specimen drawing={<Drawing className="absolute inset-0 h-full w-full" />} tapes={standardTapes} className="h-[26rem] @3xl:h-full @3xl:min-h-[34rem]" />
          <Pencil className="absolute bottom-1 left-0 -rotate-3">{crop}</Pencil>
        </div>

        <div className={cn("flex flex-col gap-5", flip ? "@3xl:col-start-1" : "@3xl:col-start-2")}>
            <p className="text-lg leading-snug">{tool.description}</p>
            <ol className="space-y-2">
              {tool.capabilities.map((c, i) => (
                <li
                  key={c}
                  className="grid grid-cols-[1.75rem_minmax(0,1fr)] border-t border-current/15 pt-2 font-(family-name:--hb-type) text-[12px] leading-snug"
                >
                  <span className={stampInk}>{String.fromCharCode(97 + i)}.</span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>

            <Label heading={`${site.name} herbarium`} className="mt-auto">
              <p id={`${tool.slug}-name`} className="mt-2 text-4xl leading-none font-semibold italic">
                {tool.name}
              </p>
              <p className="mt-1 mb-3 text-base leading-snug">{tool.summary}</p>
              <dl className="space-y-0.5">
                <Field name="Loc.">{new URL(tool.url).host}</Field>
                <Field name="Coll.">{site.name}</Field>
                <Field name="Date">{mention ? formatDate(mention.date) : "s.d."}</Field>
                <Field name="Det.">{mention?.title ?? "Not yet determined"}</Field>
                <Field name="Illus.">
                  <i>{binomials[crop]}</i>
                </Field>
              </dl>
              <a
                href={tool.url}
                className={`mt-3 inline-flex items-center gap-1 font-(family-name:--hb-type) text-[12px] font-bold tracking-wider uppercase underline-offset-4 hover:underline ${stampInk}`}
              >
                Examine {tool.name} <ArrowUpRightIcon className="size-3.5" />
              </a>
            </Label>
        </div>
      </article>
    </Sheet>
  );
}
