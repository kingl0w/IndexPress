"use client";

import { useEffect, useRef, useCallback } from "react";

interface ReadingProgressProps {
  contentRef: React.RefObject<HTMLElement | null>;
}

export default function ReadingProgress({ contentRef }: ReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastProgress = useRef(0);

  const updateProgress = useCallback(() => {
    const el = contentRef.current;
    const bar = barRef.current;
    const container = containerRef.current;
    if (!el || !bar || !container) return;

    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const contentTop = rect.top + window.scrollY;
    const contentHeight = rect.height;

    if (contentHeight <= 0) return;

    const scrolled = window.scrollY - contentTop + windowHeight;
    const total = contentHeight + windowHeight;
    const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
    const rounded = Math.round(pct);

    // Write directly to the DOM — no React re-render needed
    bar.style.transform = `scaleX(${pct / 100})`;

    // Only update ARIA when the rounded value changes (reduces DOM writes)
    if (rounded !== lastProgress.current) {
      lastProgress.current = rounded;
      container.setAttribute("aria-valuenow", String(rounded));
      container.setAttribute("aria-label", `Reading progress: ${rounded}%`);
    }
  }, [contentRef]);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateProgress);
  }, [updateProgress]);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [onScroll, updateProgress]);

  return (
    <div
      ref={containerRef}
      role="progressbar"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress: 0%"
      className="fixed left-0 right-0 top-0 z-50 h-[2px]"
      style={{ backgroundColor: "var(--reader-border)" }}
    >
      <div
        ref={barRef}
        className="h-full origin-left transition-transform duration-150 ease-out"
        style={{
          transform: "scaleX(0)",
          backgroundColor: "var(--reader-progress)",
        }}
      />
    </div>
  );
}
