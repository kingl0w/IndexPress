"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  searchBooks,
  searchChapters,
} from "../../../lib/typesense-client";
import type {
  BookSearchResult,
  ChapterSearchResult,
} from "../../../lib/typesense-client";

type Tab = "catalog" | "fulltext";

function HighlightedSnippet({ html }: { html: string }) {
  return (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function BookResultCard({
  result,
  isActive,
}: {
  result: BookSearchResult;
  isActive: boolean;
}) {
  return (
    <Link
      href={`/books/${result.slug}`}
      className={`block p-4 rounded-lg border transition-colors ${
        isActive
          ? "border-amber-500 bg-amber-950/20"
          : "border-stone-800 hover:border-stone-700"
      }`}
      data-active={isActive}
    >
      <h3 className="font-semibold text-lg leading-tight text-stone-100 [&>mark]:bg-amber-900/50 [&>mark]:rounded [&>mark]:px-0.5">
        {result.highlights.title ? (
          <HighlightedSnippet html={result.highlights.title} />
        ) : (
          result.title
        )}
      </h3>
      <p className="text-sm text-stone-400 mt-1 [&>mark]:bg-amber-900/50 [&>mark]:rounded [&>mark]:px-0.5">
        by{" "}
        {result.highlights.authorName ? (
          <HighlightedSnippet html={result.highlights.authorName} />
        ) : (
          result.authorName
        )}
      </p>
      <p className="text-xs text-stone-500 mt-1">
        {result.totalChapters} chapters &middot;{" "}
        {result.totalWordCount.toLocaleString()} words
      </p>
      {result.subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {result.subjects.slice(0, 4).map((subject) => (
            <span
              key={subject}
              className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-400"
            >
              {subject}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function ChapterResultCard({
  result,
  isActive,
}: {
  result: ChapterSearchResult;
  isActive: boolean;
}) {
  return (
    <Link
      href={`/books/${result.bookSlug}/${result.chapterNumber}`}
      className={`block p-4 rounded-lg border transition-colors ${
        isActive
          ? "border-amber-500 bg-amber-950/20"
          : "border-stone-800 hover:border-stone-700"
      }`}
      data-active={isActive}
    >
      <div className="flex items-baseline gap-2">
        <h3 className="font-semibold leading-tight text-stone-100">
          {result.bookTitle}
        </h3>
        <span className="text-xs text-stone-400 shrink-0">
          {result.chapterTitle}
        </span>
      </div>
      <p className="text-sm text-stone-400 mt-0.5">
        by {result.authorName}
      </p>
      <p className="text-sm mt-2 text-stone-300 leading-relaxed [&>mark]:bg-amber-900/50 [&>mark]:rounded [&>mark]:px-0.5">
        <HighlightedSnippet html={result.snippet} />
      </p>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-stone-800 animate-pulse"
        >
          <div className="h-5 bg-stone-800 rounded w-3/4" />
          <div className="h-4 bg-stone-800 rounded w-1/3 mt-2" />
          <div className="h-3 bg-stone-800 rounded w-full mt-3" />
        </div>
      ))}
    </div>
  );
}

export default function SearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<Tab>("catalog");
  const [bookResults, setBookResults] = useState<BookSearchResult[]>([]);
  const [chapterResults, setChapterResults] = useState<ChapterSearchResult[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [searchTimeMs, setSearchTimeMs] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [chapterPage, setChapterPage] = useState(1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const executeBooksSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setBookResults([]);
      setTotalFound(0);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const result = await searchBooks(q);
      setBookResults(result.hits);
      setTotalFound(result.totalFound);
      setSearchTimeMs(result.searchTimeMs);
    } catch {
      setError("Search is temporarily unavailable");
      setBookResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const executeChaptersSearch = useCallback(async (q: string, page = 1) => {
    if (!q.trim()) {
      setChapterResults([]);
      setTotalFound(0);
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const result = await searchChapters(q, { page, perPage: 20 });
      setChapterResults(result.hits);
      setTotalFound(result.totalFound);
      setSearchTimeMs(result.searchTimeMs);
    } catch {
      setError("Search is temporarily unavailable");
      setChapterResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      executeBooksSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveIndex(-1);

      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`/search?${params.toString()}`, { scroll: false });

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (activeTab === "catalog") {
        debounceRef.current = setTimeout(() => {
          executeBooksSearch(value);
        }, 300);
      }
    },
    [activeTab, executeBooksSearch, router, searchParams]
  );

  const handleFulltextSubmit = useCallback(() => {
    if (query.trim()) {
      setChapterPage(1);
      executeChaptersSearch(query, 1);
    }
  }, [query, executeChaptersSearch]);

  const handleTabSwitch = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      setActiveIndex(-1);
      setError(null);

      if (query.trim()) {
        if (tab === "catalog") {
          executeBooksSearch(query);
        } else {
          setChapterPage(1);
          executeChaptersSearch(query, 1);
        }
      }
    },
    [query, executeBooksSearch, executeChaptersSearch]
  );

  const handleChapterPageChange = useCallback(
    (page: number) => {
      setChapterPage(page);
      executeChaptersSearch(query, page);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [query, executeChaptersSearch]
  );

  const currentResults = activeTab === "catalog" ? bookResults : chapterResults;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) =>
          Math.min(prev + 1, currentResults.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter") {
        if (activeIndex >= 0) {
          e.preventDefault();
          const result = currentResults[activeIndex];
          if (result) {
            if (activeTab === "catalog") {
              router.push(`/books/${(result as BookSearchResult).slug}`);
            } else {
              const ch = result as ChapterSearchResult;
              router.push(`/books/${ch.bookSlug}/${ch.chapterNumber}`);
            }
          }
        } else if (activeTab === "fulltext") {
          handleFulltextSubmit();
        }
      }
    },
    [activeIndex, activeTab, currentResults, router, handleFulltextSubmit]
  );

  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const activeEl = resultsRef.current.querySelector(
        "[data-active='true']"
      );
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const hasQuery = query.trim().length > 0;
  const totalChapterPages = Math.ceil(totalFound / 20);

  return (
    <>
      {/*search input*/}
      <div className="relative" onKeyDown={handleKeyDown}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={
            activeTab === "catalog"
              ? "Search books, authors, or subjects..."
              : "Search the full text of every book... (press Enter)"
          }
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-stone-700 bg-slate-900 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 text-lg"
          aria-label="Search"
          role="combobox"
          aria-expanded={hasQuery && currentResults.length > 0}
          aria-controls="search-results"
          aria-activedescendant={
            activeIndex >= 0 ? `result-${activeIndex}` : undefined
          }
        />
        {query && (
          <button
            onClick={() => handleInput("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-300"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/*tabs*/}
      <div
        className="flex gap-1 mt-4 border-b border-stone-800"
        role="tablist"
      >
        <button
          role="tab"
          aria-selected={activeTab === "catalog"}
          onClick={() => handleTabSwitch("catalog")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "catalog"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-stone-500 hover:text-stone-300"
          }`}
        >
          Books &amp; Authors
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "fulltext"}
          onClick={() => handleTabSwitch("fulltext")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "fulltext"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-stone-500 hover:text-stone-300"
          }`}
        >
          Full Text
        </button>
      </div>

      {/*results area*/}
      <div
        ref={resultsRef}
        id="search-results"
        role="listbox"
        className="mt-4 space-y-2"
      >
        {error && (
          <div className="text-center py-8 px-4 rounded-lg border border-red-900 bg-red-950">
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-red-500 mt-1">
              Please try again later
            </p>
          </div>
        )}

        {!error && hasQuery && !isSearching && currentResults.length > 0 && (
          <p className="text-sm text-stone-400">
            {totalFound.toLocaleString()} result
            {totalFound !== 1 && "s"} in {(searchTimeMs / 1000).toFixed(3)}s
          </p>
        )}

        {isSearching && <LoadingSkeleton />}

        {!isSearching &&
          !error &&
          hasQuery &&
          activeTab === "catalog" &&
          bookResults.map((result, i) => (
            <div
              key={result.slug}
              id={`result-${i}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <BookResultCard result={result} isActive={i === activeIndex} />
            </div>
          ))}

        {!isSearching &&
          !error &&
          hasQuery &&
          activeTab === "fulltext" &&
          chapterResults.map((result, i) => (
            <div
              key={`${result.bookSlug}:${result.chapterNumber}`}
              id={`result-${i}`}
              role="option"
              aria-selected={i === activeIndex}
            >
              <ChapterResultCard result={result} isActive={i === activeIndex} />
            </div>
          ))}

        {!isSearching &&
          !error &&
          activeTab === "fulltext" &&
          totalChapterPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => handleChapterPageChange(chapterPage - 1)}
                disabled={chapterPage <= 1}
                className="px-3 py-1.5 text-sm rounded border border-stone-700 disabled:opacity-40 hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="text-sm text-stone-400">
                Page {chapterPage} of {totalChapterPages.toLocaleString()}
              </span>
              <button
                onClick={() => handleChapterPageChange(chapterPage + 1)}
                disabled={chapterPage >= totalChapterPages}
                className="px-3 py-1.5 text-sm rounded border border-stone-700 disabled:opacity-40 hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          )}

        {!isSearching && !error && hasQuery && currentResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-stone-400 text-lg">
              No results found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-stone-500 text-sm mt-2">
              Try different keywords or check your spelling
            </p>
          </div>
        )}

        {!isSearching &&
          !error &&
          activeTab === "fulltext" &&
          hasQuery &&
          chapterResults.length === 0 &&
          totalFound === 0 && (
            <div className="text-center py-12">
              <p className="text-stone-500">
                Press <kbd className="px-1.5 py-0.5 border border-stone-700 rounded text-xs font-mono">Enter</kbd> to search the full text of every book
              </p>
            </div>
          )}

        {!hasQuery && !isSearching && !error && (
          <div className="text-center py-12">
            <p className="text-stone-500">
              Start typing to search
              {activeTab === "catalog"
                ? " books, authors, and subjects"
                : " the full text of every book"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
