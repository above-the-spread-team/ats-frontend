"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import MinHeight from "@/components/common/min-height";
import StatsNav from "./_components/nav";
import Standings from "./_components/standing";
import Leader from "./_components/leader";
import Teams from "./_components/teams";

type TabType = "standings" | "leaders" | "teams";

export default function LeagueStatsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const leagueId = params["league-id"] as string;

  // Get tab from URL or default to standings
  const tabParam = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam && ["standings", "leaders", "teams"].includes(tabParam)
      ? tabParam
      : "standings"
  );

  // Get season from URL query params, default to current year
  const seasonParam = searchParams.get("season");
  const selectedSeason = seasonParam
    ? parseInt(seasonParam, 10)
    : new Date().getFullYear();

  const handleSeasonChange = (newSeason: number) => {
    const params = new URLSearchParams();
    params.set("season", newSeason.toString());
    if (activeTab !== "standings") {
      params.set("tab", activeTab);
    }
    router.push(`/stats/${leagueId}?${params.toString()}`);
  };

  return (
    <MinHeight>
      <div className="container mx-auto space-y-4 px-4 md:px-6 py-4">
        {/* Season Selector */}
        <div className="flex items-center justify-end gap-2">
          <label
            htmlFor="season-select"
            className="text-sm font-medium text-muted-foreground"
          >
            Season:
          </label>
          <select
            id="season-select"
            value={selectedSeason}
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

        {/* Tab Navigation */}
        <StatsNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          leagueId={leagueId}
          season={selectedSeason}
        />

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "standings" && (
            <Standings leagueId={leagueId} season={selectedSeason} />
          )}
          {activeTab === "leaders" && (
            <Leader leagueId={leagueId} season={selectedSeason} />
          )}
          {activeTab === "teams" && (
            <Teams leagueId={leagueId} season={selectedSeason} />
          )}
        </div>
      </div>
    </MinHeight>
  );
}
