import { connection } from "next/server";
import { routing } from "@/i18n/routing";
import { newsFeedResponse } from "@/lib/feed";

// English feed at the root (en has no locale prefix); other locales: /{locale}/feed.xml.
// Per request, not prerendered: cache lifetimes (shorter on a backend outage) are set by
// newsFeedResponse via Cache-Control.
export async function GET() {
  await connection();
  return newsFeedResponse(routing.defaultLocale);
}
