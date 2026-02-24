export default function AuthorDetailLoading() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb */}
      <div className="mb-6 flex gap-2">
        <div className="h-4 w-12 rounded bg-stone-200 dark:bg-stone-700" />
        <div className="h-4 w-16 rounded bg-stone-200 dark:bg-stone-700" />
        <div className="h-4 w-28 rounded bg-stone-200 dark:bg-stone-700" />
      </div>

      <div className="h-9 w-48 rounded bg-stone-200 dark:bg-stone-700" />
      <div className="mt-3 h-5 w-64 rounded bg-stone-200 dark:bg-stone-700" />

      {/* Book grid skeleton */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-stone-200 dark:border-stone-700"
          >
            <div className="aspect-[3/2] rounded-t-lg bg-stone-200 dark:bg-stone-700" />
            <div className="p-4">
              <div className="h-5 w-3/4 rounded bg-stone-200 dark:bg-stone-700" />
              <div className="mt-2 h-4 w-1/2 rounded bg-stone-200 dark:bg-stone-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
