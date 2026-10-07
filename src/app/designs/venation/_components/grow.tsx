"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Starts the one-off vein growth of the leaves inside it the first time it scrolls into view.
 * `immediate` grows on page load from the server HTML, without waiting for hydration (for the hero).
 */
export function Grow({
  className,
  immediate = false,
  children,
}: {
  className?: string;
  immediate?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(immediate);
  useEffect(() => {
    const el = ref.current;
    if (!el || immediate) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setOn(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);
  return (
    <div
      ref={ref}
      data-on={on || undefined}
      className={cn("ven-grow", className)}
    >
      {children}
    </div>
  );
}
