export type Rect = { x: number; y: number; w: number; h: number };
export type Tile<T> = Rect & { item: T };

type Cell<T> = { item: T; area: number };

/** Worst aspect ratio in a row of cells laid along a side of length `side` (Bruls et al. 2000). */
function worst<T>(row: readonly Cell<T>[], side: number) {
  const areas = row.map((c) => c.area);
  const sum = areas.reduce((a, b) => a + b, 0);
  const max = Math.max(...areas);
  const min = Math.min(...areas);
  return Math.max(
    (side * side * max) / (sum * sum),
    (sum * sum) / (side * side * min),
  );
}

/**
 * Squarified treemap (Bruls, Huizing and van Wijk). Lays `items` into `bounds` with tile area
 * proportional to `value`, largest first, keeping tiles as close to square as it can.
 * Units are whatever `bounds` uses, so callers usually divide by bounds.w / bounds.h for percentages.
 */
export function squarify<T>(
  items: readonly T[],
  value: (item: T) => number,
  bounds: Rect,
): Tile<T>[] {
  const total = items.reduce((sum, item) => sum + value(item), 0);
  const scale = (bounds.w * bounds.h) / total;
  const queue = items
    .map((item) => ({ item, area: value(item) * scale }))
    .sort((a, b) => b.area - a.area);

  const tiles: Tile<T>[] = [];
  let free = { ...bounds };
  let row: Cell<T>[] = [];

  // Fix a finished row along the shorter side of the free space, then shrink the free space.
  const place = (cells: readonly Cell<T>[]) => {
    const sum = cells.reduce((s, c) => s + c.area, 0);
    if (free.w >= free.h) {
      const w = sum / free.h;
      let y = free.y;
      for (const { item, area } of cells) {
        tiles.push({ item, x: free.x, y, w, h: area / w });
        y += area / w;
      }
      free = { x: free.x + w, y: free.y, w: free.w - w, h: free.h };
    } else {
      const h = sum / free.w;
      let x = free.x;
      for (const { item, area } of cells) {
        tiles.push({ item, x, y: free.y, w: area / h, h });
        x += area / h;
      }
      free = { x: free.x, y: free.y + h, w: free.w, h: free.h - h };
    }
  };

  for (const cell of queue) {
    const side = Math.min(free.w, free.h);
    if (row.length === 0 || worst([...row, cell], side) <= worst(row, side)) {
      row.push(cell);
    } else {
      place(row);
      row = [cell];
    }
  }
  if (row.length > 0) place(row);

  return tiles;
}
