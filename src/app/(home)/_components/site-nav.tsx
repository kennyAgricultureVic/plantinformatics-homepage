"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRightIcon, MenuIcon, XIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { sections, site } from "@/content";
import { cn } from "@/lib/utils";

type SectionId = (typeof sections)[number]["id"];

/** Three leaning stems, the mark in the header. */
function StemMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6">
      <path
        d="M5 22Q5 12 9 4M12 22Q12 13 16 6M19 22Q19 15 22 10"
        fill="none"
        stroke="var(--wind-ink0)"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The section whose body crosses a line a third of the way down the viewport. */
function useActiveSection() {
  const [active, setActive] = useState<SectionId>(sections[0].id);
  useEffect(() => {
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id as SectionId);
      },
      { rootMargin: "-33% 0px -66% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) seen.observe(el);
    }
    return () => seen.disconnect();
  }, []);
  return [active, setActive] as const;
}

/**
 * Floating navbar that lifts on scroll: a translucent card that firms up and casts a shadow once
 * the page moves, with a highlight that slides to the section in view. On small screens the card
 * opens downward into a menu.
 */
export function SiteNav() {
  const [active, setActive] = useActiveSection();
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const links = useRef(new Map<SectionId, HTMLAnchorElement>());

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the highlight on the active link as it changes or the bar resizes.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const link = links.current.get(active);
      setPill(link && link.offsetWidth ? { left: link.offsetLeft, width: link.offsetWidth } : null);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(nav);
    return () => resize.disconnect();
  }, [active]);

  // The open menu closes on Escape, a press outside the card, or growing past the mobile layout.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!cardRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const wide = window.matchMedia("(min-width: 640px)");
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    wide.addEventListener("change", onWide);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      wide.removeEventListener("change", onWide);
    };
  }, [open]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-30 px-4 pt-4">
      <div
        ref={cardRef}
        className={cn(
          "pointer-events-auto mx-auto max-w-[680px] rounded-[14px] border px-2 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ease-out",
          lifted || open
            ? "border-border bg-background/80 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.18)]"
            : "border-transparent bg-background/60",
        )}
      >
        <header className="flex h-12 items-center gap-2">
          <a
            href="#about"
            onClick={() => setOpen(false)}
            className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold tracking-tight"
          >
            <StemMark />
            {site.name}
          </a>

          <nav ref={navRef} aria-label="Primary" className="relative mx-auto hidden items-center sm:flex">
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 rounded-lg bg-foreground/10 transition-[transform,width,opacity] duration-300 ease-out motion-reduce:transition-none",
                !pill && "opacity-0",
              )}
              style={pill ? { width: pill.width, transform: `translateX(${pill.left}px)` } : undefined}
            />
            {sections.map((s) => (
              <a
                key={s.id}
                ref={(el) => {
                  if (el) links.current.set(s.id, el);
                  else links.current.delete(s.id);
                }}
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                onClick={() => setActive(s.id)}
                className={cn(
                  "relative flex h-8 items-center rounded-lg px-2.5 text-[13px] font-medium transition-colors",
                  active === s.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <ThemeToggle />
            <a
              href={site.github}
              className="hidden h-8 items-center gap-1 rounded-lg bg-foreground px-3 text-[13px] font-medium text-background transition-opacity hover:opacity-85 sm:inline-flex"
            >
              {site.githubLabel}
              <ArrowUpRightIcon className="size-3.5" />
            </a>
            <Button
              variant="ghost"
              size="icon"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
              className="sm:hidden"
            >
              {open ? <XIcon /> : <MenuIcon />}
            </Button>
          </div>
        </header>

        <div
          id="site-menu"
          inert={!open}
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none sm:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <nav aria-label="Primary" className="grid gap-1 pt-1 pb-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "location" : undefined}
                  onClick={() => {
                    setActive(s.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-10 items-center rounded-lg px-2 text-sm font-medium",
                    active === s.id ? "bg-foreground/10" : "hover:bg-foreground/5",
                  )}
                >
                  {s.label}
                </a>
              ))}
              <a
                href={site.github}
                className="mt-1 flex h-10 items-center justify-center gap-1 rounded-lg bg-foreground text-sm font-medium text-background"
              >
                {site.githubLabel}
                <ArrowUpRightIcon className="size-4" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
