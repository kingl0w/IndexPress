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
  // Match sequences of 3+ uppercase letters (possibly with spaces between words)
  const regex = /\b([A-Z]{2,}(?:\s+[A-Z]{2,})*)\b/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Only wrap if the matched text is 3+ characters
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

  //focus chapter title on mount
  useEffect(() => {
    titleRef.current?.focus();
  }, [chapter.number]);

  //scroll to top on chapter change
  useEffect(() => {
    window.scrollTo(0, 0);
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

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:px-6">
        {/*book info*/}
        <div className="mb-6 text-center" style={{ color: "var(--reader-text-muted)" }}>
          <p className="text-sm">{bookTitle}</p>
          <p className="text-xs">{authorName}</p>
        </div>

        {/*chapter title*/}
        <h1
          ref={titleRef}
          tabIndex={-1}
          className="mb-8 text-center text-2xl font-bold outline-none sm:text-3xl"
          style={{ color: "var(--reader-text)" }}
        >
          {chapter.title}
        </h1>

        {/*chapter content*/}
        <article ref={contentRef} className="reader-content" aria-label="Chapter content">
          {paragraphs.map((paragraph, i) => {
            //handle line breaks (poetry, etc.)
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
          className="mt-8 text-center text-xs"
          style={{ color: "var(--reader-text-muted)" }}
        >
          {chapter.wordCount.toLocaleString()} words
        </p>

        {/*chapter navigation*/}
        <ChapterNav
          bookSlug={bookSlug}
          currentChapter={chapter.number}
          totalChapters={totalChapters}
          chapters={chapters}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
        />
      </div>

      {/*reader controls*/}
      <Suspense>
        <ReaderControls
          fontSize={fontSize}
          theme={theme}
          fontFamily={fontFamily}
        />
      </Suspense>
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
