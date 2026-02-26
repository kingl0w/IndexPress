import type { Metadata } from "next";
import { getAllBooks, getAllSubjects, getAllAuthors } from "../../../lib/data";
import CatalogBrowser from "@/components/catalog/CatalogBrowser";

export const metadata: Metadata = {
  title: "Browse All Books",
  description:
    "Browse the complete catalog of free classic books available to read online on IndexPress. Filter by subject, author, or search by title.",
  openGraph: {
    title: "Browse All Books | IndexPress",
    description:
      "Browse the complete catalog of free classic books available to read online.",
  },
};

export default function BooksPage() {
  const books = getAllBooks();
  const subjects = getAllSubjects();
  const authors = getAllAuthors();

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stone-100">
          Browse All Books
        </h1>
        <p className="mt-2 text-stone-400">
          {books.length.toLocaleString()} books available to read for free.
        </p>
      </div>

      <CatalogBrowser books={books} subjects={subjects} authors={authors} />
    </section>
  );
}
