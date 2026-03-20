import Link from "next/link";
import type { BookMeta } from "../../../lib/types";
import { formatAuthorName } from "@/lib/utils";

const COVER_PALETTES = [
  { from: "from-rose-900", to: "to-rose-950" },
  { from: "from-sky-900", to: "to-sky-950" },
  { from: "from-red-900", to: "to-red-950" },
  { from: "from-violet-900", to: "to-violet-950" },
  { from: "from-yellow-900", to: "to-yellow-950" },
  { from: "from-slate-800", to: "to-slate-950" },
  { from: "from-indigo-900", to: "to-indigo-950" },
  { from: "from-fuchsia-900", to: "to-fuchsia-950" },
  { from: "from-orange-900", to: "to-orange-950" },
  { from: "from-blue-900", to: "to-blue-950" },
  { from: "from-stone-800", to: "to-stone-950" },
];

function hashTitle(title: string): number {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

interface BookCardProps {
  book: BookMeta;
}

export default function BookCard({ book }: BookCardProps) {
  const palette = COVER_PALETTES[hashTitle(book.title) % COVER_PALETTES.length];
  const author = formatAuthorName(book.author.name);
  const displaySubjects = book.subjects.slice(0, 2);

  return (
    <Link
      href={`/books/${book.slug}`}
      className="group flex gap-4 rounded-lg border border-border bg-surface p-3 transition-colors hover:border-secondary sm:flex-col sm:p-0 sm:pb-4"
    >
      {/*CSS-only book cover*/}
      <div
        className={`hidden aspect-[2/3] w-full flex-col justify-end overflow-hidden rounded-t-lg bg-gradient-to-br ${palette.from} ${palette.to} p-4 sm:flex`}
        aria-hidden="true"
      >
        <p className="line-clamp-2 text-sm font-bold leading-snug text-white/90">
          {book.title}
        </p>
        <p className="mt-1 truncate text-xs text-white/60">{author}</p>
      </div>

      {/*mobile mini cover*/}
      <div
        className={`flex h-24 w-16 shrink-0 items-end rounded bg-gradient-to-br ${palette.from} ${palette.to} p-1.5 sm:hidden`}
        aria-hidden="true"
      >
        <p className="line-clamp-2 text-[9px] font-bold leading-tight text-white/80">
          {book.title}
        </p>
      </div>

      {/*book info*/}
      <div className="min-w-0 flex-1 sm:px-4">
        <h3 className="line-clamp-2 font-semibold text-ink">
          {book.title}
        </h3>
        <p className="mt-0.5 truncate text-sm text-secondary">
          {author}
        </p>

        {displaySubjects.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {displaySubjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full border border-border px-1.5 py-0.5 text-[10px] font-medium text-secondary"
              >
                {subject}
              </span>
            ))}
          </div>
        )}

        <p className="mt-2 text-xs text-secondary">
          {book.totalChapters} ch &middot; {book.totalWordCount.toLocaleString()} words
        </p>
      </div>
    </Link>
  );
}
