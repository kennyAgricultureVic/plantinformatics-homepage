/**
 * Lentil: a shallow dish of 37 lentils lying flat in a hex pack. The pointer
 * is projected onto the dish floor, and each seed rolls up on its edge, the
 * nearer the steeper, on its own spring: tipped right over, a lentil shows its
 * lens profile. At rest a few lean against each other near
 * the back of the dish. The slider is the reach, in world units.
 *
 * A seed is a biconvex lens: the hull of samples on its two domed faces, and
 * the near half of its rim as the crease.
 */
const {
  Cam, clamp, facing, fit, hull, open, poly, proj, ringAt, rrect, run, unproj,
  spring, stepS, mk, pointer, register, disposer,
} = HL;

const SP = 11, R = 4.8, T = 1.7, DR = 42, WH = 5, WT = 2.4, TILT = 1.45;
const VIEW = [0.612, 0.612, 0.5];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** The share of the full tilt at u reaches from the pointer: 1 → .31 at 42% → .09 beyond, as Terrain's. */
const falloff = (u) =>
  u <= 0 ? 1 : u <= 0.417 ? 1 - (u / 0.417) * 0.6875 : u <= 1 ? 0.3125 - ((u - 0.417) / 0.583) * 0.2185 : 0.094;

/** A lens at c whose face is spanned by the unit vectors a and b, normal n: its outline and the near half of its rim. */
function lens(P, c, a, b, n) {
  const at = (s, t, w) => P(c[0] + a[0] * s + b[0] * t + n[0] * w, c[1] + a[1] * s + b[1] * t + n[1] * w, c[2] + a[2] * s + b[2] * t + n[2] * w);
  const pts = [at(0, 0, T), at(0, 0, -T)], rim = [];
  for (let i = 0; i < 28; i++) {
    const th = (i / 28) * Math.PI * 2, ct = Math.cos(th), st = Math.sin(th);
    for (const rho of [0.45, 0.75, 0.92, 1]) {
      const h = T * (1 - 0.75 * rho * rho);
      pts.push(at(R * rho * ct, R * rho * st, h), at(R * rho * ct, R * rho * st, -h));
    }
    const out = [a[0] * ct + b[0] * st, a[1] * ct + b[1] * st, a[2] * ct + b[2] * st];
    rim.push({ p: at(R * ct, R * st, 0), f: dot(out, VIEW) > 0 });
  }
  return { sil: poly(hull(pts)), cr: open(run(rim, (q) => q.f).map((q) => q.p)) };
}

/** The dish, which never moves: `far` is painted before the seeds, `near` after them. */
function dish(P, front) {
  const outer = rrect(-DR, -DR, DR, DR, DR, 14), inner = rrect(-DR + WT, -DR + WT, DR - WT, DR - WT, DR - WT, 14);
  const LR = (pts) => (pts[0][0] <= pts[pts.length - 1][0] ? pts : pts.slice().reverse());
  const iF = LR(ringAt(P, run(inner, front), WH)), oT = LR(ringAt(P, run(outer, front), WH)), oB = LR(ringAt(P, run(outer, front), 0));
  return {
    far: [[poly(hull(ringAt(P, outer, 0).concat(ringAt(P, outer, WH)))), "sil"], [poly(ringAt(P, inner, WH)), "nf"]],
    near: [
      [poly([...iF, oT[oT.length - 1], ...oB.slice().reverse(), oT[0]]), "fo"],
      [open(oT), "nf lo"], [open(iF), "nf"], [open([oT[0], ...oB, oT[oT.length - 1]]), "nf sil"],
    ],
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 3.3);
  fit(C, [[-DR, -DR, 0], [DR, DR, 0], [DR, -DR, 0], [-DR, DR, 0], [-DR * 0.7, -DR * 0.7, R * 2 + WH]], 200, 166);
  const P = proj(C), front = facing(C);
  let reach = value, over = null;

  // 37 seats in a hex of radius three, numbered from the centre outwards, painted from the far corner
  const seats = [];
  for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) {
    if (Math.abs(q + r) > 3) continue;
    seats.push([SP * (q + r / 2), SP * r * 0.866]);
  }
  const num = seats.slice().sort((p, q) => Math.hypot(...p) - Math.hypot(...q) || Math.atan2(p[1], p[0]) - Math.atan2(q[1], q[0]));
  seats.sort((p, q) => p[0] + p[1] - q[0] - q[1]);

  const g = mk("g", {}, svg), paths = dish(P, front);
  for (const [d, cls] of paths.far) mk("path", { d, class: cls }, g);
  const seeds = seats.map(([x, y]) => {
    // rest: a drift of seeds tipped back against each other, toward the far left of the dish
    const k = 0.75 * Math.exp(-((x + 14) ** 2 + (y + 6) ** 2) / 220) + 0.06;
    const grp = mk("g", {}, g);
    return {
      x, y, n: num.findIndex((s) => s[0] === x && s[1] === y) + 1, k, sp: spring(k, { eps: 0.002 }),
      sil: mk("path", { class: "sil" }, grp), cr: mk("path", { class: "nf lo" }, grp), drawn: NaN,
    };
  });
  for (const [d, cls] of paths.near) mk("path", { d, class: cls }, g);

  /** Draws a seed tipped by its spring's angle, rolling up toward the right of the screen, so on edge it shows its lens. */
  function draw(s) {
    const al = clamp(s.sp.x, 0, TILT), dx = Math.SQRT1_2, dy = -Math.SQRT1_2;
    if (al === s.drawn) return;
    s.drawn = al;
    const n = [Math.sin(al) * dx, Math.sin(al) * dy, Math.cos(al)];
    const a = [Math.cos(al) * dx, Math.cos(al) * dy, -Math.sin(al)], b = [-dy, dx, 0];
    const z = R * Math.sin(al) + T * 0.4 * Math.cos(al) + 0.3;
    const q = lens(P, [s.x, s.y, z], a, b, n);
    s.sil.setAttribute("d", q.sil);
    s.cr.setAttribute("d", q.cr);
  }

  const B = register(stage, (dt) => {
    let m = false;
    for (const s of seeds) { if (stepS(s.sp, dt)) m = true; draw(s); }
    return m;
  });
  bag.add(B.unregister);

  const lead = seeds.reduce((a, b) => (b.k > a.k ? b : a));
  function retarget() {
    const near = (s) => Math.hypot(s.x - over[0], s.y - over[1]);
    const pick = over && Math.hypot(...over) < DR + 6 ? seeds.reduce((a, b) => (near(b) < near(a) ? b : a)) : null;
    for (const s of seeds) {
      s.sp.t = pick ? TILT * falloff(Math.hypot(over[0] - s.x, over[1] - s.y) / reach) : s.k;
    }
    for (const s of seeds) s.sil.classList.toggle("hi", s === (pick ?? lead));
    read.textContent = pick ? `seed ${String(pick.n).padStart(2, "0")}` : "rest";
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());
  retarget();

  return {
    set: (v) => { reach = v; if (over) retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "lentil",
  means: "A dish of lentils: the seeds near the pointer roll up on edge, the nearer the steeper, and show their lens.",
  rules: [1, 3, 5, 9],
  range: [16, 28, 46],
  mount,
});
