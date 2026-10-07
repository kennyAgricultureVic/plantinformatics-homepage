import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { FigureFrame } from "./figure-frame";

// Built pages from hairline-figures/, copied into public/hairline/<slug>.html.
const figures = [
  { slug: "barley", name: "Barley" },
  { slug: "wheat", name: "Wheat" },
  { slug: "lentil", name: "Lentil" },
  { slug: "pea", name: "Field pea" },
  { slug: "chickpea", name: "Chickpea" },
  { slug: "lupin", name: "Lupin" },
  { slug: "dna", name: "DNA" },
] as const;

/** Gallery of the Hairline crop figures: hover each one, drag its slider. */
export default function HairlinePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Designs
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Hairline figures</h1>
        </div>
        <ThemeToggle />
      </header>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Hover a figure to make it answer, and drag its intensity slider to change how strongly it does.
      </p>
      <ul className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-2">
        {figures.map((f) => (
          <li key={f.slug}>
            <h2 className="font-medium">{f.name}</h2>
            <FigureFrame slug={f.slug} title={f.name} />
          </li>
        ))}
      </ul>
    </main>
  );
}
