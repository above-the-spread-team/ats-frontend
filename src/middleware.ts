import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/edge-config";
import { routing } from "./i18n/routing";
import { countryLocale, primaryLanguageLocale } from "./i18n/locale-detection";

const intlMiddleware = createMiddleware(routing);

// First visit only (no NEXT_LOCALE cookie): pick the locale from the
// browser's primary language, falling back to the visitor's region (Vercel
// geo header). This replaces next-intl's full Accept-Language negotiation
// for two reasons: browsers append en with low q-values almost universally,
// so the region signal would otherwise never win; and next-intl's best-fit
// matcher sends zh-HK/zh-MO to zh-CN instead of zh-TW. Crawlers without a
// mapped country are never redirected, keeping the unprefixed en canonical
// intact.
function resolveFirstVisitRedirect(req: NextRequest): NextResponse | undefined {
  if (req.method !== "GET" && req.method !== "HEAD") return undefined;
  if (req.cookies.has("NEXT_LOCALE")) return undefined;

  const { pathname } = req.nextUrl;
  const hasLocalePrefix = routing.locales.some(
    (locale) =>
      locale !== routing.defaultLocale &&
      (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)),
  );
  if (hasLocalePrefix) return undefined;

  const locale =
    primaryLanguageLocale(req.headers.get("accept-language")) ??
    countryLocale(req.headers.get("x-vercel-ip-country"));
  if (!locale || locale === routing.defaultLocale) return undefined;

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  return res;
}

function handleI18n(req: NextRequest) {
  return resolveFirstVisitRedirect(req) ?? intlMiddleware(req);
}

export const config = {
  matcher: [
    // Root-level SEO routes (sitemaps, feed, llms.txt, OG images) must stay out of the
    // locale handling, or next-intl would prefix / redirect them.
    "/((?!_next/static|_next/image|_next/|favicon.ico|images/|api/|og/|sitemaps/|maintenance|sitemap.xml|news-sitemap.xml|feed.xml|llms.txt|robots.txt).*)",
  ],
};

// A rewrite would answer 200, and the maintenance page is noindex — crawlers hitting any
// article during a window would be told to drop it. Serve the same HTML as a 503 instead
// (NextResponse.rewrite ignores `status`, so the page is fetched and returned as the body).
// /maintenance is excluded from the matcher, so this fetch never re-enters the middleware.
async function maintenanceResponse(req: NextRequest): Promise<NextResponse> {
  try {
    const page = await fetch(new URL("/maintenance", req.url), {
      headers: {
        "accept-language": req.headers.get("accept-language") ?? "",
        "x-vercel-ip-country": req.headers.get("x-vercel-ip-country") ?? "",
        cookie: req.headers.get("cookie") ?? "",
      },
      cache: "no-store",
      // The page redirects home once maintenance is over — never serve that as the 503 body
      redirect: "manual",
    });
    if (page.status === 200) {
      return new NextResponse(await page.text(), {
        status: 503,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Retry-After": "3600",
          "Cache-Control": "no-store",
        },
      });
    }
  } catch {
    // fall through to the plain rewrite
  }
  return NextResponse.rewrite(new URL("/maintenance", req.url));
}

export async function middleware(req: NextRequest) {
  try {
    const isInMaintenance = await get<boolean>("isInMaintenance");

    if (isInMaintenance) {
      const bypassSecret = await get<string>("maintenanceBypassSecret");
      const devCookie = req.cookies.get("__ats_dev")?.value;
      if (bypassSecret && devCookie === bypassSecret) {
        return handleI18n(req);
      }

      if (req.nextUrl.pathname === "/maintenance") {
        return NextResponse.next();
      }

      return maintenanceResponse(req);
    }

    return handleI18n(req);
  } catch {
    return handleI18n(req);
  }
}
