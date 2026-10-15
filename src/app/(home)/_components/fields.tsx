"use client";

// Client wrappers that import the stem sets directly, so the page does not
// serialise hundreds of stems into the server payload.

import { dataReleases, formatNumber, news, totalAccessions } from "@/content";
import { WindCanvas } from "./wind-canvas";
import { heroStems, newsStems, releaseRows, totalStems, windSpeed } from "./wind";

export function HeroField({ fieldFrom }: { fieldFrom: string }) {
  return (
    <WindCanvas
      stems={heroStems}
      speed={windSpeed(totalAccessions)}
      seed="hero"
      stemHeight={0.92}
      rows={0.32}
      fullAt={1280}
      gusty
      fieldFrom={fieldFrom}
      label={`A field of ${formatNumber(totalStems)} stems, one per 100 genotyped accessions, coloured by crop`}
      className="absolute inset-0"
    />
  );
}

export function ReleaseField({ index }: { index: number }) {
  const row = releaseRows[index];
  return (
    <WindCanvas
      stems={row.stems}
      speed={windSpeed(dataReleases.length)}
      seed={row.release.doi}
      stemHeight={0.82}
      rows={0.35}
      weight={0.9}
      fullAt={800}
      gusty
      label={`${row.stems.length} stems for ${formatNumber(row.release.accessions)} ${row.release.crop.toLowerCase()} accessions`}
      className="h-20 sm:h-24"
    />
  );
}

export function NewsField() {
  return (
    <WindCanvas
      stems={newsStems}
      speed={windSpeed(news.length)}
      seed="news"
      stemHeight={0.75}
      rows={0}
      weight={2.2}
      gusty
      label={`${news.length} stems on a timeline, one per news item, oldest on the left`}
      className="h-40 sm:h-52"
    />
  );
}
