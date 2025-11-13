"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import MinHeight from "@/components/common/min-height";
import StatsNav from "./_components/nav";
import Standings from "./_components/standing";
import StatsLeader from "./_components/stats-leader";
import Teams from "./_components/teams";

type TabType = "standings" | "leaders" | "teams";

export default function LeagueStatsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
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

  return (
    <MinHeight>
      <div className="container mx-auto space-y-4 px-4 md:px-6 py-4">
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
            <StatsLeader leagueId={leagueId} season={selectedSeason} />
          )}
          {activeTab === "teams" && (
            <Teams leagueId={leagueId} season={selectedSeason} />
          )}
        </div>
      </div>
    </MinHeight>
  );
}
