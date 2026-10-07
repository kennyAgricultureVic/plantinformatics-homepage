# Plan: ten homepage design previews

Goal: ten bold, clearly different front page directions at `/designs/<slug>`, for inspiration rather than polish. All ten read the same content from `@/content`, and each has a Sanzo Wada colour palette picker at the bottom of the page.

## Rules for every design

Apply on top of the design rules in `AGENTS.md`.

- **Backgrounds:** pure white (`#fff`) in light mode and true black (`#000`) in dark mode. A palette colour can fill a full panel. No off-white, cream or paper tones.
- **Banned:**
  - italic accent words in headings
  - numbered section labels ("01 / 02 / 03", "No. 1", "§2")
  - monospace labels or eyebrows
  - pill-shaped buttons: buttons use square or slightly rounded corners, never `rounded-full`
  - em dashes
  - decorative cards and chips
  - light-grey subtitle lines above sections
- **Animation:** nothing repaints continuously. A one-off intro, scroll-driven changes or hover transitions are fine. Canvas drawing runs once and again on palette change or resize, and an intro animation finishes and stops. Respect `prefers-reduced-motion`.
- **Shared structure:**
  - section ids `about`, `tools`, `data`, `news`
  - a footer with `funding`
  - `<ThemeToggle />`
  - `<PalettePicker />` as the last thing on the page
- **Colour:** every colour that comes from the palette is read from `var(--p1)` to `var(--p4)` (or `usePalette()` in canvas code). Nothing hardcoded that would ignore the picker.

## Phase 0: shared infrastructure (one agent, before anything else)

1. **`src/content/wada.ts`:** a typed snapshot of the 159 colours and 348 combinations from `mattdesl/dictionary-of-colour-combinations` (MIT; credit it in a comment). Shape: `colors: { name, hex }[]` and `combinations: { id, colors: Hex[] }[]`, with `id` matching the book's combination number. Generate it with a small `scripts/wada.ts` (run with bun) so it can be regenerated, and commit the output.
2. **`src/components/palette/`:**
   - **`PaletteProvider`:** takes `defaultId` and `shortlist: number[]`. It writes `--p1`..`--p4` and `--p1-fg`..`--p4-fg` onto a wrapper element. Combinations with fewer than four colours repeat colours to fill the slots. The `-fg` value is black or white, picked by contrast. The provider remembers the chosen combination per design in `localStorage`, wrapped in try/catch.
   - **`usePalette()`:** returns `{ combination, colors, setId }` for canvas or SVG code that needs real hex values.
   - **`PalettePicker`:** a full-width strip at the bottom of the page. It shows the design's shortlist (6 to 10 combinations chosen to suit the design) as swatch groups, plus a "Random from the dictionary" button that picks from all 348. It shows the combination number and the colour names, so the source is credited. Built from plain buttons with square corners and keyboard support, styled neutrally so it fits any design. Each design passes `className` to adjust it.
3. **Registry:** add all ten entries to `src/app/designs/registry.ts` now, so the parallel agents never edit a shared file.
4. **Placeholder folders:** create each design folder with a placeholder `page.tsx`, so typed routes resolve from the start.
5. **Starter:** update the starter design to use the provider and picker, as a working example.
6. **`AGENTS.md`:** add the banned list above to the design rules.
7. **Verify:** `bun run build` passes. Start one dev server and record its port for the Phase 1 agents.

## Phase 1: ten designs in parallel (ten agents)

Each agent owns only `src/app/designs/<slug>/`: its `page.tsx`, a `layout.tsx` for fonts, `_components/`, and local CSS. Agents must not touch `src/content`, `src/components` or `registry.ts`; if shared code needs a change, the agent reports it instead of making it.

Agents don't run `next build`, because ten builds at once would fight over `.next/`. Each one runs `bunx tsc --noEmit` and `bunx eslint src/app/designs/<slug>`. Each then screenshots its route on the shared dev server in light and dark mode, at desktop and mobile widths, and with at least two palettes.

Each design picks fonts that suit its idea. No two designs share a display face.

### 1. `chromosome`: Genome browser
The whole page is a genome browser.
- **Header:** a chromosome ideogram with banded segments, one per section. It works as the navigation, and a locus cursor tracks scroll position.
- **Sections as tracks:** each section is a horizontal "track" with a coordinate ruler along the top edge.
  - Tools appear as gene models (exons and introns drawn as blocks and lines).
  - Data releases are coverage histograms scaled by accession count.
  - News is a feature track of ticks along a time axis.
- **Palette:** colours the tracks.

### 2. `poster`: Constructivist poster
Takes Wada's 1930s era literally.
- **Composition:** each section is a full-viewport poster built from flat palette fields, large geometric primitives (circles, quarter circles, diagonal bars) and heavy condensed sans type set at angles.
- **Stats:** shapes sized to the numbers.
- **Detail content:** sits in a strict grid underneath each poster.
- **Palette:** the most palette-driven of the ten. Changing palettes should feel like reprinting the poster.

### 3. `phyllotaxis`: Generative art, golden angle
- **Hero:** a canvas sunflower using Vogel's model (r = c·√n, θ = n·137.508°). It has one dot per genotyped accession: about 80k points drawn once on a single canvas.
- **Encoding:** dots are coloured by crop, in proportion to the real release counts, with crops mapped to palette colours.
- **Sections:** each section reuses the spiral at a different scale or crop, so a section shows only that crop's florets.
- **Intro:** grows outward once, from the centre to the full spiral.
- **Footnote:** a short note explains the maths (Fibonacci, golden angle).

### 4. `lsystem`: Generative art, L-system field
- **Hero:** a field of grasses and wheat heads grown from L-system grammars (axiom, rules, turtle interpretation, stochastic rules with a seeded PRNG).
- **Seeds and shading:** each crop gets its own grammar, the seed comes from the palette id (so a new palette grows a new field), and depth gives a horizon perspective.
- **Tools:** each tool is drawn as a single specimen plant beside its description.
- **Intro:** growth animates generation by generation once, then stops.
- **Grammars:** shown in small type next to the plants they grow.

### 5. `herbarium`: Herbarium sheets
- **Layout:** each tool is a mounted specimen sheet on a white ground. It has an SVG botanical line drawing, a determination label block in a classic serif, and a collector, date and accession line taken from news and release data.
- **Data releases:** read like a register of specimens.
- **Palette:** comes in as label ink and tape colours. Restrained and scholarly, no faux paper texture.

### 6. `trial-plots`: Trial plots treemap
- **About:** an aerial view of a field trial. The hero is a squarified treemap of data releases, with plot area proportional to accessions. Each plot is labelled with crop, count and assembly, and clicking it jumps to the DOI.
- **Tools and news:** follow the same plot grid logic, as rows of plots with plot ids and buffer rows.
- **Palette:** colours the crops.
- **Mobile:** collapses to a vertical strip treemap.

### 7. `brutal`: Oversized type
Typography is the design.
- **Hero:** the accession total spans the full viewport width.
- **Type:** section names set at 20vw or more, raw 2px rules, a hard grid.
- **Colour:** one palette colour floods the background of each section in turn.
- **Imagery:** none beyond the Fairybread screenshot.
- **Tools:** a huge text list, where hovering a name swaps in that tool's description and image.
- **Character:** loud, but still easy to navigate.

### 8. `seed-to-data`: Scroll narrative
One sticky SVG diagram runs through the whole page and transforms as you scroll.
- **Story:** seed in the genebank, then a DNA sample, genotype calls, Brioche remapping onto a new assembly, Genolink joining passport data, Pretzel and Fairybread views, and finally a breeder's decision.
- **Sections:** the four required sections are chapters of this story, carrying the same ids.
- **Motion:** scroll-driven only, with no autoplay.
- **Palette:** colours the pipeline stages.

### 9. `gazette`: Broadsheet newspaper
News leads.
- **Front page:** a masthead with the date and edition, lead story from the latest release, multi-column body text with column rules, and a data releases table set like a financial page.
- **Tools:** classified ads.
- **Type:** a serif display face with a sturdy text face, on a white page.
- **Palette:** limited to a spot colour for the masthead and rules, like a two-colour print run.

### 10. `circos`: Circos plot
- **Hero:** a large circular Circos-style SVG. The outer ring is crop chromosomes, the inner arcs are data releases, and ribbons link datasets to the tools that serve them.
- **Interaction:** hovering an arc highlights its connections, and clicking an arc scrolls to that section.
- **Layout below the hero:** quieter sections that reuse the arc motif as section dividers.
- **Palette:** maps to the rings.

## Phase 2: integration (one agent)

1. Run `bun run build` and `bun run lint` across all ten designs, and fix any integration breaks.
2. Screenshot every design in both themes and check each against the rules list. Send violations back to the owning agent, or fix trivial ones directly.
3. Update the index page so each entry shows a palette strip next to its name.
4. Commit everything to `main` as one commit per design, so a design can be dropped cleanly.

## Open points

- **Brand assets:** no logo or brand typeface is defined yet, so every design uses a text wordmark.
- **Tool screenshots:** only Fairybread has one. The others use `ImagePlaceholder`, or the design's own drawn stand-in.
- **Phyllotaxis canvas:** around 80k points on one canvas is fine on a desktop. On mobile it may drop to every nth point, keeping the proportions.
