// Circle packing written out by hand: the front-chain sibling packing of Wang et al. (2006) and
// Welzl's smallest enclosing circle, the same pair of rules d3.pack uses, with a seeded shuffle so
// the same content always packs the same way on the server and in the browser.

export type Circle = { x: number; y: number; r: number };

/** Small fast PRNG, seeded so every render grows the same head. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a hash of a string, for seeding. */
export function hashSeed(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return h >>> 0;
}

// ---- Placement -----------------------------------------------------------------------------

/** Puts c tangent to both a and b, on the outside of the chain running a to b. */
function place(b: Circle, a: Circle, c: Circle) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d2 = dx * dx + dy * dy;
  if (!d2) {
    c.x = a.x + c.r;
    c.y = a.y;
    return;
  }
  const a2 = (a.r + c.r) ** 2;
  const b2 = (b.r + c.r) ** 2;
  if (a2 > b2) {
    const x = (d2 + b2 - a2) / (2 * d2);
    const y = Math.sqrt(Math.max(0, b2 / d2 - x * x));
    c.x = b.x - x * dx - y * dy;
    c.y = b.y - x * dy + y * dx;
  } else {
    const x = (d2 + a2 - b2) / (2 * d2);
    const y = Math.sqrt(Math.max(0, a2 / d2 - x * x));
    c.x = a.x + x * dx - y * dy;
    c.y = a.y + x * dy + y * dx;
  }
}

function intersects(a: Circle, b: Circle) {
  const dr = a.r + b.r - 1e-6;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dr > 0 && dr * dr > dx * dx + dy * dy;
}

type Link = { c: Circle; next: Link; prev: Link };

/** Squared distance from the origin to the weighted midpoint of a link and its successor. */
function score(node: Link) {
  const a = node.c;
  const b = node.next.c;
  const ab = a.r + b.r;
  const dx = (a.x * b.r + b.x * a.r) / ab;
  const dy = (a.y * b.r + b.y * a.r) / ab;
  return dx * dx + dy * dy;
}

const link = (c: Circle) => {
  const node = { c } as Link;
  node.next = node.prev = node;
  return node;
};

/**
 * Packs circles (given r) around the origin in input order, sets each x and y, centres the result
 * on its enclosing circle and returns that circle's radius. Each new circle goes tangent to the
 * pair on the front chain nearest the centre; if it overlaps the chain, the chain is cut and it tries again.
 */
export function packSiblings(circles: Circle[], random: () => number): number {
  const n = circles.length;
  if (!n) return 0;
  const a = circles[0];
  a.x = 0;
  a.y = 0;
  if (n === 1) return a.r;
  const b = circles[1];
  a.x = -b.r;
  b.x = a.r;
  b.y = 0;
  // Two circles side by side are already centred on their enclosing circle.
  if (n === 2) return a.r + b.r;
  place(b, a, circles[2]);

  let la = link(a);
  let lb = link(b);
  let lc = link(circles[2]);
  la.next = lc.prev = lb;
  lb.next = la.prev = lc;
  lc.next = lb.prev = la;

  pack: for (let i = 3; i < n; ++i) {
    place(la.c, lb.c, circles[i]);
    lc = link(circles[i]);
    let j = lb.next;
    let k = la.prev;
    let sj = lb.c.r;
    let sk = la.c.r;
    do {
      if (sj <= sk) {
        if (intersects(j.c, lc.c)) {
          lb = j;
          la.next = lb;
          lb.prev = la;
          --i;
          continue pack;
        }
        sj += j.c.r;
        j = j.next;
      } else {
        if (intersects(k.c, lc.c)) {
          la = k;
          la.next = lb;
          lb.prev = la;
          --i;
          continue pack;
        }
        sk += k.c.r;
        k = k.prev;
      }
    } while (j !== k.next);

    // Insert c between a and b, then move a to the chain link nearest the centre.
    lc.prev = la;
    lc.next = lb;
    la.next = lb.prev = lb = lc;
    let best = score(la);
    let node = lc;
    while ((node = node.next) !== lb) {
      const s = score(node);
      if (s < best) {
        la = node;
        best = s;
      }
    }
    lb = la.next;
  }

  const chain = [lb.c];
  for (let node = lb.next; node !== lb; node = node.next) chain.push(node.c);
  const e = enclose(chain, random);
  for (const c of circles) {
    c.x -= e.x;
    c.y -= e.y;
  }
  return e.r;
}

// ---- Smallest enclosing circle (Welzl, move to front) -----------------------------------------

function enclosesNot(a: Circle, b: Circle) {
  const dr = a.r - b.r;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dr < 0 || dr * dr < dx * dx + dy * dy;
}

function enclosesWeak(a: Circle, b: Circle) {
  const dr = a.r - b.r + Math.max(a.r, b.r, 1) * 1e-9;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dr > 0 && dr * dr > dx * dx + dy * dy;
}

const enclosesWeakAll = (a: Circle, basis: Circle[]) => basis.every((b) => enclosesWeak(a, b));

function basis2(a: Circle, b: Circle): Circle {
  const x21 = b.x - a.x;
  const y21 = b.y - a.y;
  const r21 = b.r - a.r;
  const l = Math.sqrt(x21 * x21 + y21 * y21);
  return { x: (a.x + b.x + (x21 / l) * r21) / 2, y: (a.y + b.y + (y21 / l) * r21) / 2, r: (l + a.r + b.r) / 2 };
}

function basis3(a: Circle, b: Circle, c: Circle): Circle {
  const { x: x1, y: y1, r: r1 } = a;
  const a2 = x1 - b.x;
  const a3 = x1 - c.x;
  const b2 = y1 - b.y;
  const b3 = y1 - c.y;
  const c2 = b.r - r1;
  const c3 = c.r - r1;
  const d1 = x1 * x1 + y1 * y1 - r1 * r1;
  const d2 = d1 - b.x * b.x - b.y * b.y + b.r * b.r;
  const d3 = d1 - c.x * c.x - c.y * c.y + c.r * c.r;
  const ab = a3 * b2 - a2 * b3;
  const xa = (b2 * d3 - b3 * d2) / (ab * 2) - x1;
  const xb = (b3 * c2 - b2 * c3) / ab;
  const ya = (a3 * d2 - a2 * d3) / (ab * 2) - y1;
  const yb = (a2 * c3 - a3 * c2) / ab;
  const A = xb * xb + yb * yb - 1;
  const B = 2 * (r1 + xa * xb + ya * yb);
  const C = xa * xa + ya * ya - r1 * r1;
  const r = -(Math.abs(A) > 1e-6 ? (B + Math.sqrt(B * B - 4 * A * C)) / (2 * A) : C / B);
  return { x: x1 + xa + xb * r, y: y1 + ya + yb * r, r };
}

function basisCircle(basis: Circle[]): Circle {
  if (basis.length === 1) return { ...basis[0] };
  if (basis.length === 2) return basis2(basis[0], basis[1]);
  return basis3(basis[0], basis[1], basis[2]);
}

function extendBasis(basis: Circle[], p: Circle): Circle[] {
  if (enclosesWeakAll(p, basis)) return [p];
  for (const b of basis) {
    if (enclosesNot(p, b) && enclosesWeakAll(basis2(b, p), basis)) return [b, p];
  }
  for (let i = 0; i < basis.length - 1; ++i) {
    for (let j = i + 1; j < basis.length; ++j) {
      const [bi, bj] = [basis[i], basis[j]];
      if (
        enclosesNot(basis2(bi, bj), p) &&
        enclosesNot(basis2(bi, p), bj) &&
        enclosesNot(basis2(bj, p), bi) &&
        enclosesWeakAll(basis3(bi, bj, p), basis)
      ) {
        return [bi, bj, p];
      }
    }
  }
  throw new Error("enclose: no basis found");
}

/** Smallest circle containing every circle given. */
export function enclose(circles: Circle[], random: () => number): Circle {
  const list = [...circles];
  for (let m = list.length; m; ) {
    const i = Math.floor(random() * m--);
    [list[m], list[i]] = [list[i], list[m]];
  }
  let basis: Circle[] = [];
  let e: Circle | null = null;
  for (let i = 0; i < list.length; ) {
    const p = list[i];
    if (e && enclosesWeak(e, p)) ++i;
    else {
      basis = extendBasis(basis, p);
      e = basisCircle(basis);
      i = 0;
    }
  }
  return e ?? { x: 0, y: 0, r: 0 };
}

// ---- Hierarchy -----------------------------------------------------------------------------

/** A node of a packed tree. Leaves come with r; parents get r from packing their children. */
export type PackNode<T> = Circle & { data: T; depth: number; children?: PackNode<T>[] };

export type Tree<T> = { data: T; r?: number; children?: Tree<T>[] };

/**
 * Packs a tree bottom up (siblings sit `2 × padding(depth)` apart, and each parent is the enclosing
 * circle of its packed children plus `padding(depth) + inset(depth)`), then walks top down to give
 * every node absolute coordinates. Inset leaves a margin inside a parent without spreading its children.
 */
export function packTree<T>(
  tree: Tree<T>,
  padding: (depth: number) => number,
  seed: number,
  inset: (depth: number) => number = () => 0,
): PackNode<T> {
  const random = mulberry32(seed);
  const build = (t: Tree<T>, depth: number): PackNode<T> => {
    if (!t.children?.length) return { data: t.data, depth, x: 0, y: 0, r: t.r ?? 1 };
    const children = t.children.map((c) => build(c, depth + 1));
    const pad = padding(depth);
    for (const c of children) c.r += pad;
    const r = packSiblings(children, random);
    for (const c of children) c.r -= pad;
    return { data: t.data, depth, x: 0, y: 0, r: r + pad + inset(depth), children };
  };
  const root = build(tree, 0);
  const place = (node: PackNode<T>, ox: number, oy: number) => {
    node.x = round(node.x + ox);
    node.y = round(node.y + oy);
    node.r = round(node.r);
    node.children?.forEach((c) => place(c, node.x, node.y));
  };
  // Children hold offsets from their parent until this pass.
  const shift = (node: PackNode<T>) => node.children?.forEach((c) => place(c, node.x, node.y));
  root.x = 0;
  root.y = 0;
  shift(root);
  root.r = round(root.r);
  return root;
}

/** Rounded so server and client markup agree to the digit. */
const round = (v: number) => Math.round(v * 1000) / 1000;
