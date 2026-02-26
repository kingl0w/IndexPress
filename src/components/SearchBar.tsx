"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSearchSuggestions } from "../../lib/typesense-client";
import type { BookSearchResult } from "../../lib/typesense-client";

export default function SearchBar() {
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
      return;
    }
    try {
      const results = await getSearchSuggestions(q);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      setActiveSuggestion(-1);
      setShowSuggestions(true);

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 200);
    },
    [fetchSuggestions]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setShowSuggestions(false);
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      } else {
        router.push("/search");
      }
    },
    [query, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          Math.min(prev + 1, suggestions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) => Math.max(prev - 1, -1));
      } else if (e.key === "Enter" && activeSuggestion >= 0) {
        e.preventDefault();
        const suggestion = suggestions[activeSuggestion];
        if (suggestion) {
          setShowSuggestions(false);
          router.push(`/books/${suggestion.slug}`);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [showSuggestions, suggestions, activeSuggestion, router]
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
    const handler = () => {
      inputRef.current?.focus();
    };
    window.addEventListener("focus-search-bar", handler);
    return () => window.removeEventListener("focus-search-bar", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
          <svg
            className="w-4 h-4 text-stone-400"
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
          placeholder="Search..."
          className="w-full pl-8 pr-16 py-1.5 text-sm rounded-md border border-stone-700 bg-slate-900 text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/30"
          aria-label="Search books"
          role="combobox"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeSuggestion >= 0
              ? `suggestion-${activeSuggestion}`
              : undefined
          }
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs text-stone-400 border border-stone-700 rounded font-mono">
            {isMac ? "\u2318" : "Ctrl+"}K
          </kbd>
        </div>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute inset-y-0 right-12 flex items-center text-stone-400 hover:text-stone-300"
            aria-label="Clear search"
          >
            <svg
              className="w-3.5 h-3.5"
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
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden"
        >
          {suggestions.map((suggestion, i) => (
            <li
              key={suggestion.slug}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === activeSuggestion}
            >
              <Link
                href={`/books/${suggestion.slug}`}
                onClick={() => setShowSuggestions(false)}
                className={`block px-3 py-2 text-sm ${
                  i === activeSuggestion
                    ? "bg-teal-950/30"
                    : "hover:bg-slate-800"
                }`}
              >
                <span className="font-medium text-stone-100">
                  {suggestion.title}
                </span>
                <span className="text-stone-400 ml-2">
                  {suggestion.authorName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
