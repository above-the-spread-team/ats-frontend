import { serverFetchNewsList } from "@/lib/server-news";
import type { NewsListResponse } from "@/type/fastapi/news";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.abovethespread.com";
  const entries: MetadataRoute.Sitemap = [];

  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/games", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/articles", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/discuss", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/stats", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/our-picks", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/news", priority: 0.8, changeFrequency: "daily" as const },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency as
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "always"
        | "hourly"
        | "never",
      priority: page.priority,
    });
  }

  try {
    const { data } = await serverFetchNewsList(1, 100);

    if (data) {
      const list = data as NewsListResponse;
      const articles = list.items || [];

      for (const article of articles) {
        if (!article.is_published) continue;

        const availableLanguages = article.available_languages || ["en"];
        const articlePath = `/articles/${article.id}`;

        for (const lang of availableLanguages) {
          const url =
            lang === "en"
              ? `${baseUrl}${articlePath}`
              : `${baseUrl}/${lang}${articlePath}`;

          entries.push({
            url,
            lastModified: new Date(article.updated_at || article.created_at),
            changeFrequency: "daily",
            priority: 0.6,
          });
        }
      }
    }
  } catch {
    // If the backend is unreachable, return static pages only
  }

  return entries;
}
