import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSubjects, getBooksBySubject } from "../../../../lib/data";
import { SITE_URL } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";
import BookGrid from "@/components/catalog/BookGrid";

interface Props {
  params: Promise<{ subject: string }>;
}

export async function generateStaticParams() {
  const subjects = getAllSubjects();
  return subjects.map((subject) => ({
    subject: encodeURIComponent(subject),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subject: rawSubject } = await params;
  const subject = decodeURIComponent(rawSubject);
  const books = getBooksBySubject(subject);

  const title = `${subject} — Browse Books by Subject`;
  const description = `Read ${books.length} free ${subject.toLowerCase()} ${books.length === 1 ? "book" : "books"} online. Classic literature from Project Gutenberg.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/subjects/${encodeURIComponent(subject)}`,
    },
    openGraph: { title, description },
    twitter: { card: "summary" },
  };
}

export default async function SubjectPage({ params }: Props) {
  const { subject: rawSubject } = await params;
  const subject = decodeURIComponent(rawSubject);
  const books = getBooksBySubject(subject);

  //filter for exact subject match
  const exactBooks = books.filter((b) =>
    b.subjects.some((s) => s.toLowerCase() === subject.toLowerCase())
  );
  const matchedBooks = exactBooks.length > 0 ? exactBooks : books;

  if (matchedBooks.length === 0) notFound();

  const sorted = [...matchedBooks].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Subjects",
        item: `${SITE_URL}/subjects`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: subject,
        item: `${SITE_URL}/subjects/${encodeURIComponent(subject)}`,
      },
    ],
  };

  return (
    <>
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
          { label: "Subjects", href: "/subjects" },
          { label: subject },
        ]}
      />

      <section>
        <h1 className="text-3xl font-bold text-stone-100">
          {subject}
        </h1>
        <p className="mt-2 text-stone-400">
          {sorted.length} {sorted.length === 1 ? "book" : "books"} in this
          subject
        </p>

        <div className="mt-8">
          <BookGrid books={sorted} />
        </div>

        <div className="mt-8">
          <Link
            href="/subjects"
            className="text-sm text-stone-400 hover:text-stone-200"
          >
            &larr; All Subjects
          </Link>
        </div>
      </section>
    </>
  );
}
