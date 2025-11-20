"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { FixtureStatisticsApiResponse } from "@/type/fixture-statistics";
import Loading from "@/components/common/loading";

function getInitials(text: string | null | undefined, fallback = "??") {
  if (!text) return fallback;
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatValue(value: number | string | null): string {
  if (value === null || value === undefined) {
    return "–";
  }
  if (typeof value === "string") {
    return value;
  }
  return value.toString();
}

function parsePercentage(value: number | string | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    const match = value.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }
  return value;
}

interface FixtureStatisticsProps {
  fixtureId: number;
  homeTeamId?: number;
  awayTeamId?: number;
}

export default function FixtureStatistics({
  fixtureId,
  homeTeamId,
  awayTeamId,
}: FixtureStatisticsProps) {
  const [statisticsData, setStatisticsData] =
    useState<FixtureStatisticsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStatistics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          fixture: fixtureId.toString(),
        });

        const response = await fetch(
          `/api/fixture-statistics?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load fixture statistics (${response.status})`
          );
        }

        const data = (await response.json()) as FixtureStatisticsApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        setStatisticsData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatisticsData(null);
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
  }, [fixtureId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error || !statisticsData || !statisticsData.response) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No statistics data available"}
        </p>
      </div>
    );
  }

  const teams = statisticsData.response;
  if (teams.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No statistics available for this fixture.
        </p>
      </div>
    );
  }

  // Determine home and away teams
  let homeTeam = teams[0];
  let awayTeam = teams[1] || teams[0];

  // If we have team IDs, try to match them correctly
  if (homeTeamId && awayTeamId && teams.length >= 2) {
    const foundHome = teams.find((team) => team.team.id === homeTeamId);
    const foundAway = teams.find((team) => team.team.id === awayTeamId);
    if (foundHome) homeTeam = foundHome;
    if (foundAway) awayTeam = foundAway;
  } else if (teams.length >= 2) {
    // Fallback: assume first is home, second is away
    homeTeam = teams[0];
    awayTeam = teams[1];
  }

  // Create a map of statistics by type for easy lookup
  const homeStatsMap = new Map(
    homeTeam.statistics.map((stat) => [stat.type, stat.value])
  );
  const awayStatsMap = new Map(
    awayTeam.statistics.map((stat) => [stat.type, stat.value])
  );

  // Get all unique statistic types
  const allStatTypes = Array.from(
    new Set([
      ...homeTeam.statistics.map((s) => s.type),
      ...awayTeam.statistics.map((s) => s.type),
    ])
  );

  // Helper to safely get stat value
  const getStatValue = (
    map: Map<string, number | string | null>,
    key: string
  ): number | string | null => {
    return map.get(key) ?? null;
  };

  // Statistics that should be displayed as percentages with progress bars
  const percentageStats = new Set(["Ball Possession", "Passes %"]);

  // Statistics that are better displayed as comparison bars
  const comparisonStats = new Set([
    "Shots on Goal",
    "Shots off Goal",
    "Total Shots",
    "Blocked Shots",
    "Shots insidebox",
    "Shots outsidebox",
    "Fouls",
    "Corner Kicks",
    "Offsides",
    "Yellow Cards",
    "Red Cards",
    "Goalkeeper Saves",
    "Total passes",
    "Passes accurate",
  ]);

  function renderStatistic(statType: string) {
    const homeValue = getStatValue(homeStatsMap, statType);
    const awayValue = getStatValue(awayStatsMap, statType);

    if (percentageStats.has(statType)) {
      // Display as percentage with progress bars
      const homePercent = parsePercentage(homeValue);
      const awayPercent = parsePercentage(awayValue);

      return (
        <div key={statType} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              {statType}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Home Team */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {homeTeam.team.logo ? (
                    <Image
                      src={homeTeam.team.logo}
                      alt={homeTeam.team.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                      {getInitials(homeTeam.team.name)}
                    </div>
                  )}
                  <span className="text-xs font-medium">
                    {formatValue(homeValue)}
                  </span>
                </div>
              </div>
              {homePercent !== null && (
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bar-green transition-all duration-500"
                    style={{ width: `${homePercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {awayTeam.team.logo ? (
                    <Image
                      src={awayTeam.team.logo}
                      alt={awayTeam.team.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                      {getInitials(awayTeam.team.name)}
                    </div>
                  )}
                  <span className="text-xs font-medium">
                    {formatValue(awayValue)}
                  </span>
                </div>
              </div>
              {awayPercent !== null && (
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bar-red transition-all duration-500"
                    style={{ width: `${awayPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (comparisonStats.has(statType)) {
      // Display as comparison bars
      const homeNum = typeof homeValue === "number" ? homeValue : 0;
      const awayNum = typeof awayValue === "number" ? awayValue : 0;
      const maxValue = Math.max(homeNum, awayNum, 1); // Avoid division by zero
      const homePercent = (homeNum / maxValue) * 100;
      const awayPercent = (awayNum / maxValue) * 100;

      return (
        <div key={statType} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              {statType}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Home Team */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {homeTeam.team.logo ? (
                    <Image
                      src={homeTeam.team.logo}
                      alt={homeTeam.team.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                      {getInitials(homeTeam.team.name)}
                    </div>
                  )}
                  <span className="text-xs font-bold">
                    {formatValue(homeValue)}
                  </span>
                </div>
              </div>
              {homeNum > 0 && (
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bar-green transition-all duration-500"
                    style={{ width: `${homePercent}%` }}
                  />
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {awayTeam.team.logo ? (
                    <Image
                      src={awayTeam.team.logo}
                      alt={awayTeam.team.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                      {getInitials(awayTeam.team.name)}
                    </div>
                  )}
                  <span className="text-xs font-bold">
                    {formatValue(awayValue)}
                  </span>
                </div>
              </div>
              {awayNum > 0 && (
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-bar-red transition-all duration-500"
                    style={{ width: `${awayPercent}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      // Display as simple values
      return (
        <div key={statType} className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            {homeTeam.team.logo ? (
              <Image
                src={homeTeam.team.logo}
                alt={homeTeam.team.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                {getInitials(homeTeam.team.name)}
              </div>
            )}
            <span className="text-xs font-medium">
              {formatValue(homeValue)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {awayTeam.team.logo ? (
              <Image
                src={awayTeam.team.logo}
                alt={awayTeam.team.name}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                {getInitials(awayTeam.team.name)}
              </div>
            )}
            <span className="text-xs font-medium">
              {formatValue(awayValue)}
            </span>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">Match Statistics</h2>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {homeTeam.team.logo ? (
              <Image
                src={homeTeam.team.logo}
                alt={homeTeam.team.name}
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                {getInitials(homeTeam.team.name)}
              </div>
            )}
            <span className="text-sm md:text-base font-semibold">
              {homeTeam.team.name}
            </span>
          </div>
          <span className="text-muted-foreground">vs</span>
          <div className="flex items-center gap-2">
            {awayTeam.team.logo ? (
              <Image
                src={awayTeam.team.logo}
                alt={awayTeam.team.name}
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                {getInitials(awayTeam.team.name)}
              </div>
            )}
            <span className="text-sm md:text-base font-semibold">
              {awayTeam.team.name}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-4">
        {allStatTypes.map((statType) => renderStatistic(statType))}
      </div>
    </div>
  );
}
