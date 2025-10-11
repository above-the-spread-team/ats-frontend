import { Arimo } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { ThemeProvider } from "@/providers/theme-provider";
import Nav from "@/components/layout/nav";
import MobileNav from "@/components/layout/mobile-nax";
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
      <body
        className={`${ff.variable} font-alan-sans overflow-x-hidden antialiased pb-16 md:pb-0`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          <Header />
          <Nav />
          {children}
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
