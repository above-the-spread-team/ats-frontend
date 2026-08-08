/**
 * Article URL helpers for the SEO slug scheme: /articles/{slug}-{id}.
 * The trailing numeric id is the lookup key; the slug is a frozen,
 * English-only prefix provided by the backend (may be null).
 */

interface ArticleUrlParts {
  id: number;
  slug?: string | null;
}

/** Canonical URL segment for an article: "{slug}-{id}", or "{id}" when slug is missing. */
export function articleUrlSegment(article: ArticleUrlParts): string {
  return article.slug ? `${article.slug}-${article.id}` : `${article.id}`;
}

/** App-relative path for links (next-intl Link/sitemap prepend the locale as needed). */
export function articlePath(article: ArticleUrlParts): string {
  return `/articles/${articleUrlSegment(article)}`;
}

/**
 * Parse the numeric id from a route param: "1101" -> 1101, "some-slug-1101" -> 1101,
 * "foo" -> null. parseInt is not safe here: parseInt("1101-foo") === 1101 would accept
 * junk, and parseInt("some-slug-1101") is NaN — anchor on the trailing digit run.
 */
export function parseArticleId(param: string): number | null {
  const match = /^(?:.*-)?(\d+)$/.exec(decodeURIComponent(param));
  if (!match) return null;
  const id = Number.parseInt(match[1], 10);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
