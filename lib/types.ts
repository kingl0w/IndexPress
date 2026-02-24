export interface Author {
  name: string;
  birthYear: number | null;
  deathYear: number | null;
}

export interface Chapter {
  number: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface Book {
  id: number;
  slug: string;
  title: string;
  author: Author;
  subjects: string[];
  bookshelves: string[];
  totalChapters: number;
  chapters: Chapter[];
  totalWordCount: number;
  language: "en";
}

export interface BookMeta {
  id: number;
  slug: string;
  title: string;
  author: Author;
  subjects: string[];
  bookshelves: string[];
  totalChapters: number;
  totalWordCount: number;
  language: "en";
}

export interface CatalogEntry {
  id: number;
  title: string;
  author: Author;
  subjects: string[];
  bookshelves: string[];
  downloadUrl: string;
  languages: string[];
}

export interface FailedDownload {
  id: number;
  url: string;
  error: string;
  timestamp: string;
}
