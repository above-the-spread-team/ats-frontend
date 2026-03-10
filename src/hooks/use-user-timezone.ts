"use client";

import { useState, useEffect } from "react";
import { getUserTimezone } from "@/lib/utils";

/**
 * SSR-safe hook that returns the browser's IANA timezone string.
 * Initialises with "UTC" so server and first client render match,
 * then updates to the real local timezone after hydration.
 */
export function useUserTimezone(): string {
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    setTimezone(getUserTimezone());
  }, []);

  return timezone;
}
