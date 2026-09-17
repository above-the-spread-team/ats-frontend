import { Sora } from "next/font/google";
import "../globals.css";
import "react-toastify/dist/ReactToastify.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/theme-provider";
import { MyQueryClientProvider } from "@/providers/query-client";
import { ToastContainer } from "react-toastify";
import PlausibleProvider from "next-plausible";
import type { Metadata } from "next";
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  feedUrl,
  ogLocale,
} from "@/lib/seo";
import { JsonLd, PUBLISHER_LD, graphLd } from "@/lib/json-ld";

const sora = Sora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sora",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: {
      default: t("title"),
      template: `%s | Above The Spread`,
    },
    description: t("description"),
    keywords: [
      "football",
      "soccer",
      "live scores",
      "fixtures",
      "football stats",
      "match predictions",
      "Premier League",
      "La Liga",
      "Serie A",
      "Bundesliga",
      "Ligue 1",
      "UEFA Champions League",
      "Europa League",
      "football news",
      "match analysis",
      "above the spread",
    ],
    authors: [{ name: "Above The Spread" }],
    creator: "Above The Spread",
    publisher: "Above The Spread",
    metadataBase: new URL(SITE_URL),
    // No layout-level canonical: it would be inherited by every child page
    // that lacks its own metadata, canonicalizing them all to the same URL.
    // Pages that need one (e.g. article detail) declare it themselves.
    alternates: {
      types: { "application/rss+xml": feedUrl(locale) },
    },
    openGraph: {
      type: "website",
      locale: ogLocale(locale),
      url: SITE_URL,
      siteName: SITE_NAME,
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [DEFAULT_OG_IMAGE.url],
      creator: "@abovethespread",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "sports",
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
} as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const tMeta = await getTranslations({ locale, namespace: "metadata" });
  const jsonLdDescription = tMeta("jsonLdDescription");

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <JsonLd
          data={graphLd([
            { ...PUBLISHER_LD, description: jsonLdDescription },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: SITE_NAME,
              inLanguage: locale,
              publisher: { "@id": PUBLISHER_LD["@id"] },
            },
          ])}
        />
      </head>
      <body className={`${sora.className} ${sora.variable} font-normal`}>
        <NextIntlClientProvider messages={messages}>
          <PlausibleProvider
            src={
              process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ??
              "https://plausible.io/js/plausible.js"
            }
            enabled={!!process.env.NEXT_PUBLIC_PLAUSIBLE_SRC}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
            >
              <MyQueryClientProvider>
                {children}
                <ToastContainer
                  position="bottom-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  theme="light"
                  toastClassName="rounded-lg border border-border shadow-lg"
                />
              </MyQueryClientProvider>
            </ThemeProvider>
          </PlausibleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
