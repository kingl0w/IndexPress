export default function BooksLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="h-9 w-56 rounded bg-stone-200 dark:bg-stone-700" />
      <div className="mt-3 h-5 w-72 rounded bg-stone-200 dark:bg-stone-700" />

      {/* Filter bar skeleton */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="h-10 flex-1 rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="h-10 w-36 rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="h-10 w-36 rounded-lg bg-stone-200 dark:bg-stone-700" />
        <div className="h-10 w-36 rounded-lg bg-stone-200 dark:bg-stone-700" />
      </div>

      {/* Grid skeleton */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-stone-200 dark:border-stone-700"
          >
            <div className="aspect-[3/2] rounded-t-lg bg-stone-200 dark:bg-stone-700" />
            <div className="p-4">
              <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-stone-700" />
              <div className="mt-2 h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-700" />
              <div className="mt-3 h-3 w-1/3 rounded bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
