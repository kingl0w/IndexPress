import Typesense from "typesense";
import type { SearchClient } from "typesense";

//--- types ---

export interface BookSearchResult {
  slug: string;
  title: string;
  authorName: string;
  subjects: string[];
  bookshelves: string[];
  totalChapters: number;
  totalWordCount: number;
  highlights: {
    title?: string;
    authorName?: string;
    subjects?: string[];
  };
}

export interface ChapterSearchResult {
  bookSlug: string;
  bookTitle: string;
  authorName: string;
  chapterNumber: number;
  chapterTitle: string;
  wordCount: number;
  snippet: string;
}

export interface SearchResult<T> {
  hits: T[];
  totalFound: number;
  searchTimeMs: number;
}

//--- typesense document schemas ---

interface BookDoc {
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

interface ChapterDoc {
  id: string;
  book_slug: string;
  book_title: string;
  author_name: string;
  chapter_number: number;
  chapter_title: string;
  content: string;
  word_count: number;
}

//--- client singleton ---

let _client: SearchClient | null = null;

function getClient(): SearchClient {
  if (_client) return _client;

  const host = process.env.NEXT_PUBLIC_TYPESENSE_HOST ?? "localhost";
  const port = parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT ?? "8108", 10);
  const protocol = process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL ?? "http";
  const apiKey = process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_API_KEY ?? "";

  _client = new Typesense.SearchClient({
    nodes: [{ host, port, protocol }],
    apiKey,
    connectionTimeoutSeconds: 5,
  });

  return _client;
}

//--- search functions ---

export async function searchBooks(
  query: string,
  options?: { page?: number; perPage?: number; filterBy?: string }
): Promise<SearchResult<BookSearchResult>> {
  const client = getClient();
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 20;

  try {
    const result = await client
      .collections<BookDoc>("books")
      .documents()
      .search({
        q: query,
        query_by: "title,author_name,subjects",
        query_by_weights: "3,2,1",
        per_page: perPage,
        page,
        ...(options?.filterBy ? { filter_by: options.filterBy } : {}),
        facet_by: "subjects",
        max_facet_values: 10,
        highlight_full_fields: "title,author_name",
        highlight_start_tag: "<mark>",
        highlight_end_tag: "</mark>",
      }, {});

    const hits: BookSearchResult[] = (result.hits ?? []).map((hit) => ({
      slug: hit.document.slug,
      title: hit.document.title,
      authorName: hit.document.author_name,
      subjects: hit.document.subjects,
      bookshelves: hit.document.bookshelves,
      totalChapters: hit.document.total_chapters,
      totalWordCount: hit.document.total_word_count,
      highlights: {
        title: hit.highlight?.title?.snippet ?? undefined,
        authorName: hit.highlight?.author_name?.snippet ?? undefined,
        subjects: hit.highlights?.[0]?.field === "subjects" ? hit.highlights[0].snippets : undefined,
      },
    }));

    return {
      hits,
      totalFound: result.found,
      searchTimeMs: result.search_time_ms,
    };
  } catch {
    throw new Error("Search is temporarily unavailable");
  }
}

export async function searchChapters(
  query: string,
  options?: { page?: number; perPage?: number; bookSlug?: string }
): Promise<SearchResult<ChapterSearchResult>> {
  const client = getClient();
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? 20;

  try {
    const result = await client
      .collections<ChapterDoc>("chapters")
      .documents()
      .search({
        q: query,
        query_by: "content,chapter_title",
        query_by_weights: "2,1",
        per_page: perPage,
        page,
        ...(options?.bookSlug ? { filter_by: `book_slug:=${options.bookSlug}` } : {}),
        highlight_start_tag: "<mark>",
        highlight_end_tag: "</mark>",
        highlight_affix_num_tokens: 30,
        snippet_threshold: 30,
      }, {});

    const hits: ChapterSearchResult[] = (result.hits ?? []).map((hit) => ({
      bookSlug: hit.document.book_slug,
      bookTitle: hit.document.book_title,
      authorName: hit.document.author_name,
      chapterNumber: hit.document.chapter_number,
      chapterTitle: hit.document.chapter_title,
      wordCount: hit.document.word_count,
      snippet: hit.highlight?.content?.snippet ?? hit.document.content.slice(0, 200) + "...",
    }));

    return {
      hits,
      totalFound: result.found,
      searchTimeMs: result.search_time_ms,
    };
  } catch {
    throw new Error("Search is temporarily unavailable");
  }
}

export async function getSearchSuggestions(
  query: string
): Promise<BookSearchResult[]> {
  if (!query.trim()) return [];

  const result = await searchBooks(query, { perPage: 5 });
  return result.hits;
}
