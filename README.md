# Gutenberg Reader

A statically generated Next.js app for reading ~3,000 public domain books from [Project Gutenberg](https://www.gutenberg.org). Generates 50,000+ pages at build time with full-text search, reader controls, and comprehensive SEO.

## Features

- **50K+ static pages** — every book, chapter, author, and subject gets its own pre-rendered page
- **Chapter reader** — adjustable font size, font family, and theme (light/sepia/dark) via URL params
- **Full-text search** — client-side FlexSearch with catalog search and per-chapter fulltext search
- **Catalog browsing** — filter by subject, author, or keyword; sort by title, author, word count, or chapter count
- **Author & subject pages** — alphabetical author index with letter navigation; subject pages sorted by book count
- **SEO** — `generateMetadata` on every route, JSON-LD structured data, sitemap index for 50K+ URLs, robots.txt
- **Accessibility** — WCAG AA: skip-to-content, keyboard navigation (arrow keys for chapters), proper ARIA, focus management
- **Mobile-first** — responsive grid layouts, swipe gestures in reader, hamburger nav

## Tech Stack

- **Next.js 16** (App Router, static export with `output: "standalone"`)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (no component libraries)
- **FlexSearch** (client-side search indexing)

## Quick Start

```bash
# Install dependencies
npm install

# Run dev server with sample data (5 books)
npm run dev

# Run dev server with full dataset (requires pipeline first)
npm run dev:full
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Data Pipeline

The app reads from structured JSON produced by a three-step pipeline. Sample data is included for development; the full pipeline fetches ~3,000 books from Project Gutenberg.

### Pipeline Steps

```bash
# Run the full pipeline (1-2 hours)
npm run data:pipeline

# Or run each step individually:
npm run data:fetch       # Fetch metadata from Gutendex API
npm run data:download    # Download plain text files
npm run data:process     # Strip headers, split chapters, generate JSON
```

The pipeline is **resumable** — `data:download` skips already-downloaded files. Failed downloads are logged to `data/failed-downloads.json`.

### Pipeline Output

| Path | Description |
|------|-------------|
| `data/catalog.json` | Raw metadata from Gutendex API |
| `data/raw-texts/` | Downloaded `.txt` files |
| `data/processed/` | Per-book JSON with chapters |
| `data/book-index.json` | Metadata index (no chapter content) |

### Search Index

```bash
npm run search:build    # Build FlexSearch indexes into public/search/
```

This runs automatically before `npm run build` via the `prebuild` script.

### Sample Data

Five sample books are included in `data/sample/` for development. The `npm run dev` command sets `SAMPLE_DATA=true` automatically.

## Project Structure

```
├── data/
│   ├── sample/              # 5 sample books for development
│   ├── processed/           # Full pipeline output (gitignored)
│   └── book-index.json      # Book metadata index (gitignored)
├── lib/
│   ├── types.ts             # Core TypeScript interfaces
│   ├── data.ts              # Data access layer with in-memory caching
│   └── search-client.ts     # FlexSearch client (catalog + fulltext)
├── scripts/
│   ├── fetch-catalog.ts     # Step 1: Gutendex API fetcher
│   ├── download-texts.ts    # Step 2: Concurrent text downloader
│   ├── process-books.ts     # Step 3: Header stripping, chapter splitting
│   └── build-search-index.ts # Search index builder
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with header, footer, nav
│   │   ├── page.tsx         # Homepage with hero, stats, featured books
│   │   ├── sitemap.ts       # Sitemap index for 50K+ URLs
│   │   ├── robots.ts        # Robots.txt
│   │   ├── not-found.tsx    # Custom 404
│   │   ├── books/
│   │   │   ├── page.tsx     # Catalog browser with filters
│   │   │   └── [slug]/
│   │   │       ├── page.tsx         # Book detail
│   │   │       └── [chapter]/
│   │   │           └── page.tsx     # Chapter reader
│   │   ├── authors/
│   │   │   ├── page.tsx     # Author index (A-Z navigation)
│   │   │   └── [name]/
│   │   │       └── page.tsx # Author detail with book grid
│   │   ├── subjects/
│   │   │   ├── page.tsx     # Subject listing
│   │   │   └── [subject]/
│   │   │       └── page.tsx # Subject detail with book grid
│   │   └── search/
│   │       ├── page.tsx     # Search page (Suspense boundary)
│   │       └── search-client.tsx  # Search UI client component
│   ├── components/
│   │   ├── Breadcrumbs.tsx
│   │   ├── MobileNav.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SearchHotkey.tsx
│   │   ├── catalog/         # BookCard, BookGrid, FilterBar, Pagination, CatalogBrowser
│   │   └── reader/          # ReaderView, ReaderControls, ChapterNav, ReadingProgress
│   ├── lib/
│   │   └── utils.ts         # SITE_NAME, SITE_URL, formatAuthorName, estimatePages
│   └── styles/
│       └── reader.css       # Reader theme variables, typography
└── next.config.ts           # Build optimizations for 50K+ pages
```

## Build & Deploy

```bash
# Production build (uses full dataset)
npm run build

# Production build with bundle analysis
npm run analyze

# Start production server
npm run start
```

### Build Optimizations

- `staticPageGenerationTimeout: 120` — generous timeout for 50K+ page generation
- `output: "standalone"` — self-contained output for containerized deployment
- `images.unoptimized: true` — no image optimization needed (CSS gradient covers)
- In-memory `Map` caching in `lib/data.ts` — `book-index.json` is read once during build
- Search indexes are static JSON fetched on-demand, not bundled into JS

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with sample data |
| `npm run dev:full` | Dev server with full dataset |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |
| `npm run data:pipeline` | Run full data pipeline |
| `npm run data:fetch` | Fetch catalog from Gutendex API |
| `npm run data:download` | Download text files |
| `npm run data:process` | Process texts into structured JSON |
| `npm run search:build` | Build search indexes |
| `npm run analyze` | Production build with bundle analysis |

## Architecture Notes

- **All reader preferences** (font size, theme, font family) are stored in URL search params, making every reader state a shareable, bookmarkable URL compatible with SSG.
- **Data caching** uses an in-memory `Map` keyed by file path. During static generation, `book-index.json` is loaded once and shared across all `generateStaticParams` and page render calls.
- **Search indexes** are built as static JSON files in `public/search/`. The catalog index loads on search page mount; fulltext indexes load lazily only when the user switches to the "Full Text" tab.
- **Sitemap** uses Next.js `generateSitemaps()` to produce a sitemap index with multiple child sitemaps, handling 50K+ URLs within the 50,000-URL-per-sitemap limit.

## License

Book content is public domain via Project Gutenberg. This project is not affiliated with or endorsed by Project Gutenberg.
