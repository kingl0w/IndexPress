"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSearchSuggestions } from "../../lib/typesense-client";
import type { BookSearchResult } from "../../lib/typesense-client";
import { formatAuthorName } from "@/lib/utils";
import { addRecentSearch } from "@/lib/recent-searches";

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<BookSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().includes("MAC");

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const results = await getSearchSuggestions(q);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveSuggestion(-1);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 250);
    },
    [fetchSuggestions]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuggestions(false);
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        router.push(`/books/${suggestions[activeSuggestion].slug}`);
      } else if (query.trim()) {
        addRecentSearch(query.trim());
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [query, activeSuggestion, suggestions, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }

      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev > -1 ? prev - 1 : -1));
      }
    },
    [showSuggestions, suggestions]
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      inputRef.current?.focus();
    };
    window.addEventListener("focus-search-bar", handler);
    return () => window.removeEventListener("focus-search-bar", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative max-w-xl mx-auto w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              className="w-5 h-5 text-[#A89B8C]"
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
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search books, authors..."
            className="w-full py-3 sm:py-4 px-4 sm:px-5 pl-10 sm:pl-12 pr-16 sm:pr-20 text-base sm:text-lg rounded-xl bg-[#F5F0E8] border border-[#D4CCC0] text-[#1C1714] placeholder-[#A89B8C] focus:outline-none focus:ring-2 focus:ring-[#8B2635]/40 focus:border-[#8B2635]/30 transition-colors"
            aria-label="Search books"
            role="combobox"
            aria-expanded={showSuggestions && suggestions.length > 0}
            aria-controls="hero-search-suggestions"
            aria-activedescendant={
              activeSuggestion >= 0
                ? `hero-suggestion-${activeSuggestion}`
                : undefined
            }
            autoComplete="off"
          />

          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 text-xs text-[#6B5E52] border border-[#D4CCC0] rounded-md font-mono bg-[#EDE8DC]">
              {isMac ? "\u2318" : "Ctrl+"}K
            </kbd>
          </div>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="hero-search-suggestions"
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#F5F0E8] border border-[#D4CCC0] rounded-xl shadow-lg overflow-hidden text-left"
        >
          {suggestions.map((suggestion, i) => (
            <li
              key={suggestion.slug}
              role="presentation"
            >
              <Link
                id={`hero-suggestion-${i}`}
                role="option"
                aria-selected={i === activeSuggestion}
                href={`/books/${suggestion.slug}`}
                onClick={() => setShowSuggestions(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  i === activeSuggestion
                    ? "bg-[#EDE8DC]"
                    : "hover:bg-[#EDE8DC]"
                }`}
              >
                <svg
                  className="w-4 h-4 shrink-0 text-[#A89B8C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-[#1C1714] truncate block">
                    {suggestion.title}
                  </span>
                  <span className="text-sm text-[#6B5E52] truncate block">
                    {formatAuthorName(suggestion.authorName)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
          {query.trim() && (
            <li>
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setShowSuggestions(false)}
                className="flex items-center gap-3 px-4 py-3 border-t border-[#D4CCC0] text-sm text-[#8B2635] hover:bg-[#EDE8DC] transition-colors"
              >
                <svg
                  className="w-4 h-4 shrink-0"
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
                Search all results for &ldquo;{query.trim()}&rdquo;
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
