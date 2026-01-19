"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Building2,
  Armchair,
  Users,
  BarChart3,
} from "lucide-react";
import FullPage from "@/components/common/full-page";
import IconBg from "@/components/common/icon-bg";
import { Skeleton } from "@/components/ui/skeleton";
import Nav from "@/components/common/nav-stats";
import type { TeamResponseItem } from "@/type/footballapi/teams-info";
import SeasonSelect from "../_components/season-select";
import Statistic from "./_components/statistic";
import Squad from "./_components/squad";
import { calculateSeason } from "@/lib/utils";

type TabType = "statistics" | "squad";

export default function TeamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const leagueId = params["league-id"] as string;
  const teamId = params["team-id"] as string;

  const seasonParam = searchParams.get("season");
  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : calculateSeason();

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
        <div className="container mx-auto max-w-6xl space-y-1 md:space-y-4 px-4 md:px-6 pb-4">
          {/* Back Link Skeleton */}
          <div className="flex items-center my-4 gap-2 w-fit">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>

          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo Skeleton */}
              <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-lg flex-shrink-0" />
              <div className="flex flex-col gap-2">
                {/* Title and badges skeleton */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Skeleton className="h-5 md:h-6 w-32 md:w-40 rounded" />
                  <Skeleton className="h-5 w-12 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-md" />
                </div>
                {/* Subtitle skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-1 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
            </div>
            {/* Season Select Skeleton */}
            <div className="flex w-full justify-end md:justify-start md:w-auto">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          </div>

          {/* Venue Information Skeleton (hidden on mobile) */}
          <div className="p-2 pt-4 px-4 hidden md:block">
            <div className="flex flex-row flex-wrap items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-1 rounded" />
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-4 w-1 rounded" />
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="flex gap-2 border-b border-border">
            <Skeleton className="h-8 w-24 rounded-t" />
            <Skeleton className="h-8 w-24 rounded-t" />
          </div>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage>
      <div className="container mx-auto max-w-6xl space-y-1 md:space-y-2  px-4 md:px-6 pb-4 ">
        {/* Header */}
        <Link
          href={`/stats/${leagueId}?season=${season}&tab=teams`}
          className="flex items-center my-4 gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Teams
        </Link>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-3">
            {teamInfo?.team.logo && (
              <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
                <IconBg className="w-full h-full">
                  <Image
                    src={teamInfo.team.logo}
                    alt={teamInfo.team.name}
                    fill
                    className="object-contain dark:p-1"
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                </IconBg>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base md:text-lg font-bold text-foreground">
                  {teamInfo?.team.name || "Team"}
                </h1>
                {teamInfo?.team.code && (
                  <span className="px-2.5 py-1 bg-muted/80 rounded-md text-xs font-semibold text-muted-foreground border border-border/50">
                    {teamInfo.team.code}
                  </span>
                )}
                {teamInfo?.team.national && (
                  <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold border border-primary/20">
                    National
                  </span>
                )}
              </div>
              {teamInfo && (
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
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
          {activeTab !== "squad" ? (
            <div className="flex w-full justify-end md:justify-start md:w-auto">
              <SeasonSelect
                leagueId={leagueId}
                season={season}
                activeTab="teams"
              />
            </div>
          ) : (
            <div>{""}</div>
          )}
        </div>

        {teamInfo && (
          <div className="p-2 pt-4 px-4 hidden md:block opacity-100">
            {(teamInfo.venue.name ||
              teamInfo.venue.city ||
              teamInfo.venue.capacity ||
              teamInfo.venue.surface ||
              teamInfo.venue.address) && (
              <div className="flex flex-row flex-wrap items-start md:items-center gap-1">
                {teamInfo.venue.name && (
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <span className="text-xs md:text-sm text-muted-foreground font-medium">
                      {teamInfo.venue.name}
                    </span>
                  </div>
                )}
                <span className="text-muted-foreground text-lg">・</span>
                {(teamInfo.venue.city || teamInfo.venue.address) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {teamInfo.venue.city}
                      {teamInfo.venue.address && `, ${teamInfo.venue.address}`}
                    </span>
                  </div>
                )}
                <span className="text-muted-foreground text-lg">・</span>
                {teamInfo.venue.capacity && (
                  <div className="flex items-center gap-1">
                    <Armchair className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <span className="text-xs md:text-sm text-muted-foreground font-medium">
                      {teamInfo.venue.capacity.toLocaleString()} seats
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <Nav
          tabs={[
            { id: "statistics", label: "Statistics", icon: BarChart3 },
            { id: "squad", label: "Squad", icon: Users },
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          additionalParams={{ season: season.toString() }}
          className="px-4"
          showIconAlways={true}
        />

        <div className="pt-2 pb-10">
          {/* Tab Content */}
          {activeTab === "statistics" && (
            <Statistic leagueId={leagueId} teamId={teamId} season={season} />
          )}

          {activeTab === "squad" && (
            <Squad teamId={teamId} leagueId={leagueId} />
          )}
        </div>
      </div>
    </FullPage>
  );
}
