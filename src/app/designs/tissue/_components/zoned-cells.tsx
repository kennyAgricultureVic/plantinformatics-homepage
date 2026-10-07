import { memo } from "react";
import { stain, stainStrength, type Zone, type cellLooks } from "./tissue";
import { pathOf, type Cell } from "./voronoi";

const r1 = (v: number) => Math.round(v * 10) / 10;

type Props = {
  cells: readonly Cell[];
  owner: Uint8Array;
  zones: readonly Zone[];
  looks: ReturnType<typeof cellLooks>;
  /** Zones drawn as unstained tissue (walls only). */
  unstained?: (zone: Zone) => boolean;
};

/**
 * Stained cells grouped by zone: each zone is a <g data-zone> so hover can find it, each cell
 * a wall polygon with a stain fill of its own strength and, mostly, a nucleus.
 */
export const ZonedCells = memo(function ZonedCells({ cells, owner, zones, looks, unstained }: Props) {
  return zones.map((zone, z) => {
    const plain = unstained?.(zone) ?? false;
    return (
      <g key={zone.key} data-zone={z} className="tissue-zone">
        {cells.map((cell, i) => {
          if (owner[i] !== z || cell.poly.length < 3) return null;
          const look = looks[i];
          const size = Math.sqrt(cell.area);
          return (
            <g key={i}>
              <path
                d={pathOf(cell.poly)}
                fill={plain ? "transparent" : stain(zone.slot)}
                fillOpacity={plain ? 1 : r1(stainStrength(zone.slot, look.jitter) * 100) / 100}
                className="tissue-wall"
              />
              {look.hasNucleus && (
                <circle
                  cx={r1(cell.centroid[0] + look.nucleus[0] * size * 0.3)}
                  cy={r1(cell.centroid[1] + look.nucleus[1] * size * 0.3)}
                  r={r1(size * 0.15)}
                  className={plain ? "tissue-nucleus-plain" : "tissue-nucleus"}
                />
              )}
            </g>
          );
        })}
      </g>
    );
  });
});
