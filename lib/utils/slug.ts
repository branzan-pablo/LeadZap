/**
 * URL-safe slug from a display string (lowercase, no accents, spaces → hyphens).
 */
export function slugify(input: string): string {
  const base = input
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return base.length > 0 ? base : "org"
}
