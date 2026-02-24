"use client";

import { useState, useEffect, useCallback } from "react";

interface ReadingProgressProps {
  contentRef: React.RefObject<HTMLElement | null>;
}

export default function ReadingProgress({ contentRef }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  const updateProgress = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const contentTop = rect.top + window.scrollY;
    const contentHeight = rect.height;

    if (contentHeight <= 0) return;

    const scrolled = window.scrollY - contentTop + windowHeight;
    const total = contentHeight + windowHeight;
    const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
    setProgress(pct);
  }, [contentRef]);

  useEffect(() => {
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [updateProgress]);

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Reading progress: ${Math.round(progress)}%`}
      className="fixed left-0 right-0 top-0 z-50 h-[3px]"
      style={{ backgroundColor: "var(--reader-border, #e7e5e4)" }}
    >
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: "var(--reader-progress, #2563eb)",
        }}
      />
    </div>
  );
}
