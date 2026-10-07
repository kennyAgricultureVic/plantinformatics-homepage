import { dataReleases, formatDate, formatNumber, standards, totalAccessions } from "@/content";
import { composite, font, furniture, halftone, netChange, pageOf } from "./edition";
import { SectionHead } from "./section-head";

// Page three, set like the financial pages: the releases as a share table with net
// change against the release each one supersedes, a composite index chart, and the
// mappings and standards as listed notices.
export function Markets() {
  return (
    <section id="data" className="scroll-mt-4 py-12">
      <SectionHead page={pageOf.data} title="Markets">
        Genotype releases from the genebank, quoted by crop and reference assembly.
      </SectionHead>

      <div className="mt-6 grid gap-x-8 gap-y-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <p className={`${furniture} border-b-2 border-(--ink) pb-1.5`}>Release listings</p>
          <div className="overflow-x-auto">
            <table className={`${font.label} w-full min-w-[34rem] text-left text-sm tabular-nums`}>
              <thead className={furniture}>
                <tr className="border-b border-(--ink)">
                  <th className="py-2 pr-3 font-semibold">Crop</th>
                  <th className="py-2 pr-3 text-right font-semibold">Accessions</th>
                  <th className="py-2 pr-3 text-right font-semibold">Net</th>
                  <th className="py-2 pr-3 font-semibold">Assembly</th>
                  <th className="py-2 pr-3 font-semibold">Listed</th>
                  <th className="py-2 font-semibold">DOI</th>
                </tr>
              </thead>
              <tbody>
                {dataReleases.map((r) => {
                  const net = netChange(r);
                  const superseded = "superseded" in r;
                  return (
                    <tr key={r.doi} className="border-b border-dotted border-(--ink) odd:bg-[color-mix(in_oklab,var(--p1)_9%,transparent)]">
                      <td className="py-1.5 pr-3 font-bold">
                        {r.crop}
                        {superseded && <sup className="ml-0.5 font-normal text-(--p1)">x</sup>}
                      </td>
                      <td className={`py-1.5 pr-3 text-right ${superseded ? "line-through decoration-(--p1)" : ""}`}>
                        {formatNumber(r.accessions)}
                      </td>
                      <td className="py-1.5 pr-3 text-right whitespace-nowrap">
                        {net === null ? (
                          <span className="text-xs uppercase">new</span>
                        ) : (
                          <span className="font-semibold text-(--p1)">▲ {formatNumber(net)}</span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3">{r.assembly}</td>
                      <td className="py-1.5 pr-3 whitespace-nowrap">{formatDate(r.released)}</td>
                      <td className="py-1.5">
                        <a href={r.doi} className="underline-offset-2 hover:text-(--p1) hover:underline">
                          {r.doi.replace("https://doi.org/", "")}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className={`${font.text} mt-2 text-sm italic`}>
            x Superseded: every accession is carried in a later release of the same crop. Net change is measured against
            that release.
          </p>
        </div>

        <aside className="lg:col-span-4 lg:border-l lg:border-(--ink) lg:pl-8">
          <CompositeIndex />
        </aside>
      </div>

      <div className="mt-12">
        <p className={`${furniture} border-b-2 border-(--ink) pb-1.5`}>Notices: mappings and standards</p>
        <dl className="mt-4 gap-8 [column-rule:1px_solid_var(--ink)] sm:columns-2 lg:columns-4">
          {standards.map((s) => (
            <div key={s.name} className="mb-5 break-inside-avoid">
              <dt className={`${font.headline} text-lg leading-tight font-bold`}>{s.name}</dt>
              <dd className={`${font.text} mt-1 leading-relaxed text-pretty hyphens-auto`}>{s.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const W = 320;
const H = 140;

// Step chart of unique accessions on file after each release, like a market index.
function CompositeIndex() {
  const first = new Date(composite[0].date).getTime();
  const span = new Date(composite[composite.length - 1].date).getTime() - first;
  const x = (iso: string) => ((new Date(iso).getTime() - first) / span) * W;
  const y = (total: number) => H - (total / totalAccessions) * (H - 8);

  const steps = composite.map((p) => `H${x(p.date).toFixed(1)} V${y(p.total).toFixed(1)}`).join(" ");
  const area = `M0 ${H} ${steps} H${W} V${H} Z`;
  const start = composite[0].date.slice(0, 4);
  const end = composite[composite.length - 1].date.slice(0, 4);

  return (
    <figure>
      <figcaption className={`${furniture} border-b-2 border-(--ink) pb-1.5`}>Genebank composite</figcaption>
      <p className={`${font.headline} mt-3 text-5xl font-black tabular-nums`}>{formatNumber(totalAccessions)}</p>
      <p className={`${font.label} mt-1 text-sm font-semibold text-(--p1)`}>
        ▲ {composite.length} listings since {start}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full overflow-visible" role="img" aria-label="Unique accessions on file over time">
        <defs>
          <pattern id="gz-screen" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1.1" className="fill-(--p1)" />
          </pattern>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={y(totalAccessions * f)} y2={y(totalAccessions * f)} className="stroke-(--ink)" strokeWidth="0.5" strokeDasharray="1 3" />
        ))}
        <path d={area} fill="url(#gz-screen)" />
        <path d={`M0 ${H} ${steps} H${W}`} fill="none" className="stroke-(--p1)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        <line x1="0" x2={W} y1={H} y2={H} className="stroke-(--ink)" strokeWidth="1" />
      </svg>
      <div className={`${furniture} mt-1 flex justify-between`}>
        <span>{start}</span>
        <span>{end}</span>
      </div>
      <p className={`${font.text} mt-3 text-sm italic`}>
        Unique accessions on file after each listing. A superseded release leaves the index when its successor lists.
      </p>
      <span className={`mt-4 block h-3 ${halftone}`} aria-hidden />
    </figure>
  );
}
