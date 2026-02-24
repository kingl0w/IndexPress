"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FilterBarProps {
  subjects: string[];
  authors: string[];
  filteredCount: number;
}

const SORT_OPTIONS = [
  { value: "title-asc", label: "Title A\u2013Z" },
  { value: "title-desc", label: "Title Z\u2013A" },
  { value: "author-asc", label: "Author A\u2013Z" },
  { value: "shortest", label: "Shortest First" },
  { value: "longest", label: "Longest First" },
] as const;

export default function FilterBar({
  subjects,
  authors,
  filteredCount,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "title-asc";
  const currentSubject = searchParams.get("subject") || "";
  const currentAuthor = searchParams.get("author") || "";
  const currentQuery = searchParams.get("q") || "";

  const [authorSearch, setAuthorSearch] = useState("");
  const [authorOpen, setAuthorOpen] = useState(false);
  const authorRef = useRef<HTMLDivElement>(null);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset page when filters change
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  // Close author dropdown on outside click
  useEffect(() => {
    if (!authorOpen) return;
    function onClick(e: MouseEvent) {
      if (authorRef.current && !authorRef.current.contains(e.target as Node)) {
        setAuthorOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [authorOpen]);

  const filteredAuthors = authorSearch
    ? authors.filter((a) => a.toLowerCase().includes(authorSearch.toLowerCase()))
    : authors;

  const activeFilters: { label: string; key: string }[] = [];
  if (currentQuery) activeFilters.push({ label: `"${currentQuery}"`, key: "q" });
  if (currentSubject) activeFilters.push({ label: currentSubject, key: "subject" });
  if (currentAuthor) activeFilters.push({ label: currentAuthor, key: "author" });

  return (
    <div className="space-y-4">
      {/* Filter controls row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Filter books..."
            value={currentQuery}
            onChange={(e) => updateParams({ q: e.target.value || null })}
            className="w-full rounded-lg border border-stone-200 bg-white py-2 pl-10 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-stone-500 dark:focus:ring-stone-500"
            aria-label="Filter books by title or author"
          />
        </div>

        {/* Subject dropdown */}
        <select
          value={currentSubject}
          onChange={(e) => updateParams({ subject: e.target.value || null })}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:focus:border-stone-500 dark:focus:ring-stone-500"
          aria-label="Filter by subject"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Author dropdown (searchable) */}
        <div ref={authorRef} className="relative">
          <button
            onClick={() => setAuthorOpen(!authorOpen)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:focus:border-stone-500 dark:focus:ring-stone-500 sm:w-44"
            aria-expanded={authorOpen}
            aria-label="Filter by author"
          >
            <span className="truncate">
              {currentAuthor || "All Authors"}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {authorOpen && (
            <div className="absolute right-0 z-30 mt-1 max-h-64 w-64 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900">
              <div className="border-b border-stone-200 p-2 dark:border-stone-700">
                <input
                  type="search"
                  placeholder="Search authors..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  className="w-full rounded border border-stone-200 bg-white px-2 py-1.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500"
                  aria-label="Search authors"
                  autoFocus
                />
              </div>
              <ul className="max-h-48 overflow-y-auto py-1" role="listbox">
                <li>
                  <button
                    onClick={() => {
                      updateParams({ author: null });
                      setAuthorOpen(false);
                      setAuthorSearch("");
                    }}
                    className={`w-full px-3 py-1.5 text-left text-sm ${
                      !currentAuthor
                        ? "bg-stone-100 font-medium text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                        : "text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800"
                    }`}
                    role="option"
                    aria-selected={!currentAuthor}
                  >
                    All Authors
                  </button>
                </li>
                {filteredAuthors.map((a) => (
                  <li key={a}>
                    <button
                      onClick={() => {
                        updateParams({ author: a });
                        setAuthorOpen(false);
                        setAuthorSearch("");
                      }}
                      className={`w-full px-3 py-1.5 text-left text-sm ${
                        currentAuthor === a
                          ? "bg-stone-100 font-medium text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                          : "text-stone-600 hover:bg-stone-50 dark:text-stone-400 dark:hover:bg-stone-800"
                      }`}
                      role="option"
                      aria-selected={currentAuthor === a}
                    >
                      {a}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:focus:border-stone-500 dark:focus:ring-stone-500"
          aria-label="Sort books"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {filteredCount.toLocaleString()} result{filteredCount !== 1 ? "s" : ""}
          </span>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => updateParams({ [f.key]: null })}
              className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
              aria-label={`Remove filter: ${f.label}`}
            >
              {f.label}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ))}
          <button
            onClick={() => {
              router.push(pathname, { scroll: false });
            }}
            className="text-xs text-stone-500 underline hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

export { SORT_OPTIONS };
