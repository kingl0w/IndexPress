import * as fs from "fs";
import * as path from "path";
import type { CatalogEntry, FailedDownload } from "../lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");
const RAW_DIR = path.join(DATA_DIR, "raw-texts");
const FAILED_PATH = path.join(DATA_DIR, "failed-downloads.json");
const MAX_CONCURRENCY = 5;
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadBook(entry: CatalogEntry): Promise<FailedDownload | null> {
  const outPath = path.join(RAW_DIR, `${entry.id}.txt`);

  //skip if already downloaded
  if (fs.existsSync(outPath)) {
    return null;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(entry.downloadUrl);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const text = await res.text();
      fs.writeFileSync(outPath, text, "utf-8");
      return null;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        return {
          id: entry.id,
          url: entry.downloadUrl,
          error: (err as Error).message,
          timestamp: new Date().toISOString(),
        };
      }
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  return null;
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function worker(): Promise<void> {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await fn(items[currentIndex]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main(): Promise<void> {
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error("catalog.json not found. Run fetch-catalog first.");
    process.exit(1);
  }

  const catalog: CatalogEntry[] = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
  console.log(`Downloading texts for ${catalog.length} books...`);

  if (!fs.existsSync(RAW_DIR)) {
    fs.mkdirSync(RAW_DIR, { recursive: true });
  }

  //check how many already exist
  const existing = catalog.filter((e) => fs.existsSync(path.join(RAW_DIR, `${e.id}.txt`)));
  console.log(`  ${existing.length} already downloaded, ${catalog.length - existing.length} remaining`);

  let completed = 0;
  const failures: FailedDownload[] = [];

  const results = await runWithConcurrency(catalog, MAX_CONCURRENCY, async (entry) => {
    const result = await downloadBook(entry);
    completed++;
    if (completed % 50 === 0) {
      console.log(`  Progress: ${completed}/${catalog.length} processed`);
    }
    return result;
  });

  for (const result of results) {
    if (result) failures.push(result);
  }

  if (failures.length > 0) {
    fs.writeFileSync(FAILED_PATH, JSON.stringify(failures, null, 2));
    console.log(`\n${failures.length} downloads failed. See ${FAILED_PATH}`);
  }

  console.log(`\nDone! ${catalog.length - failures.length} books downloaded successfully.`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
