import * as fs from "fs";
import * as path from "path";
import type { CatalogEntry } from "../lib/types";

const API_BASE = "https://gutendex.com/books/";
const TARGET_BOOKS = 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");
const DELAY_MS = 1000;
const MAX_RETRIES = 5;

interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GutendexBook[];
}

interface GutendexBook {
  id: number;
  title: string;
  authors: { name: string; birth_year: number | null; death_year: number | null }[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  formats: Record<string, string>;
}

function getPlainTextUrl(formats: Record<string, string>): string | null {
  // Prefer UTF-8 charset
  for (const [mime, url] of Object.entries(formats)) {
    if (mime === "text/plain; charset=utf-8") return url;
  }
  // Fall back to any text/plain
  for (const [mime, url] of Object.entries(formats)) {
    if (mime.startsWith("text/plain")) return url;
  }
  return null;
}

function toEntry(book: GutendexBook): CatalogEntry | null {
  const downloadUrl = getPlainTextUrl(book.formats);
  if (!downloadUrl) return null;

  // Skip non-English
  if (!book.languages.includes("en")) return null;

  const author = book.authors[0] ?? { name: "Unknown", birth_year: null, death_year: null };

  return {
    id: book.id,
    title: book.title,
    author: {
      name: author.name,
      birthYear: author.birth_year,
      deathYear: author.death_year,
    },
    subjects: book.subjects,
    bookshelves: book.bookshelves,
    downloadUrl,
    languages: book.languages,
  };
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<GutendexResponse> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1000;
        console.log(`  Rate limited. Waiting ${wait / 1000}s before retry (attempt ${attempt}/${retries})...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return (await res.json()) as GutendexResponse;
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = Math.pow(2, attempt) * 1000;
      console.log(`  Request failed: ${(err as Error).message}. Retrying in ${wait / 1000}s (attempt ${attempt}/${retries})...`);
      await sleep(wait);
    }
  }
  throw new Error("Exhausted retries");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  console.log(`Fetching catalog from Gutendex API (target: ${TARGET_BOOKS} books)...`);

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const catalog: CatalogEntry[] = [];
  let page = 1;
  let url: string | null = `${API_BASE}?languages=en&mime_type=text%2Fplain`;

  while (url && catalog.length < TARGET_BOOKS) {
    console.log(`  Fetching page ${page}... (${catalog.length} books so far)`);

    const data = await fetchWithRetry(url);

    for (const book of data.results) {
      const entry = toEntry(book);
      if (entry) {
        catalog.push(entry);
        if (catalog.length % 100 === 0) {
          console.log(`  Progress: ${catalog.length} books collected`);
        }
        if (catalog.length >= TARGET_BOOKS) break;
      }
    }

    url = data.next;
    page++;

    if (url && catalog.length < TARGET_BOOKS) {
      await sleep(DELAY_MS);
    }
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2));
  console.log(`\nDone! Saved ${catalog.length} books to ${CATALOG_PATH}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
