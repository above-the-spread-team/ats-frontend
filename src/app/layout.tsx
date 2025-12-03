import { Arimo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { MyQueryClientProvider } from "@/providers/query-client";
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
        className={`${ff.variable} font-alan-sans overflow-x-hidden antialiased pb-10 md:pb-0`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          <MyQueryClientProvider>{children}</MyQueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
