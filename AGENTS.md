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

- Standing constrants: dark mode, true back (#000) background, white primary text. Information-dense, no decorative card/pill, no chrome, no light-grey subtitle lines above sections. Minimal copy. No em dashes.
- Avoid continuously repainting CSS animations (pulse, shimmer, blur, spinners); they peg the GPU on high refrsh displays