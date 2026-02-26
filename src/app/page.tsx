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
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-center sm:px-12 sm:py-24">
        {/*decorative glow*/}
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(20,184,166,0.12),transparent_50%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.08),transparent_50%)]"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,_rgba(20,184,166,0.06),transparent_70%)]"
          aria-hidden="true"
        />

        <div className="relative">
          {/*radial glow behind heading*/}
          <div
            className="absolute left-1/2 top-4 -translate-x-1/2 w-[500px] h-[200px] bg-[radial-gradient(ellipse,_rgba(20,184,166,0.18),transparent_70%)] blur-2xl pointer-events-none"
            aria-hidden="true"
          />
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Classic Literature,
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">
              Free &amp; Open
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            {totalChapters.toLocaleString()}+ chapters of free classic literature.
            Read online, no sign-up required.
          </p>

          <div className="mt-8">
            <HeroSearch />
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/books"
              className="inline-flex items-center rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 hover:shadow-xl hover:shadow-teal-500/30"
            >
              Browse All Books
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center rounded-lg border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:border-teal-500/40 hover:text-teal-300 hover:bg-white/[0.03]"
            >
              Search the Catalog
            </Link>
          </div>
        </div>
      </section>

      {/*stats — gradient border wrapper*/}
      <div className="-mt-6 relative z-10 mx-4 rounded-xl bg-gradient-to-br from-teal-500/25 via-transparent to-emerald-500/25 p-[1px] shadow-lg sm:mx-8 lg:mx-16">
        <section
          aria-label="Library statistics"
          className="grid grid-cols-3 gap-4 rounded-xl bg-slate-950 p-6 sm:p-8"
        >
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/10">
              <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-stone-100 sm:text-3xl">
              {books.length.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-slate-400">Books</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-stone-100 sm:text-3xl">
              {authors.length.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-slate-400">Authors</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
              <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-stone-100 sm:text-3xl">
              {totalChapters.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-slate-400">Chapters</p>
          </div>
        </section>
      </div>

      {/*featured books*/}
      <section className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-100">
            Featured Books
          </h2>
          <Link
            href="/books"
            className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((book) => (
            <Link
              key={book.slug}
              href={`/books/${book.slug}`}
              className="group rounded-lg border border-stone-800 border-l-[3px] border-l-teal-500/30 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-l-teal-400/60 hover:shadow-lg hover:shadow-teal-500/5"
            >
              <h3 className="font-semibold text-stone-100 group-hover:text-teal-400 transition-colors">
                {book.title}
              </h3>
              <p className="mt-1 text-sm text-stone-400">
                {formatAuthorName(book.author.name)}
              </p>
              {book.subjects.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {book.subjects.slice(0, 2).map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] font-medium text-stone-400 group-hover:bg-teal-500/10 group-hover:text-teal-400 transition-colors"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-stone-500">
                {book.totalChapters} chapters &middot;{" "}
                {book.totalWordCount.toLocaleString()} words
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/*subject categories*/}
      <section className="mt-20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-100">
            Browse by Subject
          </h2>
          <Link
            href="/subjects"
            className="text-sm font-medium text-teal-400 hover:text-teal-300 transition-colors"
          >
            All subjects &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topSubjects.map((subject) => (
            <Link
              key={subject.name}
              href={`/subjects/${encodeURIComponent(subject.name)}`}
              className="flex items-center justify-between rounded-lg border border-stone-800 border-l-[3px] border-l-teal-500/20 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-l-teal-400/50"
            >
              <span className="font-medium text-stone-300">
                {subject.name}
              </span>
              <span className="text-sm text-stone-500">
                {subject.bookCount} {subject.bookCount === 1 ? "book" : "books"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/*search CTA*/}
      <section className="mt-20 mb-8 relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 text-center">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(20,184,166,0.08),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-2xl font-bold text-white">
            Find Your Next Read
          </h2>
          <p className="mx-auto mt-2 max-w-md text-slate-300">
            Search across {books.length.toLocaleString()} books and{" "}
            {subjects.length.toLocaleString()} subjects to discover classic
            literature.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400 hover:shadow-xl hover:shadow-teal-500/30"
          >
            Search the Library
          </Link>
        </div>
      </section>
    </>
  );
}
