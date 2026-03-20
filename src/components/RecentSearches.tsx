"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecentSearches, removeRecentSearch, clearRecentSearches } from "@/lib/recent-searches";

export default function RecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  if (searches.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <span className="text-xs text-secondary mr-1">Recent:</span>
      {searches.map((q) => (
        <span key={q} className="inline-flex items-center gap-1">
          <Link
            href={`/search?q=${encodeURIComponent(q)}`}
            className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-secondary transition-colors hover:border-ink hover:text-ink"
          >
            {q}
          </Link>
          <button
            onClick={() => setSearches(removeRecentSearch(q))}
            aria-label={`Remove "${q}" from recent searches`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-secondary hover:text-ink transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      ))}
      <button
        onClick={() => {
          clearRecentSearches();
          setSearches([]);
        }}
        className="ml-1 text-xs text-secondary underline hover:text-ink transition-colors"
      >
        Clear all
      </button>
    </div>
  );
}
