"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePlausible } from "next-plausible";

export default function AnalyticsTracker() {
  const plausible = usePlausible();
  const pathname = usePathname();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const viewableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewableFiredRef = useRef(false);

  // Reset on route change
  useEffect(() => {
    viewableFiredRef.current = false;
    if (viewableTimerRef.current) clearTimeout(viewableTimerRef.current);
  }, [pathname]);

  // Viewability tracking — fires "Viewable" after the sentinel is visible for 1s
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !viewableFiredRef.current) {
          viewableTimerRef.current = setTimeout(() => {
            viewableFiredRef.current = true;
            plausible("Viewable", { props: { page: pathname } });
          }, 1000);
        } else {
          if (viewableTimerRef.current) {
            clearTimeout(viewableTimerRef.current);
            viewableTimerRef.current = null;
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      if (viewableTimerRef.current) clearTimeout(viewableTimerRef.current);
    };
  }, [pathname, plausible]);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      className="bg-primary-active"
      style={{ height: 1 }}
    />
  );
}
