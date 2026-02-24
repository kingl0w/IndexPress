import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllAuthors, getBooksByAuthor } from "../../../../lib/data";
import { formatAuthorName, SITE_URL } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookGrid from "@/components/catalog/BookGrid";

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateStaticParams() {
  const authors = getAllAuthors();
  return authors.map((name) => ({ name: encodeURIComponent(name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  const displayName = formatAuthorName(name);
  const books = getBooksByAuthor(name);

  if (books.length === 0) return { title: "Author Not Found" };

  const title = `Books by ${displayName} — Free to Read Online`;
  const description = `Read ${books.length} ${books.length === 1 ? "book" : "books"} by ${displayName} online for free. Classic literature from Project Gutenberg.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/authors/${encodeURIComponent(name)}`,
    },
    openGraph: { title, description },
    twitter: { card: "summary" },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);
  const books = getBooksByAuthor(name);

  // Find exact match — getBooksByAuthor does partial matching
  const exactBooks = books.filter(
    (b) => b.author.name.toLowerCase() === name.toLowerCase()
  );
  const matchedBooks = exactBooks.length > 0 ? exactBooks : books;

  if (matchedBooks.length === 0) notFound();

  const displayName = formatAuthorName(name);
  const authorInfo = matchedBooks[0].author;
  const totalWords = matchedBooks.reduce((s, b) => s + b.totalWordCount, 0);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: displayName,
    ...(authorInfo.birthYear && {
      birthDate: String(authorInfo.birthYear),
    }),
    ...(authorInfo.deathYear && {
      deathDate: String(authorInfo.deathYear),
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Authors",
        item: `${SITE_URL}/authors`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: `${SITE_URL}/authors/${encodeURIComponent(name)}`,
      },
    ],
  };

  // Bio line
  const lifespan =
    authorInfo.birthYear && authorInfo.deathYear
      ? ` (${authorInfo.birthYear}\u2013${authorInfo.deathYear})`
      : authorInfo.birthYear
        ? ` (b. ${authorInfo.birthYear})`
        : "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <Breadcrumbs
        className="mb-6"
        items={[
          { label: "Home", href: "/" },
          { label: "Authors", href: "/authors" },
          { label: displayName },
        ]}
      />

      <section>
        <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
          {displayName}
        </h1>

        {/* Bio line */}
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {displayName}
          {lifespan} &mdash; {matchedBooks.length}{" "}
          {matchedBooks.length === 1 ? "work" : "works"} available
          {totalWords > 0 && (
            <span className="text-stone-400 dark:text-stone-500">
              {" "}
              &middot; {totalWords.toLocaleString()} words total
            </span>
          )}
        </p>

        <div className="mt-8">
          <BookGrid books={matchedBooks} />
        </div>

        <div className="mt-8">
          <Link
            href="/authors"
            className="text-sm text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            &larr; All Authors
          </Link>
        </div>
      </section>
    </>
  );
}
