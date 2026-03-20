"use client";

import { useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReadingProgress from "./ReadingProgress";
import ReaderControls from "./ReaderControls";
import ChapterNav from "./ChapterNav";
import type { FontSize, Theme, FontFamily } from "./ReaderControls";
import "@/styles/reader.css";

interface ChapterInfo {
  number: number;
  title: string;
}

interface ReaderViewProps {
  bookTitle: string;
  bookSlug: string;
  authorName: string;
  chapter: {
    number: number;
    title: string;
    content: string;
    wordCount: number;
  };
  chapters: ChapterInfo[];
  totalChapters: number;
  prevChapter: number | null;
  nextChapter: number | null;
}

//detect ALL-CAPS words (3+ uppercase letters) and wrap in spans
function renderParagraph(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\b([A-Z]{2,}(?:\s+[A-Z]{2,})*)\b/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match[1].length >= 3) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <span key={match.index} className="all-caps">
          {match[1]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : [text];
}

function ReaderViewInner({
  bookTitle,
  bookSlug,
  authorName,
  chapter,
  chapters,
  totalChapters,
  prevChapter,
  nextChapter,
}: ReaderViewProps) {
  const searchParams = useSearchParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const fontSize = (searchParams.get("font") as FontSize) || "medium";
  const theme = (searchParams.get("theme") as Theme) || "light";
  const fontFamily = (searchParams.get("family") as FontFamily) || "serif";

  //scroll to top and focus chapter title on chapter change
  useEffect(() => {
    window.scrollTo(0, 0);
    titleRef.current?.focus();
  }, [chapter.number]);

  const paragraphs = chapter.content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div
      className="reader"
      data-theme={theme}
      data-font-size={fontSize}
      data-font-family={fontFamily}
    >
      <ReadingProgress contentRef={contentRef} />

      {/*screen reader announcement*/}
      <div aria-live="polite" className="sr-only">
        {chapter.title} of {bookTitle}
      </div>

      {/*reader controls — pinned toolbar*/}
      <Suspense>
        <ReaderControls
          fontSize={fontSize}
          theme={theme}
          fontFamily={fontFamily}
        />
      </Suspense>

      {/*reading surface*/}
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        <div className="reader-surface">
          {/*book info*/}
          <div className="mb-8 text-center" style={{ color: "var(--reader-text-muted)" }}>
            <p className="text-sm font-serif">{bookTitle}</p>
            <p className="text-xs mt-0.5">{authorName}</p>
          </div>

          {/*chapter title with ornamental rule*/}
          <header className="mb-10 border-b pb-8 text-center" style={{ borderColor: "var(--reader-border)" }}>
            <h1
              ref={titleRef}
              tabIndex={-1}
              className="font-serif text-2xl font-bold outline-none sm:text-3xl"
              style={{ color: "var(--reader-text)" }}
            >
              {chapter.title}
            </h1>
            <p className="mt-3 text-sm italic" style={{ color: "var(--reader-text-muted)" }}>
              Chapter {chapter.number} of {totalChapters}
            </p>
          </header>

          {/*chapter content*/}
          <article ref={contentRef} className="reader-content" aria-label="Chapter content">
            {paragraphs.map((paragraph, i) => {
              const lines = paragraph.split("\n");
              if (lines.length > 1) {
                return (
                  <p key={i}>
                    {lines.map((line, j) => (
                      <span key={j}>
                        {j > 0 && <br />}
                        {renderParagraph(line)}
                      </span>
                    ))}
                  </p>
                );
              }
              return <p key={i}>{renderParagraph(paragraph)}</p>;
            })}
          </article>

          {/*word count*/}
          <p
            className="mt-10 text-center text-xs"
            style={{ color: "var(--reader-text-muted)" }}
          >
            {chapter.wordCount.toLocaleString()} words
          </p>
        </div>

        {/*chapter navigation — page-turn feel*/}
        <ChapterNav
          bookSlug={bookSlug}
          currentChapter={chapter.number}
          totalChapters={totalChapters}
          chapters={chapters}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
        />
      </div>
    </div>
  );
}

export default function ReaderView(props: ReaderViewProps) {
  return (
    <Suspense>
      <ReaderViewInner {...props} />
    </Suspense>
  );
}
