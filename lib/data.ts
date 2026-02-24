import * as fs from "fs";
import * as path from "path";
import type { Book, BookMeta, Chapter } from "./types";

const useSample = process.env.SAMPLE_DATA === "true";
const DATA_DIR = path.join(process.cwd(), useSample ? "data/sample" : "data");
const INDEX_PATH = path.join(DATA_DIR, "book-index.json");
const PROCESSED_DIR = path.join(DATA_DIR, "processed");

// Simple in-memory cache
const cache = new Map<string, unknown>();

function getCached<T>(key: string, loader: () => T): T {
  if (cache.has(key)) {
    return cache.get(key) as T;
  }
  const value = loader();
  cache.set(key, value);
  return value;
}

export function getAllBooks(): BookMeta[] {
  return getCached("all-books", () => {
    const raw = fs.readFileSync(INDEX_PATH, "utf-8");
    return JSON.parse(raw) as BookMeta[];
  });
}

export function getBookBySlug(slug: string): Book | null {
  return getCached(`book:${slug}`, () => {
    const filePath = path.join(PROCESSED_DIR, `${slug}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as Book;
  });
}

export function getBookChapter(slug: string, chapterNum: number): Chapter | null {
  const book = getBookBySlug(slug);
  if (!book) return null;
  return book.chapters.find((ch) => ch.number === chapterNum) ?? null;
}

export function getBooksBySubject(subject: string): BookMeta[] {
  const books = getAllBooks();
  const lower = subject.toLowerCase();
  return books.filter((b) =>
    b.subjects.some((s) => s.toLowerCase().includes(lower))
  );
}

export function getBooksByAuthor(authorName: string): BookMeta[] {
  const books = getAllBooks();
  const lower = authorName.toLowerCase();
  return books.filter((b) => b.author.name.toLowerCase().includes(lower));
}

export function getAllSubjects(): string[] {
  return getCached("all-subjects", () => {
    const books = getAllBooks();
    const subjects = new Set<string>();
    for (const book of books) {
      for (const subject of book.subjects) {
        subjects.add(subject);
      }
    }
    return Array.from(subjects).sort();
  });
}

export function getAllAuthors(): string[] {
  return getCached("all-authors", () => {
    const books = getAllBooks();
    const authors = new Set<string>();
    for (const book of books) {
      authors.add(book.author.name);
    }
    return Array.from(authors).sort();
  });
}
