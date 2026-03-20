import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPageClient from "./search-client";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search across thousands of free classic books from Project Gutenberg by title, author, or keyword.",
  openGraph: {
    title: "Search | IndexPress",
    description:
      "Search across thousands of free classic books from Project Gutenberg.",
  },
};

export default function SearchPage() {
  return (
    <section className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-ink mb-6">
        Search
      </h1>
      <Suspense fallback={<SearchFallback />}>
        <SearchPageClient />
      </Suspense>
    </section>
  );
}

function SearchFallback() {
  return (
    <div className="animate-pulse">
      <div className="h-12 bg-border rounded-lg" />
      <div className="flex gap-4 mt-4 border-b border-border pb-2">
        <div className="h-4 bg-border rounded w-28" />
        <div className="h-4 bg-border rounded w-20" />
      </div>
    </div>
  );
}
