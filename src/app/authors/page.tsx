import type { Metadata } from "next";
import Link from "next/link";
import { getAllBooks, getAllAuthors } from "../../../lib/data";
import { formatAuthorName } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Authors",
  description:
    "Browse all authors in the IndexPress library. Find classic literature by your favorite authors, free to read online.",
  openGraph: {
    title: "Authors | IndexPress",
    description: "Browse all authors in the IndexPress library.",
  },
};

export default function AuthorsPage() {
  const books = getAllBooks();
  const authors = getAllAuthors();

  const authorCounts = new Map<string, number>();
  for (const book of books) {
    authorCounts.set(
      book.author.name,
      (authorCounts.get(book.author.name) ?? 0) + 1
    );
  }

  //group by first letter (raw name is "last, first")
  const grouped = new Map<string, string[]>();
  for (const author of authors) {
    const letter = author[0].toUpperCase();
    const group = grouped.get(letter) ?? [];
    group.push(author);
    grouped.set(letter, group);
  }

  const letters = Array.from(grouped.keys()).sort();

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
          Authors
        </h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {authors.length.toLocaleString()} authors in the library.
        </p>
      </div>

      {/*letter jump navigation*/}
      <nav
        aria-label="Jump to letter"
        className="mb-8 flex flex-wrap gap-1"
      >
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="flex h-8 w-8 items-center justify-center rounded text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            {letter}
          </a>
        ))}
      </nav>

      {/*authors grouped by letter*/}
      <div className="space-y-10">
        {letters.map((letter) => {
          const group = grouped.get(letter)!;
          return (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="mb-3 border-b border-stone-200 pb-2 text-lg font-bold text-stone-900 dark:border-stone-700 dark:text-stone-100">
                {letter}
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((author) => (
                  <Link
                    key={author}
                    href={`/authors/${encodeURIComponent(author)}`}
                    className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 transition-colors hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-600 dark:hover:bg-stone-800"
                  >
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {formatAuthorName(author)}
                    </span>
                    <span className="ml-2 shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                      {authorCounts.get(author) ?? 0}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
