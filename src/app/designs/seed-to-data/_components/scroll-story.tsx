"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PipelineDiagram } from "./pipeline-diagram";

const STEP_SELECTOR = "[data-step]";

/**
 * Reading line and half-width of the transition band, in px from the viewport top.
 * Narrow screens pin the diagram over the top 42% of the viewport, so the line sits lower.
 */
const band = () => {
  const vh = window.innerHeight;
  return window.innerWidth < 1024 ? { line: vh * 0.85, span: vh * 0.18 } : { line: vh * 0.62, span: Math.min(240, vh * 0.28) };
};

/**
 * Two-column scroll story: chapters on the left, the pipeline diagram pinned on the right
 * (pinned to the top on narrow screens). Every `[data-step]` element among `children` is one
 * stage; progress eases from one stage to the next as that step's top edge crosses the reading line.
 */
export function ScrollStory({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const { line, span } = band();
      const steps = [...root.querySelectorAll<HTMLElement>(STEP_SELECTOR)].slice(1);
      setProgress(steps.reduce((p, el) => p + Math.min(1, Math.max(0, (line - el.getBoundingClientRect().top + span) / (2 * span))), 0));
    };
    const schedule = () => {
      frame ||= requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const jump = (stage: number) => {
    const target = rootRef.current?.querySelectorAll<HTMLElement>(STEP_SELECTOR)[stage];
    if (!target) return;
    // Land where that stage's transition has just finished.
    const { line, span } = band();
    const top = stage === 0 ? 0 : window.scrollY + target.getBoundingClientRect().top - line + span;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div ref={rootRef} className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="sticky top-14 z-10 h-[42svh] border-b bg-background lg:order-2 lg:h-[calc(100svh-3.5rem)] lg:self-start lg:border-b-0 lg:border-l">
        <PipelineDiagram progress={progress} onJump={jump} />
      </div>
      <div className="min-w-0 lg:order-1">{children}</div>
    </div>
  );
}
