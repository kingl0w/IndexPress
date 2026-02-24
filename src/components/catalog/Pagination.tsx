"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalItems: number;
  perPage: number;
  currentPage: number;
}

export default function Pagination({
  totalItems,
  perPage,
  currentPage,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  // Build page numbers to show: always show first, last, current, and neighbors
  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-col items-center gap-4">
      <p className="text-sm text-stone-500 dark:text-stone-400">
        Showing {start}&ndash;{end} of {totalItems.toLocaleString()} books
      </p>

      <div className="flex items-center gap-1">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Previous page"
          >
            &larr; Prev
          </Link>
        ) : (
          <span className="rounded-lg px-3 py-2 text-sm text-stone-300 dark:text-stone-600">
            &larr; Prev
          </span>
        )}

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 text-stone-400 dark:text-stone-500"
              aria-hidden="true"
            >
              &hellip;
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              {page}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            aria-label="Next page"
          >
            Next &rarr;
          </Link>
        ) : (
          <span className="rounded-lg px-3 py-2 text-sm text-stone-300 dark:text-stone-600">
            Next &rarr;
          </span>
        )}
      </div>
    </nav>
  );
}
