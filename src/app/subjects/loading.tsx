export default function SubjectsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-9 w-40 rounded bg-stone-700" />
        <div className="mt-3 h-5 w-56 rounded bg-stone-700" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-stone-700 border-l-4 border-l-stone-600 px-4 py-3"
          >
            <div className="h-4 w-36 rounded bg-stone-700" />
            <div className="h-4 w-6 rounded bg-stone-700" />
          </div>
        ))}
      </div>
    </div>
  );
}
