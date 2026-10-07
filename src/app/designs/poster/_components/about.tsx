import { site } from "@/content";
import { Detail, Kicker, Sheet, display, ink, paint } from "./print";

/**
 * Opening poster. A diagonal bar carries the wordmark, a giant disc holds the stats,
 * and the stats are drawn as shapes: one dot per crop, one bar per tool.
 */
export function About() {
  const [genotypes, cropCount, toolCount] = site.stats;

  return (
    <>
      <Sheet id="about" field={1}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-0 size-[46vmin] rounded-tr-full" style={{ background: ink(4) }} />
          <div className="absolute top-[18%] left-[6%] h-[140%] w-1 origin-top -rotate-[34deg]" style={{ background: ink(3) }} />
          <div
            className={`${display} absolute top-[74%] left-[-20%] flex h-[clamp(3.5rem,12vmin,8.5rem)] w-[140%] -rotate-[12deg] items-center gap-[0.4em] overflow-hidden text-[clamp(3rem,11vmin,8rem)] whitespace-nowrap md:top-[80%]`}
            style={paint(3)}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className="pt-[0.12em]">
                {site.name} <span className="opacity-50">/</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid flex-1 grid-rows-[auto_1fr] gap-8 px-4 pt-6 sm:px-8 md:grid-cols-[minmax(0,1fr)_auto] md:grid-rows-1 md:pt-10">
          <div className="flex flex-col gap-8">
            <Kicker id="about" />
            <h1 id="about-title" className={`${display} max-w-[15ch] text-[clamp(3rem,min(7vw,11vh),8rem)]`}>
              {site.tagline}
            </h1>
          </div>

          <div
            className="@container relative -mr-[30vw] mb-[-22vw] ml-[6vw] flex aspect-square w-[112vw] max-w-none flex-col items-center justify-center self-end rounded-full text-center md:mr-[-8vw] md:mb-[-6vh] md:ml-0 md:w-[min(56vw,92vh)] md:self-center"
            style={paint(2)}
          >
            <div className="-translate-x-[12cqw] -translate-y-[8cqw] md:translate-0">
              <p
                className={`${display} text-[24cqw] leading-[0.8] md:text-[22cqw]`}
                style={{ textShadow: `0.035em 0.035em 0 ${ink(4)}` }}
              >
                {genotypes.value}
              </p>
              <p className={`${display} mt-[2cqw] text-[4.4cqw]`}>{genotypes.label}</p>

              <div className="mt-[5cqw] flex items-end justify-center gap-[6cqw]">
                <div className="flex flex-col items-center gap-[1.5cqw]">
                  <div aria-hidden className="flex gap-[1cqw]">
                    {Array.from({ length: Number(cropCount.value) }, (_, i) => (
                      <span key={i} className="size-[4cqw] rounded-full" style={{ background: ink(1) }} />
                    ))}
                  </div>
                  <p className={`${display} text-[3.6cqw]`}>
                    {cropCount.value} {cropCount.label}
                  </p>
                </div>
                <div className="flex flex-col items-center gap-[1.5cqw]">
                  <div aria-hidden className="flex items-end gap-[1cqw]">
                    {Array.from({ length: Number(toolCount.value) }, (_, i) => (
                      <span key={i} className="w-[2cqw]" style={{ background: ink(3), height: `${4 + i * 1.5}cqw` }} />
                    ))}
                  </div>
                  <p className={`${display} text-[3.6cqw]`}>
                    {toolCount.value} {toolCount.label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sheet>

      <Detail>
        <p className={`${display} col-span-4 text-4xl md:col-span-5 md:text-5xl`}>{site.goal}</p>
        <p className="col-span-4 text-lg leading-relaxed md:col-span-6 md:col-start-7 md:text-xl">{site.summary}</p>
        <ol className="col-span-4 grid gap-x-6 gap-y-10 md:col-span-12 md:grid-cols-3">
          {site.objectives.map((objective, i) => {
            const slot = ([2, 3, 4] as const)[i % 3];
            return (
              <li key={objective} className="border-t-4 border-current pt-4">
                <span
                  className={`${display} mb-4 flex size-14 items-center justify-center border-2 border-current text-3xl ${i === 1 ? "rounded-full" : ""}`}
                  style={paint(slot)}
                >
                  {i + 1}
                </span>
                <p className="text-lg leading-snug">{objective}</p>
              </li>
            );
          })}
        </ol>
      </Detail>
    </>
  );
}
