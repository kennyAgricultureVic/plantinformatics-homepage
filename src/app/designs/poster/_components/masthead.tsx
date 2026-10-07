import { ThemeToggle } from "@/components/theme-toggle";
import { sections, site, type SectionId } from "@/content";
import { display, paint, type Slot } from "./print";

// Each nav block is printed in the field colour of the poster it jumps to.
const fields: Record<SectionId, Slot> = { about: 1, tools: 2, data: 3, news: 4 };

/** Sticky top strip: wordmark, palette blocks as section nav, theme toggle. */
export function Masthead() {
  return (
    <header className="sticky top-0 z-30 flex h-12 items-stretch border-b-4 border-current bg-[#f1ede4] dark:bg-black">
      <a href="#about" className={`${display} flex items-center px-3 text-lg sm:px-4 sm:text-2xl`}>
        {site.name}
      </a>
      <nav className="ml-auto flex">
        {sections.map((s, i) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            style={paint(fields[s.id])}
            className={`${display} flex items-center gap-2 border-l-4 border-black px-2.5 text-lg hover:underline sm:px-4 dark:border-white`}
          >
            {String(i + 1).padStart(2, "0")}
            <span className="hidden md:inline">{s.label}</span>
          </a>
        ))}
      </nav>
      <div className="flex items-center border-l-4 border-current px-1">
        <ThemeToggle />
      </div>
    </header>
  );
}
