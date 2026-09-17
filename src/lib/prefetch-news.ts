import {
  QueryClient,
  dehydrate,
  type DehydratedState,
} from "@tanstack/react-query";
import { serverFetchNewsList } from "@/lib/server-news";
import { newsQueryKey } from "@/lib/news-query";
import type { ArticleType, NewsListResponse } from "@/type/fastapi/news";

interface PrefetchNewsOptions {
  pageSize: number;
  /** undefined for English — must mirror what the client hook passes */
  lang?: string;
  articleType?: ArticleType;
  tagIds?: number[];
  excludeArticleType?: ArticleType;
}

/**
 * Page 1 of one or more news lists, dehydrated for <HydrationBoundary>, so article links are
 * in the initial HTML. A backend failure dehydrates nothing and the client hook fetches as before.
 */
export async function prefetchNewsLists(
  lists: PrefetchNewsOptions[]
): Promise<DehydratedState> {
  const queryClient = new QueryClient();

  await Promise.all(
    lists.map(async ({ pageSize, lang, articleType, tagIds, excludeArticleType }) => {
      const { data } = await serverFetchNewsList(
        1,
        pageSize,
        lang,
        articleType,
        tagIds,
        { excludeArticleType }
      );
      if (data) {
        queryClient.setQueryData<NewsListResponse>(
          newsQueryKey(1, pageSize, tagIds, articleType, lang, excludeArticleType),
          data as NewsListResponse
        );
      }
    })
  );

  return dehydrate(queryClient);
}

export function prefetchNewsFirstPage(
  options: PrefetchNewsOptions
): Promise<DehydratedState> {
  return prefetchNewsLists([options]);
}
