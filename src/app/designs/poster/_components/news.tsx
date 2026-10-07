import { formatDate, news } from "@/content";
import { Detail, Kicker, Sheet, display, ink } from "./print";

/**
 * News poster in the manner of a loudhailer: a beam fans out from the left edge and
 * announces the latest item in giant type. The full list sits in the grid underneath.
 */
export function News() {
  const [latest, ...rest] = news;

  return (
    <>
      <Sheet id="news" field={4}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute inset-y-[8%] right-0 left-[6%] [clip-path:polygon(0_52%,100%_0,100%_100%,0_60%)]"
            style={{ background: ink(3) }}
          />
          <div className="absolute top-[48%] left-0 h-[16%] w-[9%] min-w-10" style={{ background: ink(2) }} />
          <div className="absolute top-[4%] right-[5%] size-[18vmin] rounded-full" style={{ background: ink(1) }} />
        </div>

        <div className="px-4 pt-6 sm:px-8 md:pt-10">
          <Kicker id="news" />
        </div>

        <div className="ml-auto flex w-[70%] flex-1 flex-col justify-center gap-4 py-16 pr-4 text-right sm:pr-8 md:w-[62%]" style={{ color: "var(--p3-fg)" }}>
          <time dateTime={latest.date} className={`${display} text-2xl md:text-4xl`}>
            {formatDate(latest.date)}
          </time>
          <p className={`${display} text-[clamp(2.6rem,7.5vw,8rem)] [overflow-wrap:anywhere]`}>{latest.title}</p>
          <p className="ml-auto max-w-md text-base leading-snug md:text-lg">{latest.body}</p>
        </div>
      </Sheet>

      <Detail>
        <ol className="col-span-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 md:col-span-12 md:grid-cols-3">
          {rest.map((n) => (
            <li key={n.date + n.title} className="border-t-4 border-current pt-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className={`size-5 border-2 border-current ${n.kind === "data" ? "rounded-full" : ""}`}
                  style={{ background: ink(n.kind === "tool" ? 2 : 4) }}
                />
                <time dateTime={n.date} className={`${display} text-xl`}>
                  {formatDate(n.date)}
                </time>
                <span className="ml-auto text-xs uppercase">{n.kind === "tool" ? "Tool release" : "Data release"}</span>
              </div>
              <h3 className={`${display} mt-3 text-3xl`}>{n.title}</h3>
              <p className="mt-2 leading-relaxed">{n.body}</p>
            </li>
          ))}
        </ol>
      </Detail>
    </>
  );
}
