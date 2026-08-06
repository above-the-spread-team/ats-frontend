import { Sora } from "next/font/google";
import "../globals.css";
import "react-toastify/dist/ReactToastify.css";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/providers/theme-provider";
import { MyQueryClientProvider } from "@/providers/query-client";
import { ToastContainer } from "react-toastify";
import PlausibleProvider from "next-plausible";
import type { Metadata } from "next";

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
    metadataBase: new URL("https://www.abovethespread.com"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale:
        locale === "ja"
          ? "ja_JP"
          : locale === "zh-TW"
            ? "zh_TW"
            : locale === "zh-CN"
              ? "zh_CN"
              : "en_US",
      url: "https://www.abovethespread.com",
      siteName: "Above The Spread",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "https://www.abovethespread.com/images/og.jpeg",
          width: 1200,
          height: 630,
          alt: "Above The Spread — Football Stats & Community",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: ["https://www.abovethespread.com/images/og.jpeg"],
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

  const messages = await getMessages();

  const jsonLdDescription =
    locale === "ja"
      ? "ライブ試合日程、詳細なスタッツ、試合予想、サッカーディスカッション — プレミアリーグ、ラ・リーガ、セリエA、ブンデスリーガ、リーグ・アン、欧州カップ戦をカバー。"
      : locale === "zh-TW"
        ? "即時足球賽程、深度數據統計、比賽預測與球迷討論 — 涵蓋英超、西甲、意甲、德甲、法甲及歐洲盃賽事。"
        : locale === "zh-CN"
          ? "即时足球赛程、深度数据统计、比赛预测与球迷讨论 — 涵盖英超、西甲、意甲、德甲、法甲及欧洲杯赛事。"
          : "Live football fixtures, in-depth stats, match predictions, and fan discussions — covering Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and European cups.";

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsOrganization",
              name: "Above The Spread",
              url: "https://abovethespread.com",
              logo: "https://abovethespread.com/logo.png",
              description: jsonLdDescription,
            }),
          }}
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
