import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Hairline, hairlineFigures } from "@/components/hairline";

// Checks the <Hairline> component port: every figure in place, and one recoloured through CSS variables.
export default function HairlineCheck() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link href="/hairline" className="text-sm text-muted-foreground hover:text-foreground">
            Hairline figures
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Component check</h1>
        </div>
        <ThemeToggle />
      </header>
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {hairlineFigures.map((name) => (
          <li key={name} className="border">
            <Hairline figure={name} />
            <p className="border-t px-3 py-2 text-sm">{name}</p>
          </li>
        ))}
        <li
          className="border bg-[#1d4d3a] text-white"
          style={
            {
              "--hairline-plate": "#1d4d3a",
              "--hairline-hi": "#f5d76e",
              "--hairline-edge": "#ffffff",
              "--hairline-mid": "#9fc2ae",
              "--hairline-lo": "#4f7a64",
            } as React.CSSProperties
          }
        >
          <Hairline figure="wheat" intensity={1} />
          <p className="border-t border-white/30 px-3 py-2 text-sm">wheat, recoloured</p>
        </li>
      </ul>
    </main>
  );
}
