import type { Metadata } from "next";
import Link from "next/link";
import { getAllBooks, getAllSubjects } from "../../../lib/data";

export const metadata: Metadata = {
  title: "Subjects",
  description:
    "Browse books by subject and genre. Find classic fiction, poetry, drama, philosophy, and more — all free to read online.",
  openGraph: {
    title: "Subjects | IndexPress",
    description: "Browse books by subject and genre on IndexPress.",
  },
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function SubjectsPage() {
  const books = getAllBooks();
  const subjects = getAllSubjects();

  const subjectCounts = new Map<string, number>();
  for (const book of books) {
    for (const subject of book.subjects) {
      subjectCounts.set(subject, (subjectCounts.get(subject) ?? 0) + 1);
    }
  }

  const sorted = [...subjects].sort(
    (a, b) => (subjectCounts.get(b) ?? 0) - (subjectCounts.get(a) ?? 0)
  );

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">
          Subjects
        </h1>
        <p className="mt-2 text-secondary">
          {subjects.length.toLocaleString()} subjects across the library.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((subject) => {
          const count = subjectCounts.get(subject) ?? 0;

          return (
            <Link
              key={subject}
              href={`/subjects/${encodeURIComponent(subject)}`}
              className="group flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 transition-colors hover:border-secondary"
            >
              <span className="font-medium text-ink">
                {subject}
              </span>
              <span className="ml-2 shrink-0 rounded-full border border-border px-2 py-0.5 text-xs tabular-nums text-secondary">
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
