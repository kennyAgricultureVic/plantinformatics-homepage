"use client";

// Client wrappers that import the stem and streamline sets directly, so the page does not
// serialise hundreds of stems into the server payload.

import { dataReleases, formatNumber, news, tools, totalAccessions } from "@/content";
import { WindCanvas } from "./wind-canvas";
import { heroLines, heroStems, newsLines, newsStems, releaseRows, toolLines, totalStems, windSpeed } from "./wind";

export function HeroField({ fieldFrom }: { fieldFrom: string }) {
  return (
    <WindCanvas
      stems={heroStems}
      lines={heroLines}
      speed={windSpeed(totalAccessions)}
      seed="hero"
      stemHeight={0.92}
      rows={0.32}
      lineAlpha={0.4}
      gusty
      fieldFrom={fieldFrom}
      label={`A field of ${formatNumber(totalStems)} stems, one per 100 genotyped accessions, coloured by crop and bent by the wind`}
      className="absolute inset-0"
    />
  );
}

export function ToolsWind() {
  return (
    <WindCanvas
      lines={toolLines}
      speed={windSpeed(tools.length)}
      seed="tools"
      lineAlpha={0.9}
      lineWidth={1.5}
      label={`${toolLines.length} streamlines, one per tool capability, leaving from each tool's column`}
      className="h-28 sm:h-36"
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
      lines={newsLines}
      speed={windSpeed(news.length)}
      seed="news"
      stemHeight={0.75}
      rows={0}
      weight={2.2}
      lineAlpha={0.6}
      gusty
      label={`${news.length} stems on a timeline, one per news item, oldest on the left`}
      className="h-40 sm:h-52"
    />
  );
}
