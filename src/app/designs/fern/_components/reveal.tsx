"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Marks its wrapper `data-seen` the first time it scrolls into view, so CSS can play a one-off animation. */
export function Reveal({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-seen={seen || undefined} className={className}>
      {children}
    </div>
  );
}
