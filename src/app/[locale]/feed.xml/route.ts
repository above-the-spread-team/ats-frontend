import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { newsFeedResponse } from "@/lib/feed";
import { feedUrl } from "@/lib/seo";

export const revalidate = 900;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // The English feed lives at /feed.xml. The intl middleware already strips the /en
  // prefix; this covers the case where the handler is reached anyway.
  if (locale === routing.defaultLocale) {
    return new Response(null, {
      status: 308,
      headers: { Location: feedUrl(locale) },
    });
  }

  return newsFeedResponse(locale);
}
