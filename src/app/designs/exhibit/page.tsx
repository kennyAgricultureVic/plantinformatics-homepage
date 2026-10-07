import Link from "next/link";

// Placeholder until this design is built. See plans/eleven-more-designs.md for the brief.
export default function Placeholder() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p>This design is in progress.</p>
      <Link href="/" className="mt-4 inline-block underline underline-offset-4">
        All designs
      </Link>
    </main>
  );
}
