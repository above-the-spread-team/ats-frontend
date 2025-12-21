"use client";

import { useEffect, useState } from "react";
import FullPage from "@/components/common/full-page";
import NoDate from "@/components/common/no-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  X,
  Clock,
  BarChart3,
  Activity,
  Home,
  Plane,
  RectangleVertical,
  PersonStanding,
} from "lucide-react";
import type { TeamStatisticsApiResponse } from "@/type/footballapi/team-statistics";
import FixtureSummary from "./stat-components/FixtureSummary";
import StatCard from "./stat-components/StatCard";
import MinuteStatChart from "./stat-components/MinuteStatChart";
import UnderOverChart from "./stat-components/UnderOverChart";
import BiggestStatSection from "./stat-components/BiggestStatSection";
import PenaltyCard from "./stat-components/PenaltyCard";

interface StatisticProps {
  leagueId: string;
  teamId: string;
  season: number;
}

export default function Statistic({
  leagueId,
  teamId,
  season,
}: StatisticProps) {
  const [statistics, setStatistics] = useState<
    TeamStatisticsApiResponse["response"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStatistics = async () => {
      if (!leagueId || !teamId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/team-statistics?league=${leagueId}&team=${teamId}&season=${season}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load statistics (${response.status})`);
        }

        const data = (await response.json()) as TeamStatisticsApiResponse;

        setStatistics(data.response);
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatistics(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchStatistics();

    return () => {
      controller.abort();
    };
  }, [leagueId, teamId, season]);

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Form Skeleton */}
        <Skeleton className="h-24 w-full rounded-lg" />

        {/* Fixtures Summary Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-lg" />
          ))}
        </div>

        {/* Goals Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Skeleton key={idx} className="h-48 w-full rounded-lg" />
          ))}
        </div>

        {/* Other Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message={error || "No statistics data available"}
          helpText="Team statistics may not be available for this league, team, or season."
        />
      </FullPage>
    );
  }

  return (
    <div className="space-y-2.5 md:space-y-4 px-1 md:px-0">
      {/* Form */}
      {statistics.form && (
        <div className="bg-card border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <h2 className="text-xs md:text-base font-bold mb-2 text-foreground">
            Recent Form
          </h2>
          <div className="flex items-center gap-1 flex-wrap">
            {statistics.form.split("").map((result, idx) => {
              const color =
                result === "W"
                  ? "bg-gradient-to-br from-green-500/20 to-green-600/10 text-green-600 dark:text-green-400 border-green-500/40"
                  : result === "D"
                  ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/40"
                  : "bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-600 dark:text-red-400 border-red-500/40";
              return (
                <span
                  key={idx}
                  className={`w-4 h-4 md:w-5 md:h-5 rounded-md text-[9px] md:text-[10px] font-bold flex items-center justify-center border ${color}`}
                >
                  {result}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixtures Summary */}
      <FixtureSummary
        played={statistics.fixtures.played}
        wins={statistics.fixtures.wins}
        draws={statistics.fixtures.draws}
        loses={statistics.fixtures.loses}
      />

      {/* Goals & Defense Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          icon={Target}
          iconBgColor="bg-green-500/10"
          iconColor="text-green-600 dark:text-green-400"
          title="Goals For"
          rows={[
            {
              label: "Total",
              value: statistics.goals.for.total.total,
            },
            {
              label: "Avg",
              value: statistics.goals.for.average.total,
            },
            {
              label: "",
              value: "",
              subRows: [
                {
                  label: "Home",
                  value: statistics.goals.for.total.home,
                  avg: statistics.goals.for.average.home,
                },
                {
                  label: "Away",
                  value: statistics.goals.for.total.away,
                  avg: statistics.goals.for.average.away,
                },
              ],
            },
          ]}
        />
        <StatCard
          icon={Shield}
          iconBgColor="bg-red-500/10"
          iconColor="text-red-600 dark:text-red-400"
          title="Goals Against"
          rows={[
            {
              label: "Total",
              value: statistics.goals.against.total.total,
            },
            {
              label: "Avg",
              value: statistics.goals.against.average.total,
            },
            {
              label: "",
              value: "",
              subRows: [
                {
                  label: "Home",
                  value: statistics.goals.against.total.home,
                  avg: statistics.goals.against.average.home,
                },
                {
                  label: "Away",
                  value: statistics.goals.against.total.away,
                  avg: statistics.goals.against.average.away,
                },
              ],
            },
          ]}
        />
        <StatCard
          icon={Shield}
          iconBgColor="bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          title="Clean Sheets"
          rows={[
            {
              label: "Total",
              value: statistics.clean_sheet.total,
            },
            {
              label: "Home",
              value: statistics.clean_sheet.home,
            },
            {
              label: "Away",
              value: statistics.clean_sheet.away,
            },
          ]}
        />
        <StatCard
          icon={X}
          iconBgColor="bg-orange-500/10"
          iconColor="text-orange-600 dark:text-orange-400"
          title="Failed to Score"
          rows={[
            {
              label: "Total",
              value: statistics.failed_to_score.total,
            },
            {
              label: "Home",
              value: statistics.failed_to_score.home,
            },
            {
              label: "Away",
              value: statistics.failed_to_score.away,
            },
          ]}
        />
      </div>

      {/* Goals by Minute */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <MinuteStatChart
          icon={Clock}
          iconBgColor="bg-primary/10"
          iconColor="text-primary"
          title="Goals For by Minute"
          data={
            statistics.goals.for.minute as unknown as Record<
              string,
              { total: number | null; percentage?: string | null }
            >
          }
          valueColor="text-green-600 dark:text-green-400"
          barColor="bg-bar-green"
        />
        <MinuteStatChart
          icon={Clock}
          iconBgColor="bg-red-500/10"
          iconColor="text-red-600 dark:text-red-400"
          title="Goals Against by Minute"
          data={
            statistics.goals.against.minute as unknown as Record<
              string,
              { total: number | null; percentage?: string | null }
            >
          }
          valueColor="text-red-600 dark:text-red-400"
          barColor="bg-bar-red"
        />
      </div>

      {/* Goals Under/Over */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <UnderOverChart
          icon={BarChart3}
          iconBgColor="bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
          title="Goals For - Under/Over"
          data={
            statistics.goals.for.under_over as unknown as Record<
              string,
              { over: number; under: number }
            >
          }
        />
        <UnderOverChart
          icon={BarChart3}
          iconBgColor="bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
          title="Goals Against - Under/Over"
          data={
            statistics.goals.against.under_over as unknown as Record<
              string,
              { over: number; under: number }
            >
          }
        />
      </div>

      {/* Biggest Stats */}
      <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
        <h2 className="text-sm md:text-base font-bold mb-3 text-foreground">
          Biggest
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <BiggestStatSection
            icon={TrendingUp}
            iconColor="text-green-600 dark:text-green-400"
            title="Wins"
            stats={[
              {
                label: "Home",
                value: statistics.biggest.wins.home,
                icon: Home,
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "Away",
                value: statistics.biggest.wins.away,
                icon: Plane,
                color: "text-green-600 dark:text-green-400",
              },
            ]}
          />
          <BiggestStatSection
            icon={TrendingDown}
            iconColor="text-red-600 dark:text-red-400"
            title="Losses"
            stats={[
              {
                label: "Home",
                value: statistics.biggest.loses.home,
                icon: Home,
                color: "text-red-600 dark:text-red-400",
              },
              {
                label: "Away",
                value: statistics.biggest.loses.away,
                icon: Plane,
                color: "text-red-600 dark:text-red-400",
              },
            ]}
          />
          <BiggestStatSection
            icon={Activity}
            iconColor="text-blue-600 dark:text-blue-400"
            title="Streaks"
            stats={[
              {
                label: "Wins",
                value: statistics.biggest.streak.wins,
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "Draws",
                value: statistics.biggest.streak.draws,
                color: "text-yellow-600 dark:text-yellow-400",
              },
              {
                label: "Losses",
                value: statistics.biggest.streak.loses,
                color: "text-red-600 dark:text-red-400",
              },
            ]}
          />
          <BiggestStatSection
            icon={Target}
            iconColor="text-purple-600 dark:text-purple-400"
            title="Goals"
            stats={[
              {
                label: "For (H)",
                value: statistics.biggest.goals.for.home,
                icon: TrendingUp,
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "For (A)",
                value: statistics.biggest.goals.for.away,
                icon: TrendingUp,
                color: "text-green-600 dark:text-green-400",
              },
              {
                label: "Against (H)",
                value: statistics.biggest.goals.against.home,
                icon: Shield,
                color: "text-red-600 dark:text-red-400",
              },
              {
                label: "Against (A)",
                value: statistics.biggest.goals.against.away,
                icon: Shield,
                color: "text-red-600 dark:text-red-400",
              },
            ]}
          />
        </div>
      </div>

      {/* Cards by Minute */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <MinuteStatChart
          icon={RectangleVertical}
          iconBgColor="bg-yellow-500/10"
          iconColor="text-yellow-600 dark:text-yellow-400"
          title="Yellow Cards by Minute"
          data={
            statistics.cards.yellow as unknown as Record<
              string,
              { total: number | null; percentage?: string | null }
            >
          }
          valueColor="text-yellow-600 dark:text-yellow-400"
          barColor="bg-bar-yellow"
        />
        <MinuteStatChart
          icon={RectangleVertical}
          iconBgColor="bg-red-500/10"
          iconColor="text-red-600 dark:text-red-400"
          title="Red Cards by Minute"
          data={
            statistics.cards.red as unknown as Record<
              string,
              { total: number | null; percentage?: string | null }
            >
          }
          valueColor="text-red-600 dark:text-red-400"
          barColor="bg-bar-red"
        />
      </div>

      {/* Lineups and Penalties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Lineups */}
        {statistics.lineups.length > 0 && (
          <div className="bg-card border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
            <div className="flex items-center gap-1 mb-2">
              <div className="p-0 bg-primary/10 rounded-md">
                <PersonStanding className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <h2 className="text-xs md:text-base font-bold text-foreground">
                Formations
              </h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 md:gap-2">
              {statistics.lineups.map((lineup, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-muted/60 to-muted/40 rounded-md md:rounded-lg p-1.5 md:p-2 text-center border border-border/50"
                >
                  <p className="text-xs md:text-sm font-bold text-foreground mb-0.5">
                    {lineup.formation}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {lineup.played} {lineup.played === 1 ? "game" : "games"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Penalties */}
        <PenaltyCard
          scored={statistics.penalty.scored}
          missed={statistics.penalty.missed}
          total={statistics.penalty.total}
        />
      </div>
    </div>
  );
}
