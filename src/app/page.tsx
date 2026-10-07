import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { designs, runs } from "./designs/registry";

// Index of design explorations, grouped by the run that produced them. Not the real homepage:
// each design is its own candidate.
export default function DesignIndex() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Homepage designs</h1>
        <div className="flex items-center gap-2">
          <Link href="/hairline" className="text-sm text-muted-foreground hover:text-foreground">
            Hairline figures
          </Link>
          <ThemeToggle />
        </div>
      </header>
      {runs.map((run) => (
        <section key={run.id} aria-labelledby={`run-${run.id}`} className="mt-14">
          <h2 id={`run-${run.id}`} className="text-lg font-semibold tracking-tight">
            {run.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{run.description}</p>
          <ul className="mt-4 divide-y border-y">
            {designs
              .filter((d) => d.run === run.id)
              .map((d) => (
                <li key={d.slug}>
                  <Link href={`/designs/${d.slug}`} className="block py-5 hover:text-muted-foreground">
                    <span className="font-medium">{d.name}</span>
                    <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
