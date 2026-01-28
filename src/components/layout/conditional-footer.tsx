"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isDiscussPage = pathname?.startsWith("/discuss") ?? false;

  // Don't render footer on discuss pages
  if (isDiscussPage) {
    return null;
  }

  return <Footer />;
}
