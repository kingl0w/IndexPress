import Link from "next/link";
import { getAllBooks, getAllAuthors, getAllSubjects } from "../../lib/data";
import { formatAuthorName, SITE_NAME, SITE_URL } from "@/lib/utils";
import HeroSearch from "@/components/HeroSearch";
import type { BookMeta } from "../../lib/types";

function pickFeatured(books: BookMeta[], count: number): BookMeta[] {
  const sorted = [...books].sort((a, b) => a.id - b.id);
  if (sorted.length <= count) return sorted;
  const step = sorted.length / count;
  return Array.from({ length: count }, (_, i) => sorted[Math.floor(i * step)]);
}

function getTopSubjects(books: BookMeta[], count: number): { name: string; bookCount: number }[] {
  const counts = new Map<string, number>();
  for (const book of books) {
    for (const subject of book.subjects) {
      counts.set(subject, (counts.get(subject) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([name, bookCount]) => ({ name, bookCount }));
}

export default function HomePage() {
  const books = getAllBooks();
  const authors = getAllAuthors();
  const subjects = getAllSubjects();
  const featured = pickFeatured(books, Math.min(8, books.length));
  const topSubjects = getTopSubjects(books, 6);
  const totalChapters = books.reduce((sum, b) => sum + b.totalChapters, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Read thousands of free classic books on IndexPress.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*hero*/}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 px-6 py-16 text-center sm:px-12 sm:py-24">
        {/*decorative glow effects*/}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(129,140,248,0.15),transparent_50%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(168,85,247,0.1),transparent_50%)]"
          aria-hidden="true"
        />

        <div className="relative">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Classic Literature,
            <br />
            <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200 bg-clip-text text-transparent">
              Free &amp; Open
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100/80">
            {totalChapters.toLocaleString()}+ chapters of free classic literature.
            Read online, no sign-up required.
          </p>

          <div className="mt-8">
            <HeroSearch />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/books"
              className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-900 shadow-lg shadow-indigo-950/30 transition-all hover:bg-indigo-50 hover:shadow-xl hover:shadow-indigo-950/40"
            >
              Browse All Books
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center rounded-lg border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/20"
            >
              Search the Catalog
            </Link>
          </div>
        </div>
      </section>

      {/*stats*/}
      <section
        aria-label="Library statistics"
        className="-mt-6 relative z-10 mx-4 grid grid-cols-3 gap-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 p-6 shadow-lg dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-purple-950/40 dark:to-indigo-950/40 sm:mx-8 sm:p-8 lg:mx-16"
      >
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
            <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {books.length.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Books</p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
            <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {authors.length.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Authors</p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50">
            <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {totalChapters.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Chapters</p>
        </div>
      </section>

      {/*featured books*/}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Featured Books
          </h2>
          <Link
            href="/books"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((book) => (
            <Link
              key={book.slug}
              href={`/books/${book.slug}`}
              className="group rounded-lg border border-stone-200 p-4 transition-all duration-200 hover:scale-[1.02] hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-stone-700 dark:hover:border-indigo-500/50 dark:hover:shadow-indigo-500/20"
            >
              <h3 className="font-semibold text-stone-900 group-hover:text-indigo-700 dark:text-stone-100 dark:group-hover:text-indigo-400 transition-colors">
                {book.title}
              </h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {formatAuthorName(book.author.name)}
              </p>
              <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
                {book.totalChapters} chapters &middot;{" "}
                {book.totalWordCount.toLocaleString()} words
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/*subject categories*/}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Browse by Subject
          </h2>
          <Link
            href="/subjects"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            All subjects &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topSubjects.map((subject) => (
            <Link
              key={subject.name}
              href={`/subjects/${encodeURIComponent(subject.name)}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow-sm dark:border-stone-700 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-950/20"
            >
              <span className="font-medium text-stone-700 dark:text-stone-300">
                {subject.name}
              </span>
              <span className="text-sm text-stone-400 dark:text-stone-500">
                {subject.bookCount} {subject.bookCount === 1 ? "book" : "books"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/*search CTA*/}
      <section className="mt-16 mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 p-8 text-center dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-950">
        <h2 className="text-2xl font-bold text-white">
          Find Your Next Read
        </h2>
        <p className="mx-auto mt-2 max-w-md text-indigo-200/80">
          Search across {books.length.toLocaleString()} books and{" "}
          {subjects.length.toLocaleString()} subjects to discover classic
          literature.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-indigo-900 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
        >
          Search the Library
        </Link>
      </section>
    </>
  );
}
