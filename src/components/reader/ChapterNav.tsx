"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ChapterInfo {
  number: number;
  title: string;
}

interface ChapterNavProps {
  bookSlug: string;
  currentChapter: number;
  totalChapters: number;
  chapters: ChapterInfo[];
  prevChapter: number | null;
  nextChapter: number | null;
}

export default function ChapterNav({
  bookSlug,
  currentChapter,
  totalChapters,
  chapters,
  prevChapter,
  nextChapter,
}: ChapterNavProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const buildHref = useCallback(
    (chapter: number) => {
      const params = searchParams.toString();
      return `/books/${bookSlug}/${chapter}${params ? `?${params}` : ""}`;
    },
    [bookSlug, searchParams]
  );

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
      if (e.key === "ArrowLeft" && prevChapter) {
        router.push(buildHref(prevChapter));
      } else if (e.key === "ArrowRight" && nextChapter) {
        router.push(buildHref(nextChapter));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, prevChapter, nextChapter, buildHref]);

  // Swipe gestures
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

      // Only trigger if horizontal distance > 60px and more horizontal than vertical
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;

      if (dx > 0 && prevChapter) {
        router.push(buildHref(prevChapter));
      } else if (dx < 0 && nextChapter) {
        router.push(buildHref(nextChapter));
      }
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [router, prevChapter, nextChapter, buildHref]);

  // Close drawer on escape
  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen]);

  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    function onClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [drawerOpen]);

  return (
    <nav
      aria-label="Chapter navigation"
      className="relative mt-12 border-t pt-6"
      style={{ borderColor: "var(--reader-border)" }}
    >
      <div className="flex items-center justify-between">
        {prevChapter ? (
          <Link
            href={buildHref(prevChapter)}
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{ color: "var(--reader-accent)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </Link>
        ) : (
          <span className="w-16" />
        )}

        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-expanded={drawerOpen}
          aria-label="Open chapter list"
          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--reader-btn-bg)",
            color: "var(--reader-text)",
          }}
        >
          {currentChapter} / {totalChapters}
        </button>

        {nextChapter ? (
          <Link
            href={buildHref(nextChapter)}
            className="group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            style={{ color: "var(--reader-accent)" }}
          >
            <span className="hidden sm:inline">Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        ) : (
          <span className="w-16" />
        )}
      </div>

      {/* Chapter drawer */}
      {drawerOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-label="Chapter list"
          className="absolute bottom-full left-0 right-0 mb-2 max-h-72 overflow-y-auto rounded-xl shadow-xl"
          style={{
            backgroundColor: "var(--reader-controls-bg)",
            border: "1px solid var(--reader-controls-border)",
          }}
        >
          <ol className="py-2">
            {chapters.map((ch) => (
              <li key={ch.number}>
                <Link
                  href={buildHref(ch.number)}
                  onClick={() => setDrawerOpen(false)}
                  className="block px-4 py-2 text-sm transition-colors"
                  aria-current={ch.number === currentChapter ? "page" : undefined}
                  style={{
                    color:
                      ch.number === currentChapter
                        ? "var(--reader-accent)"
                        : "var(--reader-text)",
                    backgroundColor:
                      ch.number === currentChapter
                        ? "var(--reader-btn-bg)"
                        : "transparent",
                    fontWeight: ch.number === currentChapter ? 600 : 400,
                  }}
                >
                  {ch.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </nav>
  );
}
