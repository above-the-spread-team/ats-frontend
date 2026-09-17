const SLUG_MAX_LENGTH = 80;

/**
 * Mirror of the backend's slugify (ats-backend app/core/slug.py): ASCII-fold, lowercase,
 * collapse to hyphens, cut at a word boundary. Returns null when nothing survives (pure CJK).
 */
export function slugify(text: string): string | null {
  const ascii = text
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase();
  let slug = ascii.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) return null;
  if (slug.length > SLUG_MAX_LENGTH) {
    const truncated = slug.slice(0, SLUG_MAX_LENGTH);
    slug = truncated.includes("-")
      ? truncated.slice(0, truncated.lastIndexOf("-"))
      : truncated;
  }
  return slug;
}

/** Trailing numeric id of "{slug}-{id}" or "{id}"; null for anything else. */
export function parseTrailingId(param: string): number | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(param);
  } catch {
    return null;
  }
  const match = /^(?:.*-)?(\d+)$/.exec(decoded);
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
