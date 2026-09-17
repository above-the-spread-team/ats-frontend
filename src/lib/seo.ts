import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** Canonical production origin — every absolute URL we emit is built from this. */
export const SITE_URL = "https://www.abovethespread.com";
export const SITE_NAME = "Above The Spread";

export const DEFAULT_OG_IMAGE = {
  url: `${SITE_URL}/og/default`,
  width: 1200,
  height: 630,
  alt: "Above The Spread — Football Stats & Community",
};

// en has no prefix (localePrefix: "as-needed"); en doubles as x-default.
export function localizedUrl(locale: string, path: string): string {
  const normalizedPath = path === "/" ? "" : path;
  return locale === routing.defaultLocale
    ? `${SITE_URL}${normalizedPath || "/"}`
    : `${SITE_URL}/${locale}${normalizedPath}`;
}

export function languageAlternates(
  path: string,
  locales: readonly string[] = routing.locales,
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = localizedUrl(locale, path);
  }
  if (locales.includes(routing.defaultLocale)) {
    languages["x-default"] = localizedUrl(routing.defaultLocale, path);
  }
  return languages;
}

export function ogLocale(locale: string): string {
  switch (locale) {
    case "ja":
      return "ja_JP";
    case "zh-TW":
      return "zh_TW";
    case "zh-CN":
      return "zh_CN";
    default:
      return "en_US";
  }
}

/** RSS feed of the locale (en lives at the root so feed readers skip the locale redirect). */
export function feedUrl(locale: string): string {
  return localizedUrl(locale, "/feed.xml");
}

/**
 * Cut a description at a word boundary. CJK text has no spaces and reads wider, so it
 * gets a shorter budget and a hard cut.
 */
export function clampDescription(text: string, locale: string = "en"): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const isCjk = locale !== "en";
  const limit = isCjk ? 100 : 160;
  if (clean.length <= limit) return clean;
  const head = clean.slice(0, limit - 1);
  const lastSpace = head.lastIndexOf(" ");
  const cut = !isCjk && lastSpace > limit / 2 ? head.slice(0, lastSpace) : head;
  return `${cut.replace(/[\s,;:、,。.\-–—]+$/u, "")}…`;
}

interface PageMetadataOptions {
  locale: string;
  /** Locale-less app path, e.g. "/news" */
  path: string;
  title: string;
  description: string;
  /** Locales this page exists in (defaults to all) */
  locales?: readonly string[];
  /** Canonical path when it differs from `path` (duplicate views of one listing) */
  canonicalPath?: string;
  image?: { url: string; width: number; height: number; alt?: string };
  openGraphType?: "website" | "article";
  noindex?: boolean;
}

/**
 * Canonical + hreflang + Open Graph + Twitter for a page. Next replaces (not merges) the
 * layout's `openGraph` object once a page sets its own, so url/siteName/images are repeated.
 */
export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  locales = routing.locales,
  canonicalPath,
  image = DEFAULT_OG_IMAGE,
  openGraphType = "website",
  noindex = false,
}: PageMetadataOptions): Metadata {
  const canonical = localizedUrl(locale, canonicalPath ?? path);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: languageAlternates(canonicalPath ?? path, locales),
      types: { "application/rss+xml": feedUrl(locale) },
    },
    openGraph: {
      type: openGraphType,
      url: canonical,
      siteName: SITE_NAME,
      locale: ogLocale(locale),
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
      creator: "@abovethespread",
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
