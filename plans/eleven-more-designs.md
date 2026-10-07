# Plan: eleven more homepage design previews

Goal: eleven more front page directions at `/designs/<slug>`, each a design style not already covered by the first ten (`chromosome`, `poster`, `phyllotaxis`, `lsystem`, `herbarium`, `trial-plots`, `brutal`, `seed-to-data`, `gazette`, `circos`). They are for inspiration rather than polish. All eleven read the same content from `@/content`, and each has a Sanzo Wada colour palette picker at the bottom of the page.

## Rules for every design

Follow `AGENTS.md` (layout, preferences and "Creating a new design"). On top of that:

- **Shared structure:**
  - section ids `about`, `tools`, `data`, `news`
  - a footer with `funding`
  - `<ThemeToggle />`, with dark mode through the `dark:` variant
  - `<PalettePicker />` as the last thing on the page
- **Colour:** every colour that comes from the palette is read from `var(--p1)` to `var(--p4)` (or `usePalette()` in canvas, SVG and WebGL code). Nothing hardcoded that would ignore the picker.
- **Fonts:** no two designs share a display face, including the faces already used by the first ten.
- **Preferences:** no cream or off-white backgrounds, no italic accent words in headings, no "01 / 02 / 03" section labels, no monospace labels, no pill-shaped buttons. Designs that borrow from a style which usually has these (blueprints, pixel art, dashboards) find another way to say it.

## Resource: Hairline figures

`hairline-figures/` holds seven animated isometric line figures drawn with the Hairline engine (`@lucasmarkes/hairline`): `barley`, `chickpea`, `dna`, `lentil`, `lupin`, `pea` and `wheat`. Each `<name>.js` is the figure; each `hairline-<name>.html` is a self-contained page with the kernel (`<script id="hl-kernel">`) and a working bench, useful for seeing what a figure does. Every figure is a single-stroke drawing in a 400 × 320 viewBox that answers the pointer (a wheat spikelet flares open under the cursor, and so on), with one `intensity` value for its main parameter.

Any design may draw on them where a dynamic, pointer-driven illustration helps: a hero, a tool card, a section divider, an empty state. They are a resource, not a requirement. Designs that lean on them are marked below.

- Use the shared `<Hairline figure="wheat" />` component from Phase 0, not a copy of the kernel.
- Stroke and fill come from CSS variables, so map them to `--p*` or the theme ink. Do not keep the bench page's monospace tags, sliders or theme button.
- A design that needs a figure that does not exist (a seed, a microscope, a field plot) can make one with the `hairline-create` skill, saving it as `src/app/designs/<slug>/_figures/<name>.js`. Read the skill's `rules.md` first.

## Phase 0: shared infrastructure (one agent, before Phase 1)

1. Port the Hairline kernel into `src/components/hairline/` as a client component `<Hairline figure intensity className />`:
   - the kernel loaded once, the seven figures registered from `hairline-figures/*.js`
   - `--ground` and `--ink` taken from the surrounding CSS, so a design can set them from the palette
   - mounts on the client only, and calls `destroy()` on unmount
   - respects `prefers-reduced-motion`
2. Add `/designs/hairline-check` (not in `registry.ts`) showing all seven figures in both themes, to prove the port.
3. Add the eleven placeholder folders and their `registry.ts` entries, so Phase 1 agents never edit the registry.
4. `bun run build` passes. Commit to `main`.

## Phase 1: eleven designs in parallel (eleven agents)

Each agent owns only `src/app/designs/<slug>/`: its `page.tsx`, a `layout.tsx` for fonts, `_components/`, `_figures/` and local CSS. Agents must not touch `src/content`, `src/components` or `registry.ts`; if shared code needs a change, the agent reports it instead of making it.

### New packages and worktrees

Agents may add npm packages when the design needs them (for example `three` with `@react-three/fiber`, `d3-contour`, `motion`). Adding a package changes `package.json` and `bun.lock`, which would collide with the other agents, so an agent that adds one:

1. Works in its own git worktree on a branch named `design/<slug>`, created from `main`.
2. Runs `bun add <package>` there, and only adds what the design actually uses.
3. Runs its own dev server on a free port inside the worktree for screenshots.
4. Commits on the branch and reports the branch name and the packages added, so Phase 2 can merge it into `main`.

Agents that add no packages work directly in the main checkout and use the shared dev server.

### Checks

Agents don't run `next build`, because eleven builds at once would fight over `.next/`. Each one runs `bunx tsc --noEmit` and `bunx eslint src/app/designs/<slug>`. Each then screenshots its route in light and dark mode, at desktop and mobile widths, and with at least two palettes.

### 1. `isometric`: Isometric research station (Hairline-led)
The whole page is one isometric world drawn in the Hairline line style.
- **Hero:** an isometric campus of glasshouse, field plots, seed store and server rack, each a building block you can hover. The crop figures stand in the field plots.
- **Sections:** each section is a room or plot in the same world, reached by panning the camera on scroll. Tools are machines on benches, data releases are stacked seed crates sized by accession count, news is a noticeboard.
- **Palette:** fills the plates between lines, one colour per zone.
- **Mobile:** drops the pan and stacks the rooms vertically.

### 2. `swiss`: International Typographic Style
Restraint as the idea, the opposite of `brutal`.
- **Grid:** a visible 12-column modular grid, flush-left ragged-right text, one grotesque family at three or four sizes only.
- **Hero:** asymmetric composition of the site name, one large statistic and one Hairline figure placed on the grid.
- **Tools:** a strict table-like grid of name, one-line purpose and link. Data releases as a typographic table with right-aligned figures.
- **Palette:** one palette colour as the single accent field per section; everything else black and white.

### 3. `bento`: Bento dashboard (Hairline-led)
The homepage as a grid of tiles of mixed sizes.
- **Tiles:** a large hero tile with the accession total, one tile per tool, one per data release, a news ticker tile and a funding tile. Each tool or crop tile holds a Hairline figure that wakes on hover.
- **Detail:** clicking a tile expands it in place to full content, and the grid reflows with a layout animation.
- **Palette:** each tile takes one of `--p1`..`--p4` as its ground, with matching `--p*-fg` text.
- **Mobile:** a single column of tiles in priority order.

### 4. `blueprint`: Technical drawing
The page is a set of engineering sheets.
- **Sheets:** each section is a drawing sheet with a border, a title block (drawing title, sheet number as a word, scale, date from the latest news) and a revision table built from news items.
- **Drawings:** tools are drawn as orthographic projections with dimension lines and leader callouts. Hairline figures are a good fit here as the line drawings.
- **Data releases:** a parts list (bill of materials) with accession counts as quantities.
- **Palette:** the sheet ground and line colour come from the palette, so a palette swap is a different print process (blueprint, diazo, sepia).

### 5. `riso`: Risograph zine
A small-press print run.
- **Print:** two or three spot inks from the palette, overprinted with `mix-blend-mode: multiply` (screen in dark mode), halftone shading, grain texture and slight misregistration between layers.
- **Layout:** spreads with hand-placed photos (placeholders halftoned) and big cut-out headings.
- **Data releases:** bar charts drawn as overprinted ink bars.
- **Palette:** each palette colour is an ink drum. Changing palettes is a reprint.

### 6. `zoom`: Powers of ten
One continuous zoom from paddock to molecule.
- **Scroll:** each section is a scale step, about ten times closer than the last: field trial (about), single plant (tools), seed (data), cell and chromosome (news), DNA helix (footer).
- **Imagery:** drawn vector scenes that cross-fade as the scale changes, with a scale bar that updates as you scroll. The `dna` Hairline figure closes the descent.
- **Motion:** scroll-driven only, with no autoplay.
- **Palette:** shifts one step per scale.

### 7. `orbit`: 3D WebGL scene
A real-time 3D scene is the hero.
- **Scene:** a slowly rotating seed or grain head in 3D with one particle per thousand genotyped accessions orbiting it, grouped and coloured by crop.
- **Interaction:** dragging rotates, and hovering a crop cluster shows its release. Sections below are plain, with small 3D thumbnails of each tool.
- **Packages:** likely `three` and `@react-three/fiber` (use a worktree, see above).
- **Fallback:** a static image of the scene when WebGL is missing or motion is reduced.
- **Palette:** read with `usePalette()` and applied to materials and lights.

### 8. `exhibit`: Museum exhibition (Hairline-led)
The site as a gallery visit.
- **Layout:** a horizontally scrolling gallery wall on desktop. Each tool is an exhibit: a Hairline figure on a plinth (the figures already stand on round bases), lit by a soft spotlight, with a wall placard of name, purpose and year.
- **Data releases:** a vitrine of catalogued objects with acquisition numbers.
- **News:** the "current exhibitions" board at the entrance.
- **Palette:** wall colours change room by room.
- **Mobile:** the wall becomes a vertical walk.

### 9. `pixel`: Pixel art farm
A small 16-bit farming world, playful but readable.
- **Hero:** a pixel field where each crop row grows in proportion to its accession count, with day and night tied to the theme toggle.
- **Sections:** tools are buildings you can walk a character to (arrow keys or click), each opening a dialogue box with its description. Data releases are a harvest ledger, news a village noticeboard.
- **Type:** a pixel display face for headings only; body text stays a readable sans. Crisp rendering with `image-rendering: pixelated`.
- **Palette:** quantised to the four palette colours plus black and white, like a limited console palette.

### 10. `contour`: Topographic survey
The data as landscape.
- **Hero:** a contour map generated from the data releases: each release is a hill whose height is its accession count, rendered as contour lines (marching squares, for example `d3-contour`) with spot heights.
- **Sections:** waypoints on a route across the map, with the map panning to each as you scroll. Tools are survey stations, news is a field log along the trail.
- **Interaction:** hovering the map shows the nearest release and its elevation.
- **Palette:** hypsometric tints, low to high across `--p1`..`--p4`.

### 11. `utilitarian`: Utilitarian
Function first, nothing decorative. The page is a tool, not a showcase.
- **Look:** system font stack, one text size for body and two for headings, square-cornered 1px borders, generous hit targets, no imagery or animation that does not carry information. Close in spirit to a well-made government service or an instrument manual.
- **Layout:** a persistent left index of every section and tool on desktop (a plain top list on mobile), dense content on the right. Every tool shows what it does, who it is for, a launch link, docs link and status, in the same order every time.
- **Data releases:** a sortable, filterable table (crop, accessions, assembly, date, DOI) that works without JavaScript and is enhanced with it.
- **News:** a dated changelog list.
- **Palette:** used only where colour means something: `--p1` for links and focus, the others for status and crop keys. Large areas stay white (true black in dark mode).
- **Measure of success:** fastest page of the set to load and to find a tool's launch link, fully keyboard navigable.

## Phase 2: integration (one agent)

1. Merge every `design/<slug>` branch into `main`. Resolve `package.json` and `bun.lock` conflicts by keeping both sides' packages and re-running `bun install`, then remove the worktrees.
2. Run `bun run build` and `bun run lint` across all designs, and fix any integration breaks.
3. Screenshot every new design in both themes and check each against the rules list. Send violations back to the owning agent, or fix trivial ones directly.
4. Commit to `main` as one commit per design (merge commits count), so a design can be dropped cleanly.

## Open points

- **Hairline colours:** the figures are drawn for a white or near-black ground. Check they stay legible on saturated palette grounds, and fall back to the theme ground behind the figure if not.
- **Bundle weight:** `orbit` and any other WebGL or animation packages load only on their own route, not on the index.
- **Tool screenshots:** only Fairybread has one. The others use `ImagePlaceholder`, a Hairline figure or the design's own drawn stand-in.
