export default function AuthorsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 w-40 rounded bg-stone-200 dark:bg-stone-700" />
      <div className="mt-3 h-5 w-56 rounded bg-stone-200 dark:bg-stone-700" />

      {/*letter nav skeleton*/}
      <div className="mt-8 mb-8 flex flex-wrap gap-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-8 rounded bg-stone-200 dark:bg-stone-700"
          />
        ))}
      </div>

      {/*list skeleton*/}
      <div className="space-y-10">
        {Array.from({ length: 3 }).map((_, g) => (
          <div key={g}>
            <div className="mb-3 h-6 w-8 border-b border-stone-200 pb-2 dark:border-stone-700" />
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-stone-200 px-4 py-3 dark:border-stone-700"
                >
                  <div className="h-4 w-32 rounded bg-stone-200 dark:bg-stone-700" />
                  <div className="h-4 w-6 rounded bg-stone-200 dark:bg-stone-700" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
