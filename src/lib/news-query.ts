import type { ArticleType } from "@/type/fastapi/news";

/** Page size of the article list pages; the server prefetch must request the same. */
export const NEWS_LIST_PAGE_SIZE = 15;

/** Tag every World Cup article carries (the /world-cup/news list filters on it). */
export const WORLD_CUP_TAG_IDS = [14];

/**
 * Query key of the paginated news list. Shared by `useNews` and the server prefetch so a
 * dehydrated page 1 lands in exactly the cache entry the client hook reads.
 * `excludeArticleType` is appended only when set, so keys of older callers are unchanged.
 */
export function newsQueryKey(
  page: number,
  pageSize: number,
  tagIds?: number[],
  articleType?: ArticleType,
  lang?: string,
  excludeArticleType?: ArticleType
): readonly unknown[] {
  const key = ["news", page, pageSize, tagIds, articleType, lang];
  return excludeArticleType ? [...key, excludeArticleType] : key;
}
