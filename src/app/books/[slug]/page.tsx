import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBooks, getBookBySlug } from "../../../../lib/data";
import { formatAuthorName, estimatePages, SITE_URL } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const books = getAllBooks();
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) return { title: "Book Not Found" };

  const author = formatAuthorName(book.author.name);
  const title = `${book.title} by ${author} — Read Free Online`;
  const description = `Read ${book.title} by ${author} online for free. ${book.totalChapters} chapters, ${book.totalWordCount.toLocaleString()} words. Classic literature from Project Gutenberg.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/books/${slug}` },
    openGraph: {
      title: `${book.title} by ${author}`,
      description,
      type: "article",
      url: `${SITE_URL}/books/${slug}`,
    },
    twitter: { card: "summary" },
  };
}

const COVER_GRADIENTS = [
  "from-rose-900 to-rose-950",
  "from-blue-900 to-blue-950",
  "from-emerald-900 to-emerald-950",
  "from-amber-900 to-amber-950",
  "from-violet-900 to-violet-950",
  "from-teal-900 to-teal-950",
  "from-slate-800 to-slate-950",
  "from-indigo-900 to-indigo-950",
];

function getAdjacentBooks(slug: string) {
  const books = getAllBooks();
  const sorted = [...books].sort((a, b) => a.title.localeCompare(b.title));
  const idx = sorted.findIndex((b) => b.slug === slug);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) notFound();

  const author = formatAuthorName(book.author.name);
  const pages = estimatePages(book.totalWordCount);
  const readingMinutes = Math.max(1, Math.ceil(book.totalWordCount / 250));
  const gradientClass = COVER_GRADIENTS[book.id % COVER_GRADIENTS.length];
  const { prev, next } = getAdjacentBooks(slug);

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: {
      "@type": "Person",
      name: author,
      ...(book.author.birthYear && { birthDate: String(book.author.birthYear) }),
      ...(book.author.deathYear && { deathDate: String(book.author.deathYear) }),
    },
    inLanguage: "en",
    numberOfPages: pages,
    about: book.subjects.join(", "),
    url: `${SITE_URL}/books/${slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
      { "@type": "ListItem", position: 3, name: book.title, item: `${SITE_URL}/books/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Books", href: "/books" },
          { label: book.title },
        ]}
      />

      <article>
        {/*hero*/}
        <div className="flex flex-col gap-8 sm:flex-row">
          {/*CSS-only book cover*/}
          <div className="shrink-0 self-start">
            <div
              className={`flex aspect-[2/3] w-44 flex-col justify-between rounded-lg bg-gradient-to-br ${gradientClass} p-5 shadow-lg sm:w-48`}
              aria-hidden="true"
            >
              <div>
                <p className="text-lg font-bold leading-tight text-white/90">
                  {book.title}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  {author}
                </p>
              </div>
              <p className="text-[10px] tracking-widest text-white/30 uppercase">
                IndexPress
              </p>
            </div>
          </div>

          {/*book info*/}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-stone-600 dark:text-stone-400">
              by{" "}
              <Link
                href={`/authors/${encodeURIComponent(book.author.name)}`}
                className="underline hover:text-stone-900 dark:hover:text-stone-200"
              >
                {author}
              </Link>
              {book.author.birthYear && (
                <span className="text-stone-400 dark:text-stone-500">
                  {" "}({book.author.birthYear}&ndash;{book.author.deathYear ?? "?"})
                </span>
              )}
            </p>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
              <div>
                <dt className="sr-only">Chapters</dt>
                <dd>{book.totalChapters} chapters</dd>
              </div>
              <div>
                <dt className="sr-only">Word count</dt>
                <dd>{book.totalWordCount.toLocaleString()} words</dd>
              </div>
              <div>
                <dt className="sr-only">Estimated pages</dt>
                <dd>~{pages} pages</dd>
              </div>
              <div>
                <dt className="sr-only">Reading time</dt>
                <dd>
                  ~{readingMinutes >= 60
                    ? `${Math.floor(readingMinutes / 60)}h ${readingMinutes % 60}m`
                    : `${readingMinutes} min`}{" "}
                  read
                </dd>
              </div>
            </dl>

            {book.subjects.length > 0 && (
              <div className="mt-5">
                <h2 className="sr-only">Subjects</h2>
                <div className="flex flex-wrap gap-2">
                  {book.subjects.map((subject) => (
                    <Link
                      key={subject}
                      href={`/subjects/${encodeURIComponent(subject)}`}
                      className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                    >
                      {subject}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Link
                href={`/books/${slug}/1`}
                className="inline-flex items-center rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-300"
              >
                Start Reading
              </Link>
            </div>
          </div>
        </div>

        {/*table of contents*/}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            Table of Contents
          </h2>
          <nav aria-label="Table of contents" className="mt-4">
            <ol className="space-y-1">
              {book.chapters.map((chapter) => (
                <li key={chapter.number}>
                  <Link
                    href={`/books/${slug}/${chapter.number}`}
                    className="flex items-center justify-between rounded px-3 py-2.5 text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xs tabular-nums text-stone-400 dark:text-stone-500">
                        {String(chapter.number).padStart(2, "0")}
                      </span>
                      <span>{chapter.title}</span>
                    </span>
                    <span className="text-xs text-stone-400 dark:text-stone-500">
                      {chapter.wordCount.toLocaleString()} words
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </section>

        {/*previous / next book*/}
        {(prev || next) && (
          <nav
            aria-label="Browse more books"
            className="mt-12 grid gap-4 border-t border-stone-200 pt-8 dark:border-stone-700 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/books/${prev.slug}`}
                className="group rounded-lg border border-stone-200 p-4 transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-500 dark:hover:bg-stone-800"
              >
                <p className="text-xs text-stone-400 dark:text-stone-500">&larr; Previous</p>
                <p className="mt-1 font-medium text-stone-900 group-hover:text-stone-700 dark:text-stone-100 dark:group-hover:text-stone-300">
                  {prev.title}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {formatAuthorName(prev.author.name)}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/books/${next.slug}`}
                className="group rounded-lg border border-stone-200 p-4 text-right transition-colors hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:hover:border-stone-500 dark:hover:bg-stone-800"
              >
                <p className="text-xs text-stone-400 dark:text-stone-500">Next &rarr;</p>
                <p className="mt-1 font-medium text-stone-900 group-hover:text-stone-700 dark:text-stone-100 dark:group-hover:text-stone-300">
                  {next.title}
                </p>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {formatAuthorName(next.author.name)}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}
      </article>
    </>
  );
}
