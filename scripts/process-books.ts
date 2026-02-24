import * as fs from "fs";
import * as path from "path";
import type { CatalogEntry, Book, BookMeta, Chapter } from "../lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");
const RAW_DIR = path.join(DATA_DIR, "raw-texts");
const PROCESSED_DIR = path.join(DATA_DIR, "processed");
const INDEX_PATH = path.join(DATA_DIR, "book-index.json");
const CHUNK_SIZE = 2000; // words per chunk when no chapter markers

function stripGutenbergHeaderFooter(text: string): string {
  // Strip header (everything before "*** START OF")
  const startMatch = text.match(/\*\*\*\s*START OF.*?\*\*\*/i);
  if (startMatch && startMatch.index !== undefined) {
    text = text.slice(startMatch.index + startMatch[0].length);
  }

  // Strip footer (everything after "*** END OF")
  const endMatch = text.match(/\*\*\*\s*END OF.*?\*\*\*/i);
  if (endMatch && endMatch.index !== undefined) {
    text = text.slice(0, endMatch.index);
  }

  return text.trim();
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

function splitIntoChapters(text: string): Chapter[] {
  // Try various chapter heading patterns
  const patterns = [
    // "CHAPTER X" or "Chapter X" with optional title
    /^(CHAPTER|Chapter)\s+(\d+|[IVXLCDM]+)[\.\:\s]*(.*)/m,
    // "Part X" or "PART X"
    /^(PART|Part)\s+(\d+|[IVXLCDM]+)[\.\:\s]*(.*)/m,
    // "Book X" or "BOOK X"
    /^(BOOK|Book)\s+(\d+|[IVXLCDM]+)[\.\:\s]*(.*)/m,
    // "ACT X" / "SCENE X" for plays
    /^(ACT|Act|SCENE|Scene)\s+(\d+|[IVXLCDM]+)[\.\:\s]*(.*)/m,
  ];

  // Build a combined regex that matches any chapter-like heading
  const combinedPattern =
    /^(?:(?:CHAPTER|Chapter)\s+(?:\d+|[IVXLCDM]+)|(?:PART|Part)\s+(?:\d+|[IVXLCDM]+)|(?:BOOK|Book)\s+(?:\d+|[IVXLCDM]+)|(?:ACT|Act|SCENE|Scene)\s+(?:\d+|[IVXLCDM]+))[\.\:\s]*(.*)/gm;

  const matches: { index: number; title: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = combinedPattern.exec(text)) !== null) {
    // Extract the full match as the title
    const fullLine = match[0].trim();
    // Clean up the title - take just the heading part
    const title = fullLine.replace(/\s+/g, " ").trim();
    matches.push({ index: match.index, title });
  }

  if (matches.length >= 2) {
    const chapters: Chapter[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const content = text.slice(start, end).trim();
      chapters.push({
        number: i + 1,
        title: matches[i].title,
        content,
        wordCount: countWords(content),
      });
    }
    return chapters;
  }

  // Try simple Roman numeral sections: lines that are just "I.", "II.", etc.
  const romanPattern = /^([IVXLCDM]+)\.?\s*$/gm;
  const romanMatches: { index: number; numeral: string }[] = [];
  while ((match = romanPattern.exec(text)) !== null) {
    romanMatches.push({ index: match.index, numeral: match[1] });
  }

  if (romanMatches.length >= 3) {
    const chapters: Chapter[] = [];
    for (let i = 0; i < romanMatches.length; i++) {
      const start = romanMatches[i].index;
      const end = i + 1 < romanMatches.length ? romanMatches[i + 1].index : text.length;
      const content = text.slice(start, end).trim();
      chapters.push({
        number: i + 1,
        title: `Section ${romanMatches[i].numeral}`,
        content,
        wordCount: countWords(content),
      });
    }
    return chapters;
  }

  // Fallback: split by word count
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const chapters: Chapter[] = [];
  for (let i = 0; i < words.length; i += CHUNK_SIZE) {
    const chunkWords = words.slice(i, i + CHUNK_SIZE);
    const content = chunkWords.join(" ");
    chapters.push({
      number: chapters.length + 1,
      title: `Section ${chapters.length + 1}`,
      content,
      wordCount: chunkWords.length,
    });
  }

  return chapters;
}

function processBook(entry: CatalogEntry, slugs: Map<string, number>): Book | null {
  const rawPath = path.join(RAW_DIR, `${entry.id}.txt`);
  if (!fs.existsSync(rawPath)) {
    return null;
  }

  const rawText = fs.readFileSync(rawPath, "utf-8");
  const cleanText = stripGutenbergHeaderFooter(rawText);

  if (cleanText.length < 100) {
    console.log(`  Skipping book ${entry.id} (${entry.title}): too short after stripping`);
    return null;
  }

  const chapters = splitIntoChapters(cleanText);
  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  // Generate unique slug
  let slug = toSlug(entry.title);
  if (!slug) slug = `book-${entry.id}`;

  const count = slugs.get(slug) ?? 0;
  if (count > 0) {
    slug = `${slug}-${entry.id}`;
  }
  slugs.set(slug, count + 1);

  return {
    id: entry.id,
    slug,
    title: entry.title,
    author: entry.author,
    subjects: entry.subjects,
    bookshelves: entry.bookshelves,
    totalChapters: chapters.length,
    chapters,
    totalWordCount,
    language: "en",
  };
}

function main(): void {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error("catalog.json not found. Run fetch-catalog first.");
    process.exit(1);
  }

  const catalog: CatalogEntry[] = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
  console.log(`Processing ${catalog.length} books...`);

  if (!fs.existsSync(PROCESSED_DIR)) {
    fs.mkdirSync(PROCESSED_DIR, { recursive: true });
  }

  const slugs = new Map<string, number>();
  const bookIndex: BookMeta[] = [];
  let processed = 0;
  let skipped = 0;

  for (const entry of catalog) {
    const book = processBook(entry, slugs);
    if (!book) {
      skipped++;
      continue;
    }

    // Write full book JSON
    const outPath = path.join(PROCESSED_DIR, `${book.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(book, null, 2));

    // Add to index (without chapter content)
    bookIndex.push({
      id: book.id,
      slug: book.slug,
      title: book.title,
      author: book.author,
      subjects: book.subjects,
      bookshelves: book.bookshelves,
      totalChapters: book.totalChapters,
      totalWordCount: book.totalWordCount,
      language: "en",
    });

    processed++;
    if (processed % 50 === 0) {
      console.log(`  Progress: ${processed} books processed`);
    }
  }

  // Write book index
  fs.writeFileSync(INDEX_PATH, JSON.stringify(bookIndex, null, 2));

  console.log(`\nDone!`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Index saved to: ${INDEX_PATH}`);
}

main();
