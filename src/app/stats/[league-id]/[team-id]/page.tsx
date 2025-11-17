"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FullPage from "@/components/common/full-page";
import Loading from "@/components/common/loading";
import type { TeamResponseItem } from "@/type/teams-info";
import SeasonSelect from "../_components/season-select";
import TeamNav from "./_components/nav";
import Statistic from "./_components/statistic";
import Squad from "./_components/squad";

type TabType = "statistics" | "squad";

export default function TeamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leagueId = params["league-id"] as string;
  const teamId = params["team-id"] as string;

  const seasonParam = searchParams.get("season");
  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : new Date().getFullYear();

  // Get tab from URL or default to statistics
  const tabParam = searchParams.get("tab") as TabType;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabParam && ["statistics", "squad"].includes(tabParam)
      ? tabParam
      : "statistics"
  );

  const [teamInfo, setTeamInfo] = useState<TeamResponseItem | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);

  // Fetch team information
  useEffect(() => {
    const controller = new AbortController();

    const fetchTeamInfo = async () => {
      if (!teamId) return;

      setIsLoadingTeam(true);

      try {
        const response = await fetch(`/api/team-info?id=${teamId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load team (${response.status})`);
        }

        const data = await response.json();
        setTeamInfo(data.response);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching team:", err);
        setTeamInfo(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingTeam(false);
        }
      }
    };

    fetchTeamInfo();

    return () => {
      controller.abort();
    };
  }, [teamId]);

  if (isLoadingTeam) {
    return (
      <FullPage>
        <Loading />
      </FullPage>
    );
  }

  return (
    <FullPage>
      <div className="container mx-auto space-y-6 px-4 md:px-6 pb-4">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex pt-3 items-center justify-between">
            <Link
              href={`/stats/${leagueId}?season=${season}&tab=teams`}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Teams
            </Link>
            <SeasonSelect
              leagueId={leagueId}
              season={season}
              activeTab="teams"
            />
          </div>

          <div className="flex items-center gap-4">
            {teamInfo?.team.logo && (
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src={teamInfo.team.logo}
                  alt={teamInfo.team.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 64px, 80px"
                />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {teamInfo?.team.name || "Team"}
              </h1>
              {teamInfo && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {teamInfo.team.country}
                  </span>
                  {teamInfo.team.founded && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        Founded {teamInfo.team.founded}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TeamNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          leagueId={leagueId}
          teamId={teamId}
          season={season}
        />

        {/* Tab Content */}
        {activeTab === "statistics" && (
          <Statistic leagueId={leagueId} teamId={teamId} season={season} />
        )}

        {activeTab === "squad" && <Squad teamId={teamId} />}
      </div>
    </FullPage>
  );
}
