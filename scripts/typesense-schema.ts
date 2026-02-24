import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

export const booksSchema: CollectionCreateSchema = {
  name: "books",
  fields: [
    { name: "id", type: "string" },
    { name: "title", type: "string" },
    { name: "author_name", type: "string" },
    { name: "author_birth_year", type: "int32", optional: true },
    { name: "author_death_year", type: "int32", optional: true },
    { name: "subjects", type: "string[]", facet: true },
    { name: "bookshelves", type: "string[]", facet: true },
    { name: "total_chapters", type: "int32" },
    { name: "total_word_count", type: "int32", sort: true },
    { name: "slug", type: "string" },
  ],
  default_sorting_field: "total_word_count",
};

export const chaptersSchema: CollectionCreateSchema = {
  name: "chapters",
  fields: [
    { name: "id", type: "string" },
    { name: "book_slug", type: "string", facet: true },
    { name: "book_title", type: "string" },
    { name: "author_name", type: "string" },
    { name: "chapter_number", type: "int32", sort: true },
    { name: "chapter_title", type: "string" },
    { name: "content", type: "string" },
    { name: "word_count", type: "int32", sort: true },
  ],
  default_sorting_field: "word_count",
};
