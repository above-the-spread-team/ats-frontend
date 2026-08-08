import { serverFetchNewsList } from "@/lib/server-news";
import { routing } from "@/i18n/routing";
import type { NewsListResponse } from "@/type/fastapi/news";
import type { MetadataRoute } from "next";

const baseUrl = "https://www.abovethespread.com";

// en has no prefix (localePrefix: "as-needed"); en doubles as x-default.
function localizedUrl(locale: string, path: string): string {
  const normalizedPath = path === "/" ? "" : path;
  return locale === "en"
    ? `${baseUrl}${normalizedPath || "/"}`
    : `${baseUrl}/${locale}${normalizedPath}`;
}

function languageAlternates(
  path: string,
  locales: readonly string[],
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizedUrl(locale, path);
  }
  if (locales.includes("en")) {
    languages["x-default"] = localizedUrl("en", path);
  }
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    for (const locale of routing.locales) {
      entries.push({
        url: localizedUrl(locale, page.path),
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: languageAlternates(page.path, routing.locales),
        },
      });
    }
  }

  try {
    const { data } = await serverFetchNewsList(1, 100);

    if (data) {
      const list = data as NewsListResponse;
      const articles = list.items || [];

      for (const article of articles) {
        if (!article.is_published) continue;

        const availableLanguages = article.available_languages?.length
          ? article.available_languages
          : ["en"];
        const articlePath = `/articles/${article.id}`;

        for (const lang of availableLanguages) {
          entries.push({
            url: localizedUrl(lang, articlePath),
            lastModified: new Date(article.updated_at || article.created_at),
            changeFrequency: "daily",
            priority: 0.6,
            alternates: {
              languages: languageAlternates(articlePath, availableLanguages),
            },
          });
        }
      }
    }
  } catch {
    // If the backend is unreachable, return static pages only
  }

  return entries;
}
