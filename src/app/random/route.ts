import { redirect } from "next/navigation";
import { getAllBooks } from "../../../lib/data";

export const dynamic = "force-dynamic";

export function GET() {
  const books = getAllBooks();
  const book = books[Math.floor(Math.random() * books.length)];
  redirect(`/books/${book.slug}`);
}
