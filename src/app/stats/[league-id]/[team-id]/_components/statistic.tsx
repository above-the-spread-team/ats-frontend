"use client";

import { useEffect, useState } from "react";
import FullPage from "@/components/common/full-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  X,
  Award,
  Clock,
  BarChart3,
  Activity,
  Zap,
  Home,
  Plane,
  Minus,
} from "lucide-react";
import type { TeamStatisticsApiResponse } from "@/type/team-statistics";

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
      <FullPage>
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">
            {error || "No statistics data available"}
          </p>
        </div>
      </FullPage>
    );
  }

  return (
    <div className="space-y-2.5 md:space-y-4 px-1 md:px-0">
      {/* Form */}
      {statistics.form && (
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="p-1 bg-primary/10 rounded-md">
              <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Recent Form
            </h2>
          </div>
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
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2 md:p-3 text-center shadow-sm">
          <div>
            <div className="flex items-center justify-center mb-0.5">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground" />
            </div>
            <p className="text-base md:text-xl font-bold text-foreground mb-0.5">
              {statistics.fixtures.played.total}
            </p>
            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-1">
              Played
            </p>
            <div className="flex justify-center gap-1 text-[9px] md:text-xs text-muted-foreground pt-1 border-t border-border/50">
              <span className="flex items-center gap-0.5">
                <Home className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.played.home}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Plane className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.played.away}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg md:rounded-xl p-2 md:p-3 text-center shadow-sm">
          <div>
            <div className="flex items-center justify-center mb-0.5">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-base md:text-xl font-bold text-green-600 dark:text-green-400 mb-0.5">
              {statistics.fixtures.wins.total}
            </p>
            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-1">
              Wins
            </p>
            <div className="flex justify-center gap-1 text-[9px] md:text-xs text-muted-foreground pt-1 border-t border-border/50">
              <span className="flex items-center gap-0.5">
                <Home className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.wins.home}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Plane className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.wins.away}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-lg md:rounded-xl p-2 md:p-3 text-center shadow-sm">
          <div>
            <div className="flex items-center justify-center mb-0.5">
              <Minus className="w-3 h-3 md:w-4 md:h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-base md:text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-0.5">
              {statistics.fixtures.draws.total}
            </p>
            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-1">
              Draws
            </p>
            <div className="flex justify-center gap-1 text-[9px] md:text-xs text-muted-foreground pt-1 border-t border-border/50">
              <span className="flex items-center gap-0.5">
                <Home className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.draws.home}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Plane className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.draws.away}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-lg md:rounded-xl p-2 md:p-3 text-center shadow-sm">
          <div>
            <div className="flex items-center justify-center mb-0.5">
              <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-base md:text-xl font-bold text-red-600 dark:text-red-400 mb-0.5">
              {statistics.fixtures.loses.total}
            </p>
            <p className="text-[10px] md:text-xs font-semibold text-muted-foreground mb-1">
              Losses
            </p>
            <div className="flex justify-center gap-1 text-[9px] md:text-xs text-muted-foreground pt-1 border-t border-border/50">
              <span className="flex items-center gap-0.5">
                <Home className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.loses.home}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5">
                <Plane className="w-2 h-2 md:w-2.5 md:h-2.5" />
                {statistics.fixtures.loses.away}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals & Defense Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Goals For */}
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2">
            <div className="p-1 bg-green-500/10 rounded-md">
              <Target className="w-3 h-3 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-[11px] md:text-xs font-bold text-foreground">
              Goals For
            </h2>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-0.5 border-b border-border/50">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Total
              </span>
              <span className="text-[11px] md:text-xs font-bold text-foreground">
                {statistics.goals.for.total.total}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-border/50">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Avg
              </span>
              <span className="text-[11px] md:text-xs font-semibold text-foreground">
                {statistics.goals.for.average.total}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 py-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Home
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] md:text-xs text-muted-foreground text-right">
                    avg: {statistics.goals.for.average.home}
                  </span>
                  <span className="text-[11px] w-6 text-right md:text-xs text-foreground font-medium">
                    {statistics.goals.for.total.home}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 py-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Away
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] md:text-xs text-muted-foreground text-right">
                    avg: {statistics.goals.for.average.away}
                  </span>
                  <span className="text-[11px] w-6 text-right md:text-xs text-foreground font-medium">
                    {statistics.goals.for.total.away}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Goals Against */}
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2">
            <div className="p-1 bg-red-500/10 rounded-md">
              <Shield className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-[11px] md:text-xs font-bold text-foreground">
              Goals Against
            </h2>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-0.5 border-b border-border/50">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Total
              </span>
              <span className="text-[11px] md:text-xs font-bold text-foreground">
                {statistics.goals.against.total.total}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-b border-border/50">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Avg
              </span>
              <span className="text-[11px] md:text-xs font-semibold text-foreground">
                {statistics.goals.against.average.total}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 py-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Home
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] md:text-xs text-muted-foreground text-right">
                    avg: {statistics.goals.against.average.home}
                  </span>
                  <span className="text-[11px] w-6 text-right md:text-xs text-foreground font-medium">
                    {statistics.goals.against.total.home}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 py-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Away
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] md:text-xs text-muted-foreground text-right">
                    avg: {statistics.goals.against.average.away}
                  </span>
                  <span className="text-[11px] w-6 text-right md:text-xs text-foreground font-medium">
                    {statistics.goals.against.total.away}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Sheets */}
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2">
            <div className="p-1 bg-blue-500/10 rounded-md">
              <Shield className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-[11px] md:text-xs font-bold text-foreground">
              Clean Sheets
            </h2>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-0.5 border-b border-border/50">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Total
              </span>
              <span className="text-[11px] md:text-xs font-bold text-foreground">
                {statistics.clean_sheet.total}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Home
              </span>
              <span className="text-[11px] md:text-xs text-foreground font-medium">
                {statistics.clean_sheet.home}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Away
              </span>
              <span className="text-[11px] md:text-xs text-foreground font-medium">
                {statistics.clean_sheet.away}
              </span>
            </div>
          </div>
        </div>

        {/* Failed to Score */}
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2">
            <div className="p-1 bg-orange-500/10 rounded-md">
              <X className="w-3 h-3 md:w-4 md:h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-[11px] md:text-xs font-bold text-foreground">
              Failed to Score
            </h2>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-0.5 border-b border-border/50">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Total
              </span>
              <span className="text-[11px] md:text-xs font-bold text-foreground">
                {statistics.failed_to_score.total}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Home
              </span>
              <span className="text-[11px] md:text-xs text-foreground font-medium">
                {statistics.failed_to_score.home}
              </span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-[11px] md:text-xs text-muted-foreground">
                Away
              </span>
              <span className="text-[11px] md:text-xs text-foreground font-medium">
                {statistics.failed_to_score.away}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Goals by Minute */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2.5">
            <div className="p-1 bg-primary/10 rounded-md">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Goals For by Minute
            </h2>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.goals.for.minute).map(
              ([minute, stat]) =>
                stat.total !== null && (
                  <div key={minute} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-medium text-foreground">
                        {minute}&apos;
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs font-bold text-green-600 dark:text-green-400">
                          {stat.total}
                        </span>
                        {stat.percentage && (
                          <span className="text-[9px] md:text-[10px] text-muted-foreground w-8 text-right">
                            {stat.percentage}
                          </span>
                        )}
                      </div>
                    </div>
                    {stat.percentage && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bar-green rounded-full transition-all duration-500"
                          style={{
                            width: stat.percentage,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2.5">
            <div className="p-1 bg-red-500/10 rounded-md">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Goals Against by Minute
            </h2>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.goals.against.minute).map(
              ([minute, stat]) =>
                stat.total !== null && (
                  <div key={minute} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-medium text-foreground">
                        {minute}&apos;
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs font-bold text-red-600 dark:text-red-400">
                          {stat.total}
                        </span>
                        {stat.percentage && (
                          <span className="text-[9px] md:text-[10px] text-muted-foreground w-8 text-right">
                            {stat.percentage}
                          </span>
                        )}
                      </div>
                    </div>
                    {stat.percentage && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bar-red rounded-full transition-all duration-500"
                          style={{
                            width: stat.percentage,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      {/* Goals Under/Over */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2.5">
            <div className="p-1 bg-purple-500/10 rounded-md">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Goals For - Under/Over
            </h2>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.goals.for.under_over).map(
              ([threshold, stat]) => {
                const total = stat.over + stat.under;
                const overPercent = total > 0 ? (stat.over / total) * 100 : 0;
                return (
                  <div key={threshold} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-medium text-foreground">
                        {threshold}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] text-green-600 dark:text-green-400">
                          Over: <span className="font-bold">{stat.over}</span>
                        </span>
                        <span className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400">
                          Under: <span className="font-bold">{stat.under}</span>
                        </span>
                      </div>
                    </div>
                    {total > 0 && (
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-bar-green transition-all duration-500"
                          style={{ width: `${overPercent}%` }}
                        />
                        <div
                          className="h-full bg-bar-red transition-all duration-500"
                          style={{ width: `${100 - overPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2.5">
            <div className="p-1 bg-indigo-500/10 rounded-md">
              <BarChart3 className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Goals Against - Under/Over
            </h2>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.goals.against.under_over).map(
              ([threshold, stat]) => {
                const total = stat.over + stat.under;
                const overPercent = total > 0 ? (stat.over / total) * 100 : 0;
                return (
                  <div key={threshold} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-medium text-foreground">
                        {threshold}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] md:text-[10px] text-green-600 dark:text-green-400">
                          Over: <span className="font-bold">{stat.over}</span>
                        </span>
                        <span className="text-[9px] md:text-[10px] text-red-600 dark:text-red-400">
                          Under: <span className="font-bold">{stat.under}</span>
                        </span>
                      </div>
                    </div>
                    {total > 0 && (
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-bar-green transition-all duration-500"
                          style={{ width: `${overPercent}%` }}
                        />
                        <div
                          className="h-full bg-bar-red transition-all duration-500"
                          style={{ width: `${100 - overPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Biggest Stats */}
      <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
        <div className="flex items-center gap-1 mb-3">
          <div className="p-1 bg-primary/10 rounded-md">
            <Award className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          </div>
          <h2 className="text-[11px] md:text-xs font-bold text-foreground">
            Biggest
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {/* Wins */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
              <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-600 dark:text-green-400" />
              <p className="text-[11px] md:text-xs font-bold text-foreground">
                Wins
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <Home className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    Home
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-green-600 dark:text-green-400">
                  {statistics.biggest.wins.home}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <Plane className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    Away
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-green-600 dark:text-green-400">
                  {statistics.biggest.wins.away}
                </span>
              </div>
            </div>
          </div>

          {/* Losses */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
              <TrendingDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-red-600 dark:text-red-400" />
              <p className="text-[11px] md:text-xs font-bold text-foreground">
                Losses
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <Home className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    Home
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-red-600 dark:text-red-400">
                  {statistics.biggest.loses.home}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <Plane className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    Away
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-red-600 dark:text-red-400">
                  {statistics.biggest.loses.away}
                </span>
              </div>
            </div>
          </div>

          {/* Streaks */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
              <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-600 dark:text-blue-400" />
              <p className="text-[11px] md:text-xs font-bold text-foreground">
                Streaks
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Wins
                </span>
                <span className="text-[11px] md:text-xs font-bold text-green-600 dark:text-green-400">
                  {statistics.biggest.streak.wins}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Draws
                </span>
                <span className="text-[11px] md:text-xs font-bold text-yellow-600 dark:text-yellow-400">
                  {statistics.biggest.streak.draws}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  Losses
                </span>
                <span className="text-[11px] md:text-xs font-bold text-red-600 dark:text-red-400">
                  {statistics.biggest.streak.loses}
                </span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 pb-2 border-b border-border/50">
              <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-purple-600 dark:text-purple-400" />
              <p className="text-[11px] md:text-xs font-bold text-foreground">
                Goals
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    For (H)
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-green-600 dark:text-green-400">
                  {statistics.biggest.goals.for.home}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    For (A)
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-green-600 dark:text-green-400">
                  {statistics.biggest.goals.for.away}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    Against (H)
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-red-600 dark:text-red-400">
                  {statistics.biggest.goals.against.home}
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-md bg-muted/40">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-2.5 h-2.5 text-muted-foreground" />
                  <span className="text-[11px] md:text-xs text-muted-foreground">
                    Against (A)
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold text-red-600 dark:text-red-400">
                  {statistics.biggest.goals.against.away}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards by Minute */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2.5">
            <div className="p-1 bg-yellow-500/10 rounded-md">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Yellow Cards by Minute
            </h2>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.cards.yellow).map(
              ([minute, stat]) =>
                stat.total !== null && (
                  <div key={minute} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-medium text-foreground">
                        {minute}&apos;
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs font-bold text-yellow-600 dark:text-yellow-400">
                          {stat.total}
                        </span>
                        {stat.percentage && (
                          <span className="text-[9px] md:text-[10px] text-muted-foreground w-8 text-right">
                            {stat.percentage}
                          </span>
                        )}
                      </div>
                    </div>
                    {stat.percentage && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bar-yellow rounded-full transition-all duration-500"
                          style={{
                            width: stat.percentage,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2.5">
            <div className="p-1 bg-red-500/10 rounded-md">
              <Zap className="w-3 h-3 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Red Cards by Minute
            </h2>
          </div>
          <div className="space-y-2">
            {Object.entries(statistics.cards.red).map(
              ([minute, stat]) =>
                stat.total !== null && (
                  <div key={minute} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-medium text-foreground">
                        {minute}&apos;
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs font-bold text-red-600 dark:text-red-400">
                          {stat.total}
                        </span>
                        {stat.percentage && (
                          <span className="text-[9px] md:text-[10px] text-muted-foreground w-8 text-right">
                            {stat.percentage}
                          </span>
                        )}
                      </div>
                    </div>
                    {stat.percentage && (
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bar-red rounded-full transition-all duration-500"
                          style={{
                            width: stat.percentage,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      </div>

      {/* Lineups */}
      {statistics.lineups.length > 0 && (
        <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
          <div className="flex items-center gap-1 mb-2">
            <div className="p-1 bg-primary/10 rounded-md">
              <Activity className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </div>
            <h2 className="text-xs md:text-base font-bold text-foreground">
              Formations
            </h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-1.5 md:gap-2">
            {statistics.lineups.map((lineup, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-muted/60 to-muted/40 rounded-md md:rounded-lg p-1.5 md:p-2 text-center border border-border/50"
              >
                <p className="text-[10px] md:text-sm font-bold text-foreground mb-0.5">
                  {lineup.formation}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {lineup.played} {lineup.played === 1 ? "game" : "games"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Penalties */}
      <div className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
        <div className="flex items-center gap-1 mb-3">
          <div className="p-1 bg-primary/10 rounded-md">
            <Target className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          </div>
          <h2 className="text-xs md:text-base font-bold text-foreground">
            Penalties
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="text-center p-2.5 md:p-3 bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-lg md:rounded-xl border border-green-500/20">
            <p className="text-[9px] md:text-xs font-semibold text-muted-foreground mb-1">
              Scored
            </p>
            <p className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
              {statistics.penalty.scored.total}
            </p>
            <p className="text-[9px] md:text-[10px] text-muted-foreground mb-2">
              {statistics.penalty.scored.percentage}
            </p>
            {statistics.penalty.total > 0 && (
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-bar-green rounded-full transition-all duration-500"
                  style={{
                    width: statistics.penalty.scored.percentage,
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-center p-2.5 md:p-3 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg md:rounded-xl border border-red-500/20">
            <p className="text-[9px] md:text-xs font-semibold text-muted-foreground mb-1">
              Missed
            </p>
            <p className="text-lg md:text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
              {statistics.penalty.missed.total}
            </p>
            <p className="text-[9px] md:text-[10px] text-muted-foreground mb-2">
              {statistics.penalty.missed.percentage}
            </p>
            {statistics.penalty.total > 0 && (
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-bar-red rounded-full transition-all duration-500"
                  style={{
                    width: statistics.penalty.missed.percentage,
                  }}
                />
              </div>
            )}
          </div>
          <div className="text-center p-2.5 md:p-3 bg-gradient-to-br from-muted/60 to-muted/40 rounded-lg md:rounded-xl border border-border/50">
            <p className="text-[9px] md:text-xs font-semibold text-muted-foreground mb-1">
              Total
            </p>
            <p className="text-lg md:text-2xl font-bold text-foreground mb-1">
              {statistics.penalty.total}
            </p>
            <div className="h-2"></div>
            <div className="mt-3 space-y-1">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                {statistics.penalty.total > 0 && (
                  <>
                    <div
                      className="h-full bg-bar-green transition-all duration-500"
                      style={{
                        width: `${
                          (statistics.penalty.scored.total /
                            statistics.penalty.total) *
                          100
                        }%`,
                      }}
                    />
                    <div
                      className="h-full bg-bar-red transition-all duration-500"
                      style={{
                        width: `${
                          (statistics.penalty.missed.total /
                            statistics.penalty.total) *
                          100
                        }%`,
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
