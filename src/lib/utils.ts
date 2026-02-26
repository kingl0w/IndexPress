export const SITE_NAME = "IndexPress";
export const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://indexpress.vercel.app";

export function formatAuthorName(name: string): string {
  const parts = name.split(", ");
  return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
}

export function estimatePages(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 250));
}
