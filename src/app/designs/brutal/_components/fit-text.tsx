"use client";

import { useEffect, useRef, type ElementType } from "react";

type FitTextProps = {
  as?: ElementType;
  children: string;
  className?: string;
};

/**
 * Sets one line of text so it spans its `@container` ancestor edge to edge.
 * Width scales linearly with font size, so the glyph width ratio is measured once (after webfonts
 * load) and the size is written in cqw; resizing then needs no further measuring.
 * Renders with a rough estimate first so the server HTML is already close.
 */
export function FitText({ as: Tag = "span", children, className }: FitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const range = document.createRange();
      range.selectNodeContents(el);
      const ratio = range.getBoundingClientRect().width / parseFloat(getComputedStyle(el).fontSize);
      // Shave a hair off so subpixel rounding never causes overflow.
      if (ratio > 0) el.style.fontSize = `${99.5 / ratio}cqw`;
    });
    return () => {
      cancelled = true;
    };
  }, [children]);

  return (
    <Tag ref={ref} className={className} style={{ fontSize: `${200 / children.length}cqw`, whiteSpace: "nowrap" }}>
      {children}
    </Tag>
  );
}
