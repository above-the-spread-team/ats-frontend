"use client";

import { useState, useEffect } from "react";
import { getUserTimezone } from "@/lib/utils";

/**
 * SSR-safe hook that returns the browser's IANA timezone string.
 * Returns null until the timezone is resolved after hydration (so server and
 * first client render match) — callers can gate data fetching on it to avoid
 * firing a throwaway request with a placeholder timezone.
 */
export function useUserTimezone(): string | null {
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    setTimezone(getUserTimezone());
  }, []);

  return timezone;
}
