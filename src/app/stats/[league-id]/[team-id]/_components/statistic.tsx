"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";
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
      <FullPage>
        <Loading />
      </FullPage>
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
    <div className="space-y-6">
      {/* Form */}
      {statistics.form && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Recent Form
          </h2>
          <div className="flex items-center gap-1 flex-wrap">
            {statistics.form.split("").map((result, idx) => {
              const color =
                result === "W"
                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                  : result === "D"
                  ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                  : "bg-red-500/20 text-red-600 dark:text-red-400";
              return (
                <span
                  key={idx}
                  className={`w-8 h-8 rounded text-xs font-bold flex items-center justify-center ${color}`}
                >
                  {result}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixtures Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {statistics.fixtures.played.total}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Played</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {statistics.fixtures.wins.total}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Wins</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {statistics.fixtures.draws.total}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Draws</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {statistics.fixtures.loses.total}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Losses</p>
        </div>
      </div>

      {/* Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Goals For
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">
                {statistics.goals.for.total.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average</span>
              <span className="font-semibold text-foreground">
                {statistics.goals.for.average.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Home</span>
              <span className="text-foreground">
                {statistics.goals.for.total.home}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Away</span>
              <span className="text-foreground">
                {statistics.goals.for.total.away}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Goals Against
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">
                {statistics.goals.against.total.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average</span>
              <span className="font-semibold text-foreground">
                {statistics.goals.against.average.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Home</span>
              <span className="text-foreground">
                {statistics.goals.against.total.home}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Away</span>
              <span className="text-foreground">
                {statistics.goals.against.total.away}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Sheets & Failed to Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Clean Sheets
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">
                {statistics.clean_sheet.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Home</span>
              <span className="text-foreground">
                {statistics.clean_sheet.home}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Away</span>
              <span className="text-foreground">
                {statistics.clean_sheet.away}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Failed to Score
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-foreground">
                {statistics.failed_to_score.total}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Home</span>
              <span className="text-foreground">
                {statistics.failed_to_score.home}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Away</span>
              <span className="text-foreground">
                {statistics.failed_to_score.away}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Biggest Stats */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">Biggest</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Wins</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-foreground">Home</span>
                <span className="font-semibold">
                  {statistics.biggest.wins.home}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Away</span>
                <span className="font-semibold">
                  {statistics.biggest.wins.away}
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Losses</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-foreground">Home</span>
                <span className="font-semibold">
                  {statistics.biggest.loses.home}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Away</span>
                <span className="font-semibold">
                  {statistics.biggest.loses.away}
                </span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Streaks</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-foreground">Wins</span>
                <span className="font-semibold">
                  {statistics.biggest.streak.wins}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Draws</span>
                <span className="font-semibold">
                  {statistics.biggest.streak.draws}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Losses</span>
                <span className="font-semibold">
                  {statistics.biggest.streak.loses}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lineups */}
      {statistics.lineups.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Formations
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statistics.lineups.map((lineup, idx) => (
              <div key={idx} className="bg-muted/50 rounded p-3 text-center">
                <p className="font-semibold text-foreground">
                  {lineup.formation}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lineup.played} games
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Penalties */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Penalties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Scored</p>
            <p className="text-xl font-bold text-foreground">
              {statistics.penalty.scored.total}
            </p>
            <p className="text-xs text-muted-foreground">
              {statistics.penalty.scored.percentage}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Missed</p>
            <p className="text-xl font-bold text-foreground">
              {statistics.penalty.missed.total}
            </p>
            <p className="text-xs text-muted-foreground">
              {statistics.penalty.missed.percentage}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-foreground">
              {statistics.penalty.total}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
