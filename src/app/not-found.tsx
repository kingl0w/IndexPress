import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-8xl font-bold text-stone-800">
        404
      </p>

      <h1 className="mt-6 text-2xl font-bold text-stone-100">
        Page Not Found
      </h1>

      <blockquote className="mt-4 max-w-md border-l-2 border-stone-600 pl-4 text-left text-stone-400 italic">
        &ldquo;Not all those who wander are lost.&rdquo;
        <footer className="mt-1 text-sm not-italic text-stone-500">
          &mdash; J.R.R. Tolkien
        </footer>
      </blockquote>

      <p className="mt-6 text-stone-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-stone-100 px-5 py-2.5 text-sm font-medium text-stone-900 hover:bg-stone-300"
        >
          Go Home
        </Link>
        <Link
          href="/books"
          className="rounded-lg border border-stone-600 px-5 py-2.5 text-sm font-medium text-stone-300 hover:bg-stone-800"
        >
          Browse Books
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-stone-600 px-5 py-2.5 text-sm font-medium text-stone-300 hover:bg-stone-800"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
