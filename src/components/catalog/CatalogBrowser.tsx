"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { BookMeta } from "../../../lib/types";
import { formatAuthorName } from "@/lib/utils";
import BookGrid from "./BookGrid";
import FilterBar from "./FilterBar";
import Pagination from "./Pagination";

const PER_PAGE = 48;

interface CatalogBrowserProps {
  books: BookMeta[];
  subjects: string[];
  authors: string[];
}

function CatalogBrowserInner({ books, subjects, authors }: CatalogBrowserProps) {
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const subject = searchParams.get("subject") || "";
  const author = searchParams.get("author") || "";
  const sort = searchParams.get("sort") || "title-asc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const filtered = useMemo(() => {
    let result = books;

    //text filter
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.name.toLowerCase().includes(q) ||
          formatAuthorName(b.author.name).toLowerCase().includes(q)
      );
    }

    //subject filter
    if (subject) {
      const s = subject.toLowerCase();
      result = result.filter((b) =>
        b.subjects.some((subj) => subj.toLowerCase() === s)
      );
    }

    //author filter
    if (author) {
      result = result.filter((b) => b.author.name === author);
    }

    //sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "author-asc":
          return a.author.name.localeCompare(b.author.name);
        case "shortest":
          return a.totalWordCount - b.totalWordCount;
        case "longest":
          return b.totalWordCount - a.totalWordCount;
        case "title-asc":
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [books, query, subject, author, sort]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <FilterBar
        subjects={subjects}
        authors={authors}
        filteredCount={filtered.length}
      />
      <BookGrid books={paginated} />
      <Pagination
        totalItems={filtered.length}
        perPage={PER_PAGE}
        currentPage={page}
      />
    </div>
  );
}

export default function CatalogBrowser(props: CatalogBrowserProps) {
  return (
    <Suspense>
      <CatalogBrowserInner {...props} />
    </Suspense>
  );
}
