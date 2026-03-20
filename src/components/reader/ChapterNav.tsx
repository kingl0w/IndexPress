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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const buildHref = useCallback(
    (chapter: number) => {
      const params = searchParams.toString();
      return `/books/${bookSlug}/${chapter}${params ? `?${params}` : ""}`;
    },
    [bookSlug, searchParams]
  );

  const prevTitle = prevChapter
    ? chapters.find((c) => c.number === prevChapter)?.title
    : null;
  const nextTitle = nextChapter
    ? chapters.find((c) => c.number === nextChapter)?.title
    : null;

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    triggerRef.current?.focus();
  }, []);

  //keyboard navigation
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

  //swipe gestures
  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;

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

  //close drawer on escape
  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, closeDrawer]);

  //close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return;
    function onClick(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [drawerOpen, closeDrawer]);

  // Focus first chapter link when drawer opens
  useEffect(() => {
    if (!drawerOpen || !drawerRef.current) return;
    const firstLink = drawerRef.current.querySelector<HTMLAnchorElement>("a");
    firstLink?.focus();
  }, [drawerOpen]);

  // Focus trap within the drawer
  const handleDrawerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const focusableEls = drawerRef.current.querySelectorAll<HTMLElement>("a, button");
    if (focusableEls.length === 0) return;
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  return (
    <nav aria-label="Chapter navigation" className="relative mt-8">
      {/*page-turn prev/next*/}
      <div
        className="grid border-t"
        style={{
          borderColor: "var(--reader-border)",
          gridTemplateColumns: prevChapter && nextChapter ? "1fr 1fr" : "1fr",
        }}
      >
        {prevChapter && prevTitle && (
          <Link
            href={buildHref(prevChapter)}
            className="group py-6 pr-4 transition-colors"
            style={{ borderRight: nextChapter ? "1px solid var(--reader-border)" : undefined }}
          >
            <p className="text-xs" style={{ color: "var(--reader-text-muted)" }}>
              &larr; Previous
            </p>
            <p
              className="mt-1 font-serif font-medium transition-colors"
              style={{ color: "var(--reader-text)" }}
            >
              <span className="group-hover:underline">{prevTitle}</span>
            </p>
          </Link>
        )}
        {nextChapter && nextTitle && (
          <Link
            href={buildHref(nextChapter)}
            className="group py-6 pl-4 text-right transition-colors"
          >
            <p className="text-xs" style={{ color: "var(--reader-text-muted)" }}>
              Next &rarr;
            </p>
            <p
              className="mt-1 font-serif font-medium transition-colors"
              style={{ color: "var(--reader-text)" }}
            >
              <span className="group-hover:underline">{nextTitle}</span>
            </p>
          </Link>
        )}
      </div>

      {/*chapter picker*/}
      <div className="mt-4 flex justify-center">
        <button
          ref={triggerRef}
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-expanded={drawerOpen}
          aria-label="Open chapter list"
          className="rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
          style={{
            backgroundColor: "var(--reader-btn-bg)",
            color: "var(--reader-text)",
          }}
        >
          {currentChapter} / {totalChapters}
        </button>
      </div>

      {/*chapter drawer*/}
      {drawerOpen && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Chapter list"
          className="absolute bottom-full left-0 right-0 mb-2 max-h-72 overflow-y-auto rounded-xl shadow-lg"
          style={{
            backgroundColor: "var(--reader-controls-bg)",
            border: "1px solid var(--reader-controls-border)",
          }}
          onKeyDown={handleDrawerKeyDown}
        >
          <ol className="py-2">
            {chapters.map((ch) => (
              <li key={ch.number}>
                <Link
                  href={buildHref(ch.number)}
                  onClick={() => {
                    setDrawerOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className="block px-4 py-2.5 text-sm transition-colors"
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
