import { funding, site } from "@/content";
import { display, paint, type Slot } from "./print";

const partnerSlots = [1, 2, 3] as const satisfies readonly Slot[];

/** Footer set like a poster's imprint line: funding acknowledgement and partners as colour blocks. */
export function Colophon() {
  return (
    <footer className="mx-auto grid w-full max-w-7xl grid-cols-4 gap-6 px-4 py-16 sm:px-8 md:grid-cols-12">
      <p className={`${display} col-span-4 text-3xl leading-[0.95] md:col-span-8 md:text-5xl`}>{funding.acknowledgement}</p>
      <ul className="col-span-4 grid gap-2 md:col-span-4">
        {funding.partners.map((partner, i) => (
          <li key={partner} className={`${display} border-2 border-current px-3 pt-2 pb-1 text-xl`} style={paint(partnerSlots[i % 3])}>
            {partner}
          </li>
        ))}
      </ul>
      <a href={site.github} className="col-span-4 text-sm underline underline-offset-4 md:col-span-12">
        {site.github.replace("https://", "")}
      </a>
    </footer>
  );
}
