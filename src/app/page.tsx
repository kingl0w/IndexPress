import Link from "next/link";
import { getAllBooks, getAllSubjects } from "../../lib/data";
import { formatAuthorName, SITE_NAME, SITE_URL } from "@/lib/utils";
import HeroSearch from "@/components/HeroSearch";
import Epigraph from "@/components/Epigraph";
import RecentSearches from "@/components/RecentSearches";
import type { BookMeta } from "../../lib/types";

const COVER_PALETTES = [
  "from-rose-900 to-rose-950",
  "from-sky-900 to-sky-950",
  "from-red-900 to-red-950",
  "from-violet-900 to-violet-950",
  "from-yellow-900 to-yellow-950",
  "from-slate-800 to-slate-950",
  "from-indigo-900 to-indigo-950",
  "from-fuchsia-900 to-fuchsia-950",
  "from-orange-900 to-orange-950",
  "from-blue-900 to-blue-950",
  "from-stone-800 to-stone-950",
];

function coverGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash + title.charCodeAt(i)) | 0;
  }
  return COVER_PALETTES[Math.abs(hash) % COVER_PALETTES.length];
}

function pickFeatured(books: BookMeta[], count: number): BookMeta[] {
  const sorted = [...books].sort((a, b) => a.id - b.id);
  if (sorted.length <= count) return sorted;
  const step = sorted.length / count;
  return Array.from({ length: count }, (_, i) => sorted[Math.floor(i * step)]);
}

function getTopSubjects(books: BookMeta[], count: number): { name: string; bookCount: number }[] {
  const counts = new Map<string, number>();
  for (const book of books) {
    for (const subject of book.subjects) {
      counts.set(subject, (counts.get(subject) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([name, bookCount]) => ({ name, bookCount }));
}

export default function HomePage() {
  const books = getAllBooks();
  const subjects = getAllSubjects();
  const featured = pickFeatured(books, Math.min(7, books.length));
  const topSubjects = getTopSubjects(books, 8);

  const [pick, ...rest] = featured;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Read thousands of free classic books on IndexPress.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/*hero*/}
      <section className="rounded-lg sm:rounded-2xl bg-ink px-4 py-8 text-center sm:px-12 sm:py-14">
        {/*epigraph — hidden on very small screens to save space*/}
        <div className="hidden sm:block">
          <Epigraph />
        </div>

        {/*title block*/}
        <div className="mx-auto mt-0 sm:mt-6 max-w-2xl border-t border-b border-[#3A3330] py-5 sm:py-6">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#F5F0E8] sm:text-5xl md:text-6xl lg:text-7xl">
            Classic Literature
          </h1>
          <p className="mt-1 font-serif text-xl font-normal text-[#D4CCC0] sm:text-3xl md:text-4xl lg:text-5xl">
            Free &amp; Open
          </p>
        </div>

        <p className="mx-auto mt-4 sm:mt-5 max-w-md text-sm sm:text-base text-[#A89B8C]">
          {books.length.toLocaleString()} works. Every word free.
        </p>

        <div className="mt-5 sm:mt-6">
          <HeroSearch />
        </div>
        <Link
          href="/books"
          className="mt-4 sm:mt-5 inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-[#F5F0E8] transition-colors hover:bg-[#A03040]"
        >
          Browse All Books
        </Link>
      </section>

      {/*recent searches*/}
      <RecentSearches />

      {/*featured books — editor's pick + grid*/}
      <section className="mt-10 sm:mt-12 px-4 sm:px-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            Featured Books
          </h2>
          <Link
            href="/books"
            className="text-sm font-medium text-secondary hover:text-ink transition-colors"
          >
            View all &rarr;
          </Link>
        </div>

        {pick && (
          <div className="mt-5 sm:mt-6 flex flex-col gap-4 md:grid md:grid-cols-[1fr_1fr]">
            {/*editor's pick*/}
            <Link
              href={`/books/${pick.slug}`}
              className="group flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-lg border border-border bg-surface p-4 sm:p-6 transition-colors hover:border-secondary overflow-hidden"
            >
              {/*cover*/}
              <div
                className={`flex aspect-[2/3] w-full h-40 sm:h-auto sm:w-28 md:w-36 shrink-0 flex-col justify-between rounded-lg bg-gradient-to-br ${coverGradient(pick.title)} p-3 sm:p-4`}
                aria-hidden="true"
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold leading-tight text-white/90">
                    {pick.title}
                  </p>
                  <p className="mt-1 text-[10px] sm:text-xs text-white/60">
                    {formatAuthorName(pick.author.name)}
                  </p>
                </div>
                <p className="text-[8px] sm:text-[9px] tracking-widest text-white/25 uppercase">
                  IndexPress
                </p>
              </div>

              {/*pick info*/}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-ink">
                  Editor&rsquo;s Pick
                </p>
                <h3 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-ink group-hover:text-accent transition-colors line-clamp-2">
                  {pick.title}
                </h3>
                <p className="mt-1 text-sm text-secondary truncate">
                  {formatAuthorName(pick.author.name)}
                </p>
                {pick.subjects.length > 0 && (
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-secondary truncate">
                    {pick.subjects.slice(0, 3).join(" / ")}
                  </p>
                )}
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-secondary">
                  {pick.totalChapters} chapters &middot;{" "}
                  {pick.totalWordCount.toLocaleString()} words
                </p>
              </div>
            </Link>

            {/*remaining books — compact list*/}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {rest.map((book) => (
                <Link
                  key={book.slug}
                  href={`/books/${book.slug}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-surface px-3 sm:px-4 py-2.5 sm:py-3 transition-colors hover:border-secondary overflow-hidden"
                >
                  {/*mini cover*/}
                  <div
                    className={`flex h-10 w-7 sm:h-12 sm:w-8 shrink-0 items-end rounded bg-gradient-to-br ${coverGradient(book.title)} p-0.5 sm:p-1`}
                    aria-hidden="true"
                  >
                    <p className="line-clamp-2 text-[5px] sm:text-[6px] font-bold leading-tight text-white/80">
                      {book.title}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm sm:text-base font-semibold text-ink group-hover:text-accent transition-colors">
                      {book.title}
                    </h3>
                    <p className="truncate text-xs sm:text-sm text-secondary">
                      {formatAuthorName(book.author.name)}
                      <span className="text-border"> &middot; </span>
                      {book.totalChapters} ch
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/*subjects — typographic index*/}
      <section className="mt-16 sm:mt-20 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            Browse by Subject
          </h2>
          <Link
            href="/subjects"
            className="text-sm font-medium text-secondary hover:text-ink transition-colors"
          >
            All subjects &rarr;
          </Link>
        </div>

        <div className="mt-6 sm:mt-8 grid gap-x-12 gap-y-3 sm:gap-y-4 sm:grid-cols-2">
          {topSubjects.map((subject) => (
            <Link
              key={subject.name}
              href={`/subjects/${encodeURIComponent(subject.name)}`}
              className="group flex items-baseline justify-between border-b border-border py-2.5 sm:py-3 transition-colors hover:border-ink"
            >
              <span className="text-base sm:text-lg font-medium text-ink min-w-0">
                {subject.name}
              </span>
              <span className="ml-3 sm:ml-4 shrink-0 text-xs sm:text-sm tabular-nums text-secondary">
                {subject.bookCount}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
