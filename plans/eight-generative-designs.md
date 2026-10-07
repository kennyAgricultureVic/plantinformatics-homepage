# Plan: eight generative growth designs

Goal: a third run of eight front page directions at `/designs/<slug>`, in the family of `lsystem` and `phyllotaxis`: the page is drawn by a rule taken from how plants grow or are built, and the content is the input to that rule. They are for inspiration rather than polish. All eight read the same content from `@/content`, and each has a Sanzo Wada colour palette picker at the bottom of the page.

Read `src/app/designs/lsystem/` and `src/app/designs/phyllotaxis/` before starting. What they share, and what every design in this run keeps:

- **One generative rule** carries the whole page, from hero to footer, at different scales.
- **Data drives the drawing:** marks are counted or sized from `dataReleases`, `crops`, `tools` and `news` (one mark per N accessions, one branch per tool, and so on), so the picture is a chart as well as an image. Say the mapping somewhere on the page in plain words.
- **Seeded and deterministic:** the same content always grows the same picture (a seeded PRNG such as `mulberry32(hashSeed(...))`), so server and client agree and screenshots are stable.
- **Typography like a mathematical plate:** a strong display face, the rule itself shown as a small formula, grammar or parameter set where it helps.
- **Motion:** growth animates once on load or on scroll, then stops. Nothing repaints continuously. With `prefers-reduced-motion`, draw the finished state.

## Rules for every design

Follow `AGENTS.md` and the "Rules for every design" in `plans/eleven-more-designs.md` (shared structure, colour, preferences). In short:

- section ids `about`, `tools`, `data`, `news`, a footer with `funding`, `<ThemeToggle />`, `<PalettePicker />` last
- every palette colour from `var(--p1)`..`var(--p4)` or `usePalette()` in canvas and SVG code
- no cream or off-white backgrounds, no italic accent words in headings, no "01 / 02 / 03" labels, no monospace labels, no pill-shaped buttons
- light mode ground is pure white, dark mode true black with white text
- no new npm packages: canvas, SVG and plain TypeScript are enough for every rule here

## Fonts

No display face may repeat one already used: Antonio, Archivo Narrow, Big Shoulders, Bodoni Moda, Bricolage Grotesque, Cormorant Garamond, Courier Prime, Dela Gothic One, DM Mono, Fraunces, Homemade Apple, IBM Plex Sans/Mono, Instrument Sans/Serif, Inter Tight, JetBrains Mono, Libre Franklin, Manrope, Martian Mono, Newsreader, Outfit, Pixelify Sans, Playfair Display, Saira Condensed, Sora, Space Grotesk, Space Mono, Spline Sans Mono, Syne, Unbounded, UnifrakturMaguntia. Each design below is assigned a face so parallel agents do not collide; swap only to a face that is in neither list.

## Phase 0: scaffolding (done before Phase 1)

1. Registry entries carry a `run`, and the index page (`/`) groups designs by run.
2. Eight placeholder folders and their `registry.ts` entries, so Phase 1 agents never edit the registry.

## Phase 1: eight designs in parallel (eight agents)

Each agent owns only `src/app/designs/<slug>/`. Agents must not touch `src/content`, `src/components`, `registry.ts` or `package.json`; if shared code needs a change, report it instead. Work in the main checkout, do not commit, do not run `next build`. Check with `bunx tsc --noEmit` and `bunx eslint src/app/designs/<slug>`, then screenshot the route on the shared dev server in light and dark, desktop and mobile, with at least two palettes.

### 1. `venation`: Leaf venation (display face: Young Serif)
Veins grown by the space colonisation algorithm (Runions et al.): attractor points scattered inside a leaf outline, vein nodes grow toward them and stop when reached.
- **Hero:** one large leaf whose blade is filled with attractors, one per N accessions, so the vein density is the data. Veins thicken toward the midrib (pipe model).
- **Tools:** each tool a smaller leaf with a different outline (lanceolate, ovate, cordate, linear), grown from its own seed.
- **Data:** one leaf per release, area proportional to accessions, laid out like a pressed sequence.
- **News:** a single midrib with each item a secondary vein, newest at the tip.
- **Palette:** blade fills from `--p*`, veins in the theme ink.

### 2. `turing`: Reaction-diffusion (display face: Darker Grotesque)
Gray-Scott reaction-diffusion, the Turing patterns behind spots and stripes on leaves and seed coats.
- **Hero:** a canvas pattern seeded from the data releases (one seed patch per release, placed by crop), run for a fixed number of steps then frozen. Feed and kill rates shown as the formula.
- **Sections:** each section uses a different (feed, kill) pair so the pattern changes from spots to stripes to labyrinth down the page. Tools are swatches of one regime each.
- **Data:** a strip per release whose pattern density scales with accessions.
- **Palette:** the two chemical concentrations mapped across `--p1`..`--p4` via `usePalette()`.
- **Performance:** simulate on a small grid (for example 200 × 200) in a typed array, scale up the canvas, stop after N steps. No WebGL needed.

### 3. `roots`: Root architecture (display face: Spectral)
The page grows downward like a root system, using diffusion-limited aggregation or a stochastic branching root model.
- **Hero:** the soil line near the top of the viewport with a short shoot above; below it the root system, one root tip per N accessions, coloured by crop.
- **Scroll:** sections sit at increasing depth with a depth scale in centimetres down the margin. Roots continue between sections.
- **Tools:** each tool is a nodule or lateral root zone with its label.
- **Data:** soil horizons, one band per release, thickness by accessions.
- **Palette:** soil horizons and root inks from `--p*`.

### 4. `tissue`: Plant tissue (display face: Figtree)
A Voronoi tessellation read as a microscope section of plant cells, with Lloyd relaxation for the even look of real tissue.
- **Hero:** a cross-section of a stem or seed, one cell per N accessions, cells grouped into tissue zones by crop, cell walls as hairlines.
- **Tools:** each tool a cell type (guard cell pair, xylem vessel, parenchyma, trichome) drawn from the same tessellation.
- **Data:** a cell-count table beside a slice whose zones are sized by accessions.
- **Interaction:** hovering a cell highlights its zone and shows the release.
- **Palette:** stain colours, as if the section were stained, from `--p*`.

### 5. `fern`: Iterated function systems (display face: Gloock)
The Barnsley fern and related IFS fractals: a few affine maps, applied at random, draw a frond.
- **Hero:** a fern plotted with exactly one point per genotyped accession, the four maps' probabilities shown as a small table.
- **Tools:** each tool a different IFS (fern, tree, spleenwort, maple seed), each drawn with its own map set.
- **Data:** one frond per release with point count equal to accessions, so frond fullness is the count.
- **News:** fiddleheads (unrolled spirals) along a timeline.
- **Palette:** point colour by which map produced it, across `--p1`..`--p4`.

### 6. `wind`: Wind over a crop (display face: Epilogue)
A flow field (seeded value or simplex noise implemented locally) blowing across a field of stems.
- **Hero:** a field of stems, one per N accessions, each bent by the field, with streamlines tracing the wind through them. The pointer adds a local gust that settles back.
- **Sections:** the field continues behind the content in calmer weather down the page; each section's heading notes its "wind speed", which is a real data value (accessions, tool count, items).
- **Data:** each release a row of stems whose density is accessions.
- **Motion:** the gust responds to the pointer and decays to rest; no continuous animation when idle.
- **Palette:** stem inks by crop and streamlines from `--p*`.

### 7. `packing`: Seed packing (display face: Red Hat Display)
Circle packing, the way seeds fill a head or pod.
- **Hero:** a packed circle of seeds, one circle per release nested inside crop circles, sized by accessions (hierarchical circle packing implemented locally, no d3).
- **Tools:** each tool a pod with its seeds packed inside.
- **Data:** the packing again as a key, with exact counts beside each circle.
- **Interaction:** hovering a circle names it; clicking a crop zooms the packing to it.
- **Palette:** crop circles from `--p*`, seeds lighter or darker.

### 8. `superformula`: Gielis superformula (display face: Schibsted Grotesk)
Johan Gielis' superformula, which draws many leaf, flower and seed outlines from six parameters.
- **Hero:** one large shape morphing once on load from a circle to a flower whose symmetry `m` is the number of crops and whose other parameters come from the data, with the formula written out.
- **Tools:** each tool a shape with its own parameter set, shown beside it.
- **Data:** one outline per release, size by accessions, overlaid like a seed atlas.
- **News:** a row of small shapes, one per item, changing step by step.
- **Palette:** fills and strokes from `--p*`.

## Phase 2: integration (one agent)

1. Run `bun run build` and `bun run lint`, and fix any integration breaks.
2. Screenshot every new design in both themes and check it against the rules. Fix trivial violations directly.
3. Commit to `main` as one commit per design, so a design can be dropped cleanly.
