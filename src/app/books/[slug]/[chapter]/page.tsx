import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllBooks, getBookBySlug, getBookChapter } from "../../../../../lib/data";
import { formatAuthorName, SITE_URL } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";
import ReaderView from "@/components/reader/ReaderView";

interface Props {
  params: Promise<{ slug: string; chapter: string }>;
}

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  const books = getAllBooks();
  const params: { slug: string; chapter: string }[] = [];

  // Pre-generate first 3 chapters of each book at build time
  // Rest get generated and cached on first visit
  for (const meta of books) {
    const maxPregen = Math.min(meta.totalChapters, 3);
    for (let i = 1; i <= maxPregen; i++) {
      params.push({ slug: meta.slug, chapter: String(i) });
    }
  }

  console.log(`Pre-generating ${params.length} chapter pages (rest generated on demand)`);
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter: chapterStr } = await params;
  const chapterNum = parseInt(chapterStr, 10);
  const book = getBookBySlug(slug);
  if (!book) return { title: "Not Found" };

  const ch = book.chapters.find((c) => c.number === chapterNum);
  if (!ch) return { title: "Chapter Not Found" };

  const author = formatAuthorName(book.author.name);
  const title = `${ch.title} of ${book.title} by ${author}`;
  const description = `Read ${ch.title} of ${book.title} by ${author} online for free. ${ch.wordCount.toLocaleString()} words. Classic literature from Project Gutenberg.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/books/${slug}/${chapterNum}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/books/${slug}/${chapterNum}`,
    },
    twitter: { card: "summary" },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter: chapterStr } = await params;
  const chapterNum = parseInt(chapterStr, 10);
  if (isNaN(chapterNum)) notFound();

  const book = getBookBySlug(slug);
  if (!book) notFound();

  const chapter = getBookChapter(slug, chapterNum);
  if (!chapter) notFound();

  const author = formatAuthorName(book.author.name);
  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < book.totalChapters ? chapterNum + 1 : null;

  const chapterJsonLd = {
    "@context": "https://schema.org",
    "@type": "Chapter",
    name: chapter.title,
    isPartOf: {
      "@type": "Book",
      name: book.title,
      author: { "@type": "Person", name: author },
      url: `${SITE_URL}/books/${slug}`,
    },
    position: chapter.number,
    wordCount: chapter.wordCount,
    url: `${SITE_URL}/books/${slug}/${chapterNum}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
      { "@type": "ListItem", position: 3, name: book.title, item: `${SITE_URL}/books/${slug}` },
      { "@type": "ListItem", position: 4, name: chapter.title, item: `${SITE_URL}/books/${slug}/${chapterNum}` },
    ],
  };

  const chaptersForNav = book.chapters.map((ch) => ({
    number: ch.number,
    title: ch.title,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Home", href: "/" },
          { label: "Books", href: "/books" },
          { label: book.title, href: `/books/${slug}` },
          { label: chapter.title },
        ]}
      />

      <ReaderView
        bookTitle={book.title}
        bookSlug={slug}
        authorName={author}
        chapter={{
          number: chapter.number,
          title: chapter.title,
          content: chapter.content,
          wordCount: chapter.wordCount,
        }}
        chapters={chaptersForNav}
        totalChapters={book.totalChapters}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
      />
    </>
  );
}
