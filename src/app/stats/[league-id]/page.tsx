"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Award, Earth, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StatsNav from "./_components/nav";
import SeasonSelect from "./_components/season-select";
import Standings from "./_components/standing";
import Leader from "./_components/leader";
import Teams from "./_components/teams";
import type { LeagueResponseItem } from "@/type/league";

type TabType = "standings" | "leaders" | "teams";

export default function LeagueStatsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leagueId = params["league-id"] as string;

  const [league, setLeague] = useState<LeagueResponseItem | null>(null);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);

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

  // Fetch league information
  useEffect(() => {
    const controller = new AbortController();

    const fetchLeague = async () => {
      if (!leagueId) return;

      setIsLoadingLeague(true);

      try {
        const response = await fetch(`/api/league?id=${leagueId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load league (${response.status})`);
        }

        const data = await response.json();
        setLeague(data.response);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Error fetching league:", err);
        setLeague(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingLeague(false);
        }
      }
    };

    fetchLeague();

    return () => {
      controller.abort();
    };
  }, [leagueId]);

  return (
    <>
      <div className="container mx-auto max-w-6xl space-y-4 px-4 md:px-6  pt-4 ">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* League Information */}
          {isLoadingLeague ? (
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
                <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
              </div>
            </div>
          ) : league ? (
            <div className="flex items-center gap-3">
              {league.league.logo && (
                <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 ">
                  <Image
                    src={league.league.logo}
                    alt={league.league.name}
                    fill
                    className="object-contain dark:p-1 dark:bg-mygray/50 dark:rounded-lg "
                    sizes="(max-width: 768px) 48px, 56px"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-base md:text-lg font-bold text-foreground">
                  {league.league.name}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  {league.country.flag ? (
                    <div className="relative w-4 h-4 flex-shrink-0">
                      <Image
                        src={league.country.flag}
                        alt={league.country.name}
                        fill
                        className="object-contain"
                        sizes="16px"
                      />
                    </div>
                  ) : (
                    <Earth className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {league.country.name}
                  </span>
                  {league.league.type && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1.5">
                        {league.league.type === "League" ? (
                          <Award className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : league.league.type === "Cup" ? (
                          <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : null}
                        <span className="text-sm text-muted-foreground capitalize">
                          {league.league.type}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              League information unavailable
            </div>
          )}

          {/* Season Selector */}
          <div className="flex w-full justify-end md:justify-start md:w-auto">
            <SeasonSelect
              leagueId={leagueId}
              season={selectedSeason}
              activeTab={activeTab}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <StatsNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          leagueId={leagueId}
          season={selectedSeason}
        />
      </div>
      <div className=" container mx-auto max-w-6xl pb-10 pt-4 ">
        {/* Tab Content */}
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
    </>
  );
}
