import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllBooks, getBookBySlug, getBookChapter } from "../../../../lib/data";
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
  "from-amber-900 to-amber-950",
  "from-amber-900 to-amber-950",
  "from-violet-900 to-violet-950",
  "from-yellow-900 to-yellow-950",
  "from-slate-800 to-slate-950",
  "from-indigo-900 to-indigo-950",
];

/** Muted tint for the header accent border, keyed to the cover gradient */
const COVER_BORDER_COLORS = [
  "border-l-rose-800/40",
  "border-l-blue-800/40",
  "border-l-amber-800/40",
  "border-l-amber-800/40",
  "border-l-violet-800/40",
  "border-l-yellow-800/40",
  "border-l-slate-600/40",
  "border-l-indigo-800/40",
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

function getOpeningExcerpt(slug: string): string | null {
  const chapter = getBookChapter(slug, 1);
  if (!chapter?.content) return null;
  const text = chapter.content.replace(/\n+/g, " ").trim();
  // Take the first sentence (up to ~200 chars), or first 30 words
  const sentenceEnd = text.search(/[.!?]\s/);
  if (sentenceEnd > 0 && sentenceEnd < 200) {
    return text.slice(0, sentenceEnd + 1);
  }
  const words = text.split(/\s+/).slice(0, 30);
  return words.join(" ") + "\u2026";
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const book = getBookBySlug(slug);
  if (!book) notFound();

  const author = formatAuthorName(book.author.name);
  const pages = estimatePages(book.totalWordCount);
  const readingMinutes = Math.max(1, Math.ceil(book.totalWordCount / 250));
  const gradientIdx = book.id % COVER_GRADIENTS.length;
  const gradientClass = COVER_GRADIENTS[gradientIdx];
  const borderColor = COVER_BORDER_COLORS[gradientIdx];
  const { prev, next } = getAdjacentBooks(slug);
  const openingLine = getOpeningExcerpt(slug);

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
        {/*book header — cover bleeds color into the section*/}
        <div className={`flex flex-col gap-8 rounded-lg border-l-4 ${borderColor} bg-surface p-6 sm:flex-row sm:p-8`}>
          {/*CSS-only book cover*/}
          <div className="shrink-0 self-start">
            <div
              className={`flex aspect-[2/3] w-40 flex-col justify-between rounded-lg bg-gradient-to-br ${gradientClass} p-5 sm:w-44`}
              aria-hidden="true"
            >
              <div>
                <p className="font-serif text-lg font-bold leading-tight text-white/90">
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
            <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-secondary">
              by{" "}
              <Link
                href={`/authors/${encodeURIComponent(book.author.name)}`}
                className="underline underline-offset-2 hover:text-ink transition-colors"
              >
                {author}
              </Link>
              {book.author.birthYear && (
                <span className="text-secondary/70">
                  {" "}({book.author.birthYear}&ndash;{book.author.deathYear ?? "?"})
                </span>
              )}
            </p>

            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary">
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
                      className="rounded-full border border-border px-3 py-2 text-xs text-secondary hover:border-secondary hover:text-ink transition-colors"
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
                className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-8 py-3.5 text-base font-semibold text-[#F5F0E8] transition-colors hover:bg-[#A03040] sm:w-auto"
              >
                Start Reading
              </Link>
            </div>
          </div>
        </div>

        {/*opening hook*/}
        {openingLine && (
          <blockquote className="mx-auto mt-12 max-w-2xl border-l-2 border-border pl-6">
            <p className="font-serif text-lg italic leading-relaxed text-ink/80">
              &ldquo;{openingLine}&rdquo;
            </p>
            <cite className="mt-2 block text-sm not-italic text-secondary">
              &mdash; Opening line, Chapter 1
            </cite>
          </blockquote>
        )}

        {/*table of contents*/}
        <section className="mt-12">
          <h2 className="font-serif text-xl font-bold text-ink">
            Table of Contents
          </h2>
          <nav aria-label="Table of contents" className="mt-6">
            <ol className="border-l border-border ml-4">
              {book.chapters.map((chapter) => (
                <li key={chapter.number}>
                  <Link
                    href={`/books/${slug}/${chapter.number}`}
                    className="group flex items-baseline justify-between py-3 pl-6 pr-2 -ml-px border-l-2 border-transparent transition-colors hover:border-ink"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="text-sm tabular-nums text-secondary shrink-0">
                        {String(chapter.number).padStart(2, "0")}
                      </span>
                      <span className="font-serif text-ink">
                        {chapter.title}
                      </span>
                    </span>
                    <span className="ml-4 shrink-0 text-xs tabular-nums text-secondary">
                      {chapter.wordCount.toLocaleString()}
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
            className="mt-12 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={`/books/${prev.slug}`}
                className="group rounded-lg border border-border p-4 transition-colors hover:border-secondary"
              >
                <p className="text-xs text-secondary">&larr; Previous</p>
                <p className="mt-1 font-serif font-medium text-ink">
                  {prev.title}
                </p>
                <p className="text-sm text-secondary">
                  {formatAuthorName(prev.author.name)}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/books/${next.slug}`}
                className="group rounded-lg border border-border p-4 text-right transition-colors hover:border-secondary"
              >
                <p className="text-xs text-secondary">Next &rarr;</p>
                <p className="mt-1 font-serif font-medium text-ink">
                  {next.title}
                </p>
                <p className="text-sm text-secondary">
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
