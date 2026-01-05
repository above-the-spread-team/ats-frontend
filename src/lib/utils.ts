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
