import Link from "next/link";
import { getAllBooks, getAllAuthors, getAllSubjects } from "../../lib/data";
import { formatAuthorName, SITE_NAME, SITE_URL } from "@/lib/utils";
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
      "Read thousands of free classic books from Project Gutenberg.",
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
      <section className="py-12 text-center sm:py-20">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
          Classic Literature,
          <br />
          Free &amp; Open
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
          {totalChapters.toLocaleString()}+ pages of free classic literature from
          Project Gutenberg. Read online, no sign-up required.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/books"
            className="inline-flex items-center rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
          >
            Browse All Books
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center rounded-lg border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Search the Catalog
          </Link>
        </div>
      </section>

      {/*stats*/}
      <section
        aria-label="Library statistics"
        className="grid grid-cols-3 gap-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-900 sm:p-8"
      >
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {books.length.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Books</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 sm:text-3xl">
            {authors.length.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Authors</p>
        </div>
        <div className="text-center">
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
            className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((book) => (
            <Link
              key={book.slug}
              href={`/books/${book.slug}`}
              className="group rounded-lg border border-stone-200 p-4 transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-500 dark:hover:bg-stone-800"
            >
              <h3 className="font-semibold text-stone-900 group-hover:text-stone-700 dark:text-stone-100 dark:group-hover:text-stone-300">
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
            className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            All subjects &rarr;
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topSubjects.map((subject) => (
            <Link
              key={subject.name}
              href={`/subjects/${encodeURIComponent(subject.name)}`}
              className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-500 dark:hover:bg-stone-800"
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
      <section className="mt-16 mb-8 rounded-xl bg-stone-900 p-8 text-center dark:bg-stone-800">
        <h2 className="text-2xl font-bold text-white">
          Find Your Next Read
        </h2>
        <p className="mx-auto mt-2 max-w-md text-stone-300">
          Search across {books.length.toLocaleString()} books and{" "}
          {subjects.length.toLocaleString()} subjects to discover classic
          literature.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-stone-900 hover:bg-stone-100"
        >
          Search the Library
        </Link>
      </section>
    </>
  );
}
