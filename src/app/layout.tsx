import { Arimo } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { MyQueryClientProvider } from "@/providers/query-client";
import { ToastContainer } from "react-toastify";
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
      <body className={`${ff.variable} font-alan-sans `}>
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
