import * as fs from "fs";
import * as path from "path";
import Typesense from "typesense";
import type { Client } from "typesense";
import { booksSchema, chaptersSchema } from "./typesense-schema";
import type { Book, BookMeta } from "../lib/types";

const TYPESENSE_HOST = process.env.TYPESENSE_HOST ?? "localhost";
const TYPESENSE_PORT = parseInt(process.env.TYPESENSE_PORT ?? "8108", 10);
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL ?? "http";
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY;

if (!TYPESENSE_API_KEY) {
  console.error("Error: TYPESENSE_API_KEY environment variable is required");
  process.exit(1);
}

const useSample = process.env.SAMPLE_DATA === "true";
const DATA_DIR = path.join(process.cwd(), useSample ? "data/sample" : "data");
const INDEX_PATH = path.join(DATA_DIR, "book-index.json");
const PROCESSED_DIR = path.join(DATA_DIR, "processed");

const client: Client = new Typesense.Client({
  nodes: [{ host: TYPESENSE_HOST, port: TYPESENSE_PORT, protocol: TYPESENSE_PROTOCOL }],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});

async function deleteCollectionIfExists(name: string): Promise<void> {
  try {
    await client.collections(name).delete();
    console.log(`  Deleted existing "${name}" collection`);
  } catch (err: unknown) {
    const error = err as { httpStatus?: number };
    if (error.httpStatus === 404) {
      //collection doesn't exist
    } else {
      throw err;
    }
  }
}

function loadBookIndex(): BookMeta[] {
  const raw = fs.readFileSync(INDEX_PATH, "utf-8");
  return JSON.parse(raw) as BookMeta[];
}

function loadBook(slug: string): Book | null {
  const filePath = path.join(PROCESSED_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Book;
}

interface BookDocument {
  id: string;
  title: string;
  author_name: string;
  author_birth_year?: number;
  author_death_year?: number;
  subjects: string[];
  bookshelves: string[];
  total_chapters: number;
  total_word_count: number;
  slug: string;
}

interface ChapterDocument {
  id: string;
  book_slug: string;
  book_title: string;
  author_name: string;
  chapter_number: number;
  chapter_title: string;
  content: string;
  word_count: number;
}

async function indexBooks(books: BookMeta[]): Promise<number> {
  const BATCH_SIZE = 100;
  let indexed = 0;
  let failures = 0;

  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    const documents: BookDocument[] = batch.map((book) => ({
      id: book.slug,
      title: book.title,
      author_name: book.author.name,
      ...(book.author.birthYear != null ? { author_birth_year: book.author.birthYear } : {}),
      ...(book.author.deathYear != null ? { author_death_year: book.author.deathYear } : {}),
      subjects: book.subjects,
      bookshelves: book.bookshelves,
      total_chapters: book.totalChapters,
      total_word_count: book.totalWordCount,
      slug: book.slug,
    }));

    const results = await client
      .collections<BookDocument>("books")
      .documents()
      .import(documents, { batch_size: BATCH_SIZE });

    for (const result of results) {
      if (result.success) {
        indexed++;
      } else {
        failures++;
        console.error(`  Failed to index book: ${result.error}`);
      }
    }

    if ((i + BATCH_SIZE) % 500 < BATCH_SIZE) {
      console.log(`  Progress: ${Math.min(i + BATCH_SIZE, books.length)}/${books.length} books`);
    }
  }

  if (failures > 0) {
    console.warn(`  ${failures} book(s) failed to index`);
  }

  return indexed;
}

async function indexChapters(books: BookMeta[]): Promise<number> {
  const BATCH_SIZE = 200;
  let indexed = 0;
  let failures = 0;
  let totalChapters = 0;
  let batch: ChapterDocument[] = [];

  for (const meta of books) {
    const book = loadBook(meta.slug);
    if (!book) {
      console.warn(`  Warning: Could not load book "${meta.slug}", skipping`);
      continue;
    }

    for (const chapter of book.chapters) {
      batch.push({
        id: `${meta.slug}:${chapter.number}`,
        book_slug: meta.slug,
        book_title: meta.title,
        author_name: meta.author.name,
        chapter_number: chapter.number,
        chapter_title: chapter.title,
        content: chapter.content,
        word_count: chapter.wordCount,
      });
      totalChapters++;

      if (batch.length >= BATCH_SIZE) {
        const results = await client
          .collections<ChapterDocument>("chapters")
          .documents()
          .import(batch, { batch_size: BATCH_SIZE });

        for (const result of results) {
          if (result.success) {
            indexed++;
          } else {
            failures++;
            console.error(`  Failed to index chapter: ${result.error}`);
          }
        }

        batch = [];

        if (totalChapters % 5000 < BATCH_SIZE) {
          console.log(`  Progress: ${totalChapters} chapters processed`);
        }
      }
    }
  }

  //flush remaining batch
  if (batch.length > 0) {
    const results = await client
      .collections<ChapterDocument>("chapters")
      .documents()
      .import(batch, { batch_size: BATCH_SIZE });

    for (const result of results) {
      if (result.success) {
        indexed++;
      } else {
        failures++;
        console.error(`  Failed to index chapter: ${result.error}`);
      }
    }
  }

  if (failures > 0) {
    console.warn(`  ${failures} chapter(s) failed to index`);
  }

  return indexed;
}

async function main(): Promise<void> {
  console.log(
    `Indexing ${useSample ? "sample" : "production"} data into Typesense at ${TYPESENSE_PROTOCOL}://${TYPESENSE_HOST}:${TYPESENSE_PORT}\n`
  );

  try {
    const health = await client.health.retrieve();
    console.log(`Typesense health: ${health.ok ? "OK" : "NOT OK"}\n`);
  } catch (err) {
    console.error("Error: Could not connect to Typesense. Is the server running?");
    console.error(err);
    process.exit(1);
  }

  console.log("Preparing collections...");
  await deleteCollectionIfExists("chapters");
  await deleteCollectionIfExists("books");
  await client.collections().create(booksSchema);
  console.log('  Created "books" collection');
  await client.collections().create(chaptersSchema);
  console.log('  Created "chapters" collection');

  const books = loadBookIndex();
  console.log(`\nFound ${books.length} books\n`);

  console.log("Indexing books...");
  const booksIndexed = await indexBooks(books);
  console.log(`  Done: ${booksIndexed} books indexed\n`);

  console.log("Indexing chapters...");
  const chaptersIndexed = await indexChapters(books);
  console.log(`  Done: ${chaptersIndexed} chapters indexed\n`);

  console.log("=== Summary ===");
  console.log(`  Books indexed:    ${booksIndexed}`);
  console.log(`  Chapters indexed: ${chaptersIndexed}`);
  console.log("  Indexing complete!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
