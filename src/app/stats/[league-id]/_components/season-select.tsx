"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type TabType = "standings" | "leaders" | "teams";

interface SeasonSelectProps {
  leagueId?: string;
  season: number;
  activeTab?: TabType;
}

export default function SeasonSelect({ season, activeTab }: SeasonSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSeasonChange = (newSeason: number) => {
    // Get current search params and update only the season
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", newSeason.toString());

    // Preserve the tab parameter if it exists in the URL
    // If no tab in URL but activeTab is provided and not "standings", set it
    if (!searchParams.get("tab") && activeTab && activeTab !== "standings") {
      params.set("tab", activeTab);
    }

    // Use current pathname to preserve the route structure (works for both league and team pages)
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <label
        htmlFor="season-select"
        className="text-sm font-medium text-muted-foreground"
      >
        Season:
      </label>
      <select
        id="season-select"
        value={season}
        onChange={(e) => handleSeasonChange(parseInt(e.target.value, 10))}
        className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {Array.from({ length: 5 }, (_, i) => {
          const year = new Date().getFullYear() - i;
          return (
            <option key={year} value={year}>
              {year}/{year + 1}
            </option>
          );
        })}
      </select>
    </div>
  );
}
