"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { formatDate, formatNumber, type DataRelease } from "@/content";

type Key = "crop" | "accessions" | "assembly" | "released" | "doi";
type Sort = { key: Key; dir: "ascending" | "descending" };

const columns: { key: Key; label: string; numeric?: boolean }[] = [
  { key: "crop", label: "Crop" },
  { key: "accessions", label: "Accessions", numeric: true },
  { key: "assembly", label: "Reference assembly" },
  { key: "released", label: "Released" },
  { key: "doi", label: "DOI" },
];

const noop = () => () => {};
/** False during server render and hydration, true once JavaScript runs. */
const useEnhanced = () => useSyncExternalStore(noop, () => true, () => false);

const compare = (a: DataRelease, b: DataRelease, key: Key) =>
  key === "accessions" ? a.accessions - b.accessions : String(a[key]).localeCompare(String(b[key]));

/**
 * Data releases as a plain table. The server renders every row, newest first, so it works
 * without JavaScript; once hydrated, column headers sort and a crop filter appears.
 */
export function ReleaseTable({ releases }: { releases: readonly DataRelease[] }) {
  const enhanced = useEnhanced();
  const [sort, setSort] = useState<Sort>({ key: "released", dir: "descending" });
  const [crop, setCrop] = useState("");
  const [showSuperseded, setShowSuperseded] = useState(true);
  const cropId = useId();
  const supersededId = useId();

  const crops = [...new Set(releases.map((r) => r.crop))].sort();
  const rows = releases
    .filter((r) => (!crop || r.crop === crop) && (showSuperseded || !r.superseded))
    .sort((a, b) => compare(a, b, sort.key) * (sort.dir === "ascending" ? 1 : -1));

  const toggle = (key: Key) =>
    setSort((s) => ({
      key,
      dir: s.key === key ? (s.dir === "ascending" ? "descending" : "ascending") : key === "accessions" || key === "released" ? "descending" : "ascending",
    }));

  return (
    <div>
      {enhanced && (
        <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-3 border border-neutral-300 p-4 dark:border-neutral-700">
          <div className="flex flex-col gap-1">
            <label htmlFor={cropId} className="font-medium">
              Crop
            </label>
            <select
              id={cropId}
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="h-11 min-w-48 border border-neutral-500 bg-background px-3"
            >
              <option value="">All crops</option>
              {crops.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex h-11 items-center gap-3">
            <input
              id={supersededId}
              type="checkbox"
              checked={showSuperseded}
              onChange={(e) => setShowSuperseded(e.target.checked)}
              className="size-5 accent-(--p1)"
            />
            <label htmlFor={supersededId}>Include superseded releases</label>
          </div>
          <p aria-live="polite" className="text-neutral-600 sm:ml-auto dark:text-neutral-400">
            Showing {rows.length} of {releases.length} releases
          </p>
        </div>
      )}

      <div className="overflow-x-auto border border-neutral-300 dark:border-neutral-700">
        <table className="w-full min-w-[44rem] border-collapse text-left">
          <caption className="sr-only">
            Data releases{enhanced ? ", sortable by column" : ""}
          </caption>
          <thead className="bg-neutral-100 dark:bg-neutral-900">
            <tr>
              {columns.map((c) => {
                const active = sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={enhanced && active ? sort.dir : undefined}
                    className={`border-b border-neutral-300 font-semibold dark:border-neutral-700 ${c.numeric ? "text-right" : ""}`}
                  >
                    {enhanced ? (
                      <button
                        type="button"
                        onClick={() => toggle(c.key)}
                        className={`flex min-h-11 w-full items-center gap-2 px-3 py-2 font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800 ${c.numeric ? "justify-end" : ""}`}
                      >
                        {c.label}
                        <span aria-hidden className={active ? "" : "text-neutral-400 dark:text-neutral-600"}>
                          {active ? (sort.dir === "ascending" ? "▲" : "▼") : "↕"}
                        </span>
                      </button>
                    ) : (
                      <span className="block px-3 py-2">{c.label}</span>
                    )}
                  </th>
                );
              })}
              <th scope="col" className="border-b border-neutral-300 px-3 py-2 font-semibold dark:border-neutral-700">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.doi} className="border-b border-neutral-200 last:border-b-0 dark:border-neutral-800">
                <th scope="row" className="px-3 py-2 font-normal">
                  {r.crop}
                </th>
                <td className="px-3 py-2 text-right tabular-nums">{formatNumber(r.accessions)}</td>
                <td className="px-3 py-2">{r.assembly}</td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <time dateTime={r.released}>{formatDate(r.released)}</time>
                </td>
                <td className="px-3 py-2">
                  <a href={r.doi} className="u-link">
                    {r.doi.replace("https://doi.org/", "")}
                  </a>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2">
                    <span aria-hidden className={`size-3 border border-black/30 ${r.superseded ? "bg-(--p4)" : "bg-(--p2)"}`} />
                    {r.superseded ? "Superseded" : "Current"}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4">
                  No releases match. Clear the crop filter or include superseded releases.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
