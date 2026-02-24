import type { MetadataRoute } from "next";
import { getAllBooks, getBookBySlug, getAllAuthors, getAllSubjects } from "../../lib/data";
import { SITE_URL } from "@/lib/utils";

const URLS_PER_SITEMAP = 50000;

function buildAllUrls(): MetadataRoute.Sitemap {
  const books = getAllBooks();
  const authors = getAllAuthors();
  const subjects = getAllSubjects();
  const now = new Date().toISOString();

  const urls: MetadataRoute.Sitemap = [];

  //static pages
  urls.push(
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/books`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/authors`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/subjects`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  );

  //book pages
  for (const book of books) {
    urls.push({
      url: `${SITE_URL}/books/${book.slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.8,
    });

    //chapter pages
    const fullBook = getBookBySlug(book.slug);
    if (fullBook) {
      for (const chapter of fullBook.chapters) {
        urls.push({
          url: `${SITE_URL}/books/${book.slug}/${chapter.number}`,
          lastModified: now,
          changeFrequency: "yearly",
          priority: 0.7,
        });
      }
    }
  }

  //author pages
  for (const author of authors) {
    urls.push({
      url: `${SITE_URL}/authors/${encodeURIComponent(author)}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  //subject pages
  for (const subject of subjects) {
    urls.push({
      url: `${SITE_URL}/subjects/${encodeURIComponent(subject)}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  return urls;
}

export async function generateSitemaps() {
  const allUrls = buildAllUrls();
  const count = Math.max(1, Math.ceil(allUrls.length / URLS_PER_SITEMAP));
  return Array.from({ length: count }, (_, i) => ({ id: i }));
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  const allUrls = buildAllUrls();
  const start = id * URLS_PER_SITEMAP;
  const end = start + URLS_PER_SITEMAP;
  return allUrls.slice(start, end);
}
