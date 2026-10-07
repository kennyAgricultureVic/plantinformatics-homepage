I'm Kenny. You are my agent. We will be working together a lot, so I thought it might be worth introducting myself.

I love to build. I focus on building complex things as simple as possible. I love to find ways to reduce complexity when solving problems.

I want to share some of preferences so we can be more aligned when we work together. These are intended as guidelines not hard rules. If the developer (me) specifies something that goes against these guidelines, let me know before proceeding.

## Coding preferences - general

- Keep things simple. Channel "yagni" energy unless told otherwise
- Typesafety is useful take advantage of it
- Don't be scared to propose bold ideas if they can meaningfully benefit our work.
- Be careful with destructive actions that are not explicity requested by the user.
- Tests are good! Endless smoke test, "regression test" for feature deletions, ect, much less good. Test should be focused not slop.
- Comments are a great way to clarify functionality and how code is used. Don't comment every line, but feel free to describe concisely how functions are used above function definitions or classes.
- Keep comments up to date! When making changes, it is important to keep things in sync.

## Coding preferences (Typescript focused)

- `any` is the enemy. Inferred types are our friend. Our systems should adapt to changes, instead of requiring changes everywhere
- If your TS code looks like a python dev wrote it, it is bad TS code
- Avoid one-line functions that are just casting wrappers
- Write typescript in ways that Matt Pocock and Theo would be proud
- If not already specified in the project, I generally like to use the following tech: Typescript, Tailwind, React
- The default package manager is `bun` unless otherwise specified

## Questions are read-only

- A question is a request for an answer, not for changes. If the message opens with "how hard would it be", "what are your thoughts", "why does", "should we", "is it possible", "can X do Y", or therwise asks rather than instructs: answer it and do not edit the files.
- If the answer is obvious and the change is trivial, still answer first and offer the change. Ask before making it

## Match ceremony to the task

- Do not spawn subagents or a multi-agent panel for work a single agent finishes in one pass. Delegation is for bredth or adversarial review, not for ordinary tasks.
- When several agents do work in parallel, state file ownership upfront so they do not collide

## Visaul and design work

- Always build with an option for dark mode and give the user a toggle and sync with the user's settings
- When choosing colours use ones that are suitable for dark mode
- Avoid grey, go with true back (#000) background and white primary text for dark mode
- No decorative card/pill, no chrome, no light-grey subtitle lines above sections. No em dashes.
- Avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners); they peg the GPU on high refrsh displays
## This repo: homepage design explorations

The goal is to explore multiple designs for the organisation's front page. `main` is the shared base; each design lives in its own route folder so designs can be compared side by side. Read `project.md` for the brief.

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind v4, shadcn/ui (`base-nova` style, Base UI primitives), next-themes, lucide-react. Package manager: `bun`.

```bash
bun dev          # http://localhost:3000, index of all designs
bun run build    # typecheck + static build, run before calling a design done
bun run lint
```

### Layout

- `src/content/` all page copy as typed data (site, tools, data releases, news) plus `formatDate`/`formatNumber`. Import from `@/content`. Never hardcode copy in a design; fix or extend it here so every design benefits.
- `src/app/designs/<slug>/page.tsx` one design per folder. `starter/` is the plain reference that wires up every section.
- `src/app/designs/registry.ts` list of designs shown on the index page (`/`).
- `src/components/ui/` shadcn components. Add more with `bunx --bun shadcn@latest add <name>`.
- `src/components/theme-toggle.tsx`, `image-placeholder.tsx` shared helpers.
- `public/` images. Only `fairybread.png` exists so far; other tools use `<ImagePlaceholder />`.

### Creating a new design

1. Copy `src/app/designs/starter` to `src/app/designs/<slug>` and add an entry to `registry.ts`.
2. Keep design-specific components, fonts and CSS inside that folder (e.g. `_components/`, a `layout.tsx` that loads a `next/font` and sets CSS variables on a wrapper). Do not restyle `globals.css` or `components/ui/` for one design; copy a component into your folder if you need to change it.
3. Render every section with the ids from `sections` in `@/content` (`about`, `tools`, `data`, `news`) plus a footer with `funding`, so anchor links behave the same everywhere.
4. Include `<ThemeToggle />`. Dark mode is class based (`dark:` variant); dark backgrounds are true black and text white (see design rules above).
5. `bun run build` must pass.

When several agents build designs in parallel, each owns only its own `src/app/designs/<slug>/` folder. Shared files (`src/content`, `registry.ts`, `components/ui`) change only when the task says so, and registry edits are one-line additions.
<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
