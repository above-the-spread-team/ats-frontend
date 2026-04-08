"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePlausible } from "next-plausible";

const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

export default function AnalyticsTracker() {
  const plausible = usePlausible();
  const pathname = usePathname();
  const firedThresholds = useRef<Set<number>>(new Set());
  const sentinelRef = useRef<HTMLDivElement>(null);
  const viewableTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewableFiredRef = useRef(false);

  // Reset on route change
  useEffect(() => {
    firedThresholds.current = new Set();
    viewableFiredRef.current = false;
    if (viewableTimerRef.current) clearTimeout(viewableTimerRef.current);
  }, [pathname]);

  // Scroll depth tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);

      for (const threshold of SCROLL_THRESHOLDS) {
        if (pct >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          plausible("Scroll Depth", { props: { depth: `${threshold}%`, page: pathname } });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, plausible]);

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
      { threshold: 0.5 }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      if (viewableTimerRef.current) clearTimeout(viewableTimerRef.current);
    };
  }, [pathname, plausible]);

  return <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />;
}
