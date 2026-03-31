import { Arimo } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { MyQueryClientProvider } from "@/providers/query-client";
import { ToastContainer } from "react-toastify";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Above The Spread | Football Stats, Fixtures & Community",
    template: "%s | Above The Spread",
  },
  description:
    "Above The Spread is your go-to football platform for live fixtures, in-depth stats, match predictions, and fan discussions. Covering the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, UEFA Champions League, Europa League, and more.",
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://abovethespread.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Above The Spread",
    title: "Above The Spread | Football Stats, Fixtures & Community",
    description:
      "Live fixtures, deep-dive stats, match predictions, and football discussions — all in one place. Follow the Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and European cups.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Above The Spread — Football Stats & Community",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Above The Spread | Football Stats, Fixtures & Community",
    description:
      "Live fixtures, deep-dive stats, match predictions, and football discussions — all in one place.",
    images: ["/og-image.png"],
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
const ff = Arimo({
  weight: ["400", "500", "600", "700"],
  variable: "--font-alan-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              description:
                "Live football fixtures, in-depth stats, match predictions, and fan discussions — covering Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and European cups.",
            }),
          }}
        />
      </head>
      <body className={ff.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
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
      </body>
    </html>
  );
}
