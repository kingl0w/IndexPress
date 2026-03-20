const STORAGE_KEY = "indexpress_recent";
const MAX_ITEMS = 5;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  const current = getRecentSearches();
  const deduped = current.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...deduped].slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function removeRecentSearch(query: string): string[] {
  const current = getRecentSearches();
  const updated = current.filter((s) => s.toLowerCase() !== query.toLowerCase());
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // silently fail
  }
  return updated;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}
