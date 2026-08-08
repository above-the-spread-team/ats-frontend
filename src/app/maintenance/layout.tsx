import { Sora } from "next/font/google";
import "../globals.css";
import { getMaintenanceLocale } from "./locale";

const sora = Sora({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sora",
});

// This route lives outside [locale] (the middleware rewrites every path to
// /maintenance while maintenance mode is on), so it must provide its own
// <html>/<body> — the root layout is a pass-through.
export default async function MaintenanceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getMaintenanceLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${sora.className} ${sora.variable} font-normal`}>
        {children}
      </body>
    </html>
  );
}
