import Link from "next/link";
import type { BookMeta } from "../../../lib/types";
import { formatAuthorName } from "@/lib/utils";

const COVER_PALETTES = [
  { from: "from-rose-800", to: "to-rose-950" },
  { from: "from-sky-800", to: "to-sky-950" },
  { from: "from-emerald-800", to: "to-emerald-950" },
  { from: "from-amber-800", to: "to-amber-950" },
  { from: "from-violet-800", to: "to-violet-950" },
  { from: "from-teal-800", to: "to-teal-950" },
  { from: "from-slate-700", to: "to-slate-900" },
  { from: "from-indigo-800", to: "to-indigo-950" },
  { from: "from-fuchsia-800", to: "to-fuchsia-950" },
  { from: "from-cyan-800", to: "to-cyan-950" },
  { from: "from-orange-800", to: "to-orange-950" },
  { from: "from-lime-800", to: "to-lime-950" },
  { from: "from-pink-800", to: "to-pink-950" },
  { from: "from-blue-800", to: "to-blue-950" },
  { from: "from-stone-700", to: "to-stone-900" },
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
      className="group flex gap-4 rounded-lg border border-stone-200 p-3 transition-all duration-200 hover:scale-[1.02] hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 dark:border-stone-800 dark:hover:border-teal-500/30 dark:hover:shadow-teal-500/10 sm:flex-col sm:p-0 sm:pb-4"
    >
      {/*CSS-only book cover*/}
      <div
        className={`hidden aspect-[3/2] w-full flex-col justify-end overflow-hidden rounded-t-lg bg-gradient-to-br ${palette.from} ${palette.to} p-4 transition-transform duration-200 group-hover:scale-[1.01] sm:flex`}
        aria-hidden="true"
      >
        <p className="line-clamp-2 text-sm font-bold leading-snug text-white/90">
          {book.title}
        </p>
        <p className="mt-1 truncate text-xs text-white/60">{author}</p>
      </div>

      {/*mobile mini cover*/}
      <div
        className={`flex h-20 w-14 shrink-0 items-end rounded bg-gradient-to-br ${palette.from} ${palette.to} p-1.5 sm:hidden`}
        aria-hidden="true"
      >
        <p className="line-clamp-2 text-[8px] font-bold leading-tight text-white/80">
          {book.title}
        </p>
      </div>

      {/*book info*/}
      <div className="min-w-0 flex-1 sm:px-4">
        <h3 className="line-clamp-2 font-semibold text-stone-900 group-hover:text-teal-700 dark:text-stone-100 dark:group-hover:text-teal-400 transition-colors">
          {book.title}
        </h3>
        <p className="mt-0.5 truncate text-sm text-stone-500 dark:text-stone-400">
          {author}
        </p>

        {displaySubjects.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {displaySubjects.map((subject) => (
              <span
                key={subject}
                className="rounded-full bg-teal-50 px-1.5 py-0.5 text-[10px] font-medium text-teal-700 dark:bg-teal-500/10 dark:text-teal-400"
              >
                {subject}
              </span>
            ))}
          </div>
        )}

        <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">
          {book.totalChapters} ch &middot; {book.totalWordCount.toLocaleString()} words
        </p>
      </div>
    </Link>
  );
}
