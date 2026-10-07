import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { designs } from "./designs/registry";

// Index of design explorations. Not the real homepage: each design is its own candidate.
export default function DesignIndex() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Homepage designs</h1>
        <ThemeToggle />
      </header>
      <ul className="mt-10 divide-y border-y">
        {designs.map((d) => (
          <li key={d.slug}>
            <Link href={`/designs/${d.slug}`} className="block py-5 hover:text-muted-foreground">
              <span className="font-medium">{d.name}</span>
              <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
