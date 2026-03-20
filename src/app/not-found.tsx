import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-8xl font-bold text-border">
        404
      </p>

      <h1 className="mt-6 text-2xl font-bold text-ink">
        Page Not Found
      </h1>

      <blockquote className="mt-4 max-w-md border-l-2 border-border pl-4 text-left text-secondary italic font-serif">
        &ldquo;Not all those who wander are lost.&rdquo;
        <footer className="mt-1 text-sm not-italic text-secondary">
          &mdash; J.R.R. Tolkien
        </footer>
      </blockquote>

      <p className="mt-6 text-secondary">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-background hover:bg-[#2A2420]"
        >
          Go Home
        </Link>
        <Link
          href="/books"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface"
        >
          Browse Books
        </Link>
        <Link
          href="/search"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-ink hover:bg-surface"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
