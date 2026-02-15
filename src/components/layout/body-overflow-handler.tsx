"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function BodyOverflowHandler() {
  const pathname = usePathname();
  const isDiscussPageRef = useRef(pathname != null && pathname.startsWith("/discuss"));
  if (pathname != null) {
    isDiscussPageRef.current = pathname.startsWith("/discuss");
  }
  const isDiscussPage = isDiscussPageRef.current;

  useEffect(() => {
    if (isDiscussPage) {
      document.body.classList.add("overflow-y-hidden");
    } else {
      document.body.classList.remove("overflow-y-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-y-hidden");
    };
  }, [isDiscussPage]);

  return null;
}
