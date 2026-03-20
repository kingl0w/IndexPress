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

  const [localQuery, setLocalQuery] = useState(currentQuery);
  const [authorSearch, setAuthorSearch] = useState("");
  const [authorOpen, setAuthorOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const authorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local query when URL param changes externally (e.g. filter chip cleared)
  useEffect(() => {
    setLocalQuery(currentQuery);
  }, [currentQuery]);

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
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const closeAuthorDropdown = useCallback(() => {
    setAuthorOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!authorOpen) return;
    function onClick(e: MouseEvent) {
      if (authorRef.current && !authorRef.current.contains(e.target as Node)) {
        setAuthorOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [authorOpen]);

  // Reset focused index when filtered authors change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [authorSearch]);

  const filteredAuthors = authorSearch
    ? authors.filter((a) => a.toLowerCase().includes(authorSearch.toLowerCase()))
    : authors;

  // Total options = "All Authors" + filteredAuthors
  const totalOptions = 1 + filteredAuthors.length;

  const focusOption = useCallback((index: number) => {
    if (!listRef.current) return;
    const options = listRef.current.querySelectorAll<HTMLButtonElement>('[role="option"]');
    if (index >= 0 && index < options.length) {
      options[index].focus();
      setFocusedIndex(index);
    }
  }, []);

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = focusedIndex < totalOptions - 1 ? focusedIndex + 1 : 0;
        focusOption(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = focusedIndex > 0 ? focusedIndex - 1 : totalOptions - 1;
        focusOption(prev);
      } else if (e.key === "Escape") {
        closeAuthorDropdown();
      }
    },
    [focusedIndex, totalOptions, focusOption, closeAuthorDropdown]
  );

  // Handle arrow keys from the search input to move into the list
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusOption(0);
      } else if (e.key === "Escape") {
        closeAuthorDropdown();
      }
    },
    [focusOption, closeAuthorDropdown]
  );

  const activeFilters: { label: string; key: string }[] = [];
  if (currentQuery) activeFilters.push({ label: `"${currentQuery}"`, key: "q" });
  if (currentSubject) activeFilters.push({ label: currentSubject, key: "subject" });
  if (currentAuthor) activeFilters.push({ label: currentAuthor, key: "author" });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary"
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
            type="text"
            placeholder="Filter books..."
            value={localQuery}
            onChange={(e) => {
              const val = e.target.value;
              setLocalQuery(val);
              if (debounceRef.current) clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(() => {
                updateParams({ q: val || null });
              }, 300);
            }}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-3 text-sm text-ink placeholder:text-secondary focus:border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/40"
            aria-label="Filter books by title or author"
          />
        </div>

        <select
          value={currentSubject}
          onChange={(e) => updateParams({ subject: e.target.value || null })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/40"
          aria-label="Filter by subject"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div ref={authorRef} className="relative">
          <button
            ref={triggerRef}
            onClick={() => setAuthorOpen(!authorOpen)}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/40 sm:w-44"
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
            <div className="absolute right-0 z-30 mt-1 max-h-64 w-64 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              <div className="border-b border-border p-2">
                <input
                  type="text"
                  placeholder="Search authors..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full rounded border border-border bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-secondary focus:border-accent/30 focus:outline-none"
                  aria-label="Search authors"
                  autoFocus
                />
              </div>
              <ul
                ref={listRef}
                className="max-h-48 overflow-y-auto py-1"
                role="listbox"
                onKeyDown={handleListKeyDown}
              >
                <li>
                  <button
                    onClick={() => {
                      updateParams({ author: null });
                      closeAuthorDropdown();
                      setAuthorSearch("");
                    }}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      !currentAuthor
                        ? "bg-surface font-medium text-ink"
                        : "text-secondary hover:bg-surface"
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
                        closeAuthorDropdown();
                        setAuthorSearch("");
                      }}
                      className={`w-full px-3 py-2 text-left text-sm ${
                        currentAuthor === a
                          ? "bg-surface font-medium text-ink"
                          : "text-secondary hover:bg-surface"
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

        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-accent/30 focus:outline-none focus:ring-1 focus:ring-accent/40"
          aria-label="Sort books"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-secondary">
            {filteredCount.toLocaleString()} result{filteredCount !== 1 ? "s" : ""}
          </span>
          {activeFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => updateParams({ [f.key]: null })}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-ink hover:border-secondary"
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
            className="text-xs text-secondary underline hover:text-ink"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

export { SORT_OPTIONS };
