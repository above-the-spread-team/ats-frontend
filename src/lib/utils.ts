import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the football season year based on a given date.
 * Football seasons typically run from August/September to May.
 * If month is after May (June onwards), use current year as season.
 * Otherwise (January to May), use previous year as season.
 *
 * @param date - Optional date to calculate season for. If not provided, uses current date.
 * @returns The season year (e.g., 2025 for 2024-2025 season)
 */
/**
 * Returns the browser's IANA timezone string, falling back to "UTC".
 * Guards against Safari low-power mode where Intl can fail to resolve
 * (https://bugs.webkit.org/show_bug.cgi?id=197769).
 *
 * NOTE: Only call this on the client (inside useEffect / event handlers).
 * Use the `useUserTimezone` hook for SSR-safe access in components.
 */
export function getUserTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz?.trim() ? tz : "UTC";
  } catch {
    return "UTC";
  }
}

export function calculateSeason(date?: Date | string): number {
  const dateObj = date
    ? typeof date === "string"
      ? new Date(date)
      : date
    : new Date();
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1; // getMonth() returns 0-11, so add 1 for 1-12
  return month > 6 ? year : year - 1;
}
