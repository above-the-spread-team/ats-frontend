"use client";

import { useRouter } from "next/navigation";

type TabType = "standings" | "leaders" | "teams";

interface SeasonSelectProps {
  leagueId: string;
  season: number;
  activeTab: TabType;
}

export default function SeasonSelect({
  leagueId,
  season,
  activeTab,
}: SeasonSelectProps) {
  const router = useRouter();

  const handleSeasonChange = (newSeason: number) => {
    const params = new URLSearchParams();
    params.set("season", newSeason.toString());
    if (activeTab !== "standings") {
      params.set("tab", activeTab);
    }
    router.push(`/stats/${leagueId}?${params.toString()}`);
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
