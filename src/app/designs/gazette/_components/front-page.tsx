import { formatDate, formatNumber, site } from "@/content";
import { font, furniture, halftone, holdings, latestRelease, leadStory, netChange, pageOf } from "./edition";

const dropCap =
  "first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:text-[4.2rem] first-letter:leading-[0.8] first-letter:font-black first-letter:text-(--p1) first-letter:font-(family-name:--font-gz-headline)";

// Page one, above and below the fold: the lead story from the newest data release with
// its chart, the leader column (who we are and what we want), and a figures strip.
export function FrontPage() {
  const gain = netChange(latestRelease);
  const top = holdings[0].total;

  return (
    <section id="about" className="scroll-mt-4 py-6">
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <p className={`${furniture} text-(--p1)`}>Data release · {latestRelease.crop}</p>
          <h2 className={`${font.headline} mt-2 text-[clamp(2.4rem,6.5vw,5.6rem)] leading-[0.92] font-black tracking-tight text-balance`}>
            {leadStory.title}
          </h2>
          <p className={`${font.text} mt-4 max-w-2xl text-xl italic leading-snug sm:text-2xl`}>
            Anchored against {latestRelease.assembly}
            {gain !== null && <>, up {formatNumber(gain)} on the previous {latestRelease.crop.toLowerCase()} release</>}.
          </p>
          <p className={`${furniture} mt-4 border-y border-(--ink) py-1.5`}>
            Filed <time dateTime={leadStory.date}>{formatDate(leadStory.date)}</time>
          </p>

          <div className="mt-5 grid gap-x-6 gap-y-6 sm:grid-cols-[1fr_1.3fr] sm:divide-x sm:divide-(--ink)">
            <div className={`${font.text} pr-0 text-[1.06rem] leading-relaxed text-pretty hyphens-auto sm:pr-6`}>
              <p className={dropCap}>{leadStory.body}</p>
              <dl className={`${font.label} mt-5 border-t-2 border-(--ink) text-sm`}>
                {[
                  ["Crop", latestRelease.crop],
                  ["Accessions", formatNumber(latestRelease.accessions)],
                  ["Assembly", latestRelease.assembly],
                ].map(([term, value]) => (
                  <div key={term} className="flex justify-between gap-4 border-b border-dotted border-(--ink) py-1.5">
                    <dt className="font-semibold">{term}</dt>
                    <dd className="text-right tabular-nums">{value}</dd>
                  </div>
                ))}
                <div className="flex justify-between gap-4 py-1.5">
                  <dt className="font-semibold">DOI</dt>
                  <dd className="min-w-0 truncate text-right">
                    <a href={latestRelease.doi} className="text-(--p1) underline underline-offset-2">
                      {latestRelease.doi.replace("https://doi.org/", "")}
                    </a>
                  </dd>
                </div>
              </dl>
              <p className={`${furniture} mt-4`}>
                Full listings, Markets p.{pageOf.data}
              </p>
            </div>

            <figure className="sm:pl-6">
              <figcaption className={`${furniture} border-b-2 border-(--ink) pb-1.5`}>Accessions on file, by crop</figcaption>
              <ul className="mt-3 space-y-2.5">
                {holdings.map(({ crop, total }) => (
                  <li key={crop} className={`${font.label} grid grid-cols-[5rem_1fr] items-center gap-3 text-sm`}>
                    <span className="font-semibold">{crop}</span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-5 ${crop === latestRelease.crop ? "bg-(--p1)" : halftone}`}
                        style={{ width: `${(total / top) * 80}%` }}
                      />
                      <span className="tabular-nums">{formatNumber(total)}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className={`${font.text} mt-3 text-sm italic`}>
                Solid: this edition&apos;s release. Screened: earlier releases. Superseded releases are not double counted.
              </p>
            </figure>
          </div>
        </article>

        <aside className="lg:col-span-4 lg:border-l lg:border-(--ink) lg:pl-8">
          <p className={`${furniture} border-t-4 border-(--p1) pt-2 text-(--p1)`}>The leader</p>
          <h2 className={`${font.headline} mt-2 text-3xl leading-tight font-bold italic text-balance`}>{site.goal}</h2>
          <p className={`${font.text} ${dropCap} mt-4 text-[1.06rem] leading-relaxed text-pretty hyphens-auto`}>{site.summary}</p>

          <h3 className={`${furniture} mt-6 border-y border-(--ink) py-1.5`}>We resolve to</h3>
          <ol className={`${font.text} mt-3 space-y-3`}>
            {site.objectives.map((o, i) => (
              <li key={o} className="grid grid-cols-[2rem_1fr] leading-snug">
                <span className={`${font.headline} text-2xl leading-none font-black text-(--p1)`}>{i + 1}.</span>
                <span>{o}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <dl className="mt-10 grid border-y-4 border-double border-(--ink) sm:grid-cols-3 sm:divide-x sm:divide-(--ink)">
        {site.stats.map((s) => (
          <div key={s.label} className="flex items-baseline gap-3 border-b border-(--ink) px-1 py-4 last:border-b-0 sm:block sm:border-b-0 sm:px-6 sm:text-center">
            <dd className={`${font.headline} text-5xl font-black tabular-nums sm:text-6xl`}>{s.value}</dd>
            <dt className={`${furniture} sm:mt-2`}>{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
