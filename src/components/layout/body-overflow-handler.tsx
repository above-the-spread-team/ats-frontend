"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyOverflowHandler() {
  const pathname = usePathname();
  const isDiscussPage = pathname?.startsWith("/discuss") ?? false;

  useEffect(() => {
    if (isDiscussPage) {
      document.body.classList.add("overflow-y-hidden");
    } else {
      document.body.classList.remove("overflow-y-hidden");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-y-hidden");
    };
  }, [isDiscussPage]);

  return null;
}
