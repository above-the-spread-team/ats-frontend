"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeadToHeadApiResponse } from "@/type/headtohead";
import { getFixtureStatus } from "@/data/fixture-status";
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

function formatGoals(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "–";
  }
  return value.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface HeadtoHeadProps {
  homeTeamId: number;
  awayTeamId: number;
}

export default function HeadtoHead({
  homeTeamId,
  awayTeamId,
}: HeadtoHeadProps) {
  const [headToHeadData, setHeadToHeadData] =
    useState<HeadToHeadApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchHeadToHead = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          h2h: `${homeTeamId}-${awayTeamId}`,
          last: "10",
        });

        const response = await fetch(`/api/headtohead?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load head-to-head data (${response.status})`
          );
        }

        const data = (await response.json()) as HeadToHeadApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        setHeadToHeadData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setHeadToHeadData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchHeadToHead();

    return () => {
      controller.abort();
    };
  }, [homeTeamId, awayTeamId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error || !headToHeadData || !headToHeadData.response) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No head-to-head data available"}
        </p>
      </div>
    );
  }

  const matches = headToHeadData.response;

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No head-to-head matches found.</p>
      </div>
    );
  }

  // Extract team names from the first match
  const firstMatch = matches[0];
  const homeTeam = firstMatch.teams.home;
  const awayTeam = firstMatch.teams.away;

  // Calculate statistics
  const homeWins = matches.filter(
    (match) => match.teams.home.winner === true
  ).length;
  const awayWins = matches.filter(
    (match) => match.teams.away.winner === true
  ).length;
  const draws = matches.filter(
    (match) =>
      match.teams.home.winner === false && match.teams.away.winner === false
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold">Head to Head</h2>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {homeTeam.logo ? (
              <Image
                src={homeTeam.logo}
                alt={homeTeam.name}
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                {getInitials(homeTeam.name)}
              </div>
            )}
            <span className="text-sm md:text-base font-semibold">
              {homeTeam.name}
            </span>
          </div>
          <span className="text-muted-foreground">vs</span>
          <div className="flex items-center gap-2">
            {awayTeam.logo ? (
              <Image
                src={awayTeam.logo}
                alt={awayTeam.name}
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                {getInitials(awayTeam.name)}
              </div>
            )}
            <span className="text-sm md:text-base font-semibold">
              {awayTeam.name}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="text-center p-4 bg-card rounded-lg border border-border">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            {homeTeam.name}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-primary">
            {homeWins}
          </p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border border-border">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Draws</p>
          <p className="text-2xl md:text-3xl font-bold">{draws}</p>
        </div>
        <div className="text-center p-4 bg-card rounded-lg border border-border">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">
            {awayTeam.name}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-primary">
            {awayWins}
          </p>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        <h3 className="text-lg md:text-xl font-semibold">
          Recent Matches ({headToHeadData.results})
        </h3>
        <div className="space-y-2">
          {matches.map((match) => {
            const statusInfo = getFixtureStatus(match.fixture.status.short);
            const isFinished = statusInfo.type === "Finished";
            const isInPlay = statusInfo.type === "In Play";
            const hasStarted = isInPlay || isFinished;
            const matchDate = formatDate(match.fixture.date);

            return (
              <div
                key={match.fixture.id}
                className={`relative flex flex-col items-center rounded-sm ${
                  isInPlay
                    ? ""
                    : `border-l-[6px] ${
                        isFinished
                          ? "border-primary/80"
                          : "border-mygray dark:border-mygray/50"
                      }`
                } bg-card py-3 px-4 overflow-hidden`}
              >
                {isInPlay && (
                  <>
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-[6px] animate-pulse bg-gradient-to-b from-primary via-primary/80 to-primary/30"></span>
                    <span
                      className="pointer-events-none absolute inset-y-0 left-0 w-[6px] bg-primary/50 blur-sm opacity-70 animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></span>
                  </>
                )}
                <div className="w-full grid grid-cols-7 gap-2">
                  {/* Home Team */}
                  <div className="col-span-3 flex items-center gap-2 flex-col-reverse md:flex-row md:justify-end md:text-right">
                    <p className="text-xs md:text-sm font-medium truncate w-full text-center md:text-right">
                      {match.teams.home.name}
                    </p>
                    {match.teams.home.logo ? (
                      <Image
                        src={match.teams.home.logo}
                        alt={match.teams.home.name}
                        width={28}
                        height={28}
                        className="w-6 h-6 md:w-7 md:h-7 object-contain flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                        {getInitials(match.teams.home.name)}
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                    {hasStarted ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-base md:text-lg font-bold">
                          {formatGoals(match.goals.home)}
                        </span>
                        <span className="h-4 w-[2px] bg-primary/50" />
                        <span className="text-base md:text-lg font-bold">
                          {formatGoals(match.goals.away)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs md:text-sm font-medium">
                          {new Date(match.fixture.date).toLocaleTimeString(
                            undefined,
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col items-center gap-0.5">
                      <p className="text-[10px] text-muted-foreground">
                        {matchDate}
                      </p>
                      {statusInfo.type !== "Scheduled" && (
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {statusInfo.short}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="col-span-3 flex items-center gap-2 flex-col md:flex-row md:justify-start md:text-left">
                    {match.teams.away.logo ? (
                      <Image
                        src={match.teams.away.logo}
                        alt={match.teams.away.name}
                        width={28}
                        height={28}
                        className="w-6 h-6 md:w-7 md:h-7 object-contain flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                        {getInitials(match.teams.away.name)}
                      </div>
                    )}
                    <p className="text-xs md:text-sm font-medium truncate w-full text-center md:text-left">
                      {match.teams.away.name}
                    </p>
                  </div>
                </div>

                {/* League Info */}
                {match.league && (
                  <div className="w-full mt-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-center gap-2">
                      {match.league.logo && (
                        <Image
                          src={match.league.logo}
                          alt={match.league.name}
                          width={16}
                          height={16}
                          className="w-4 h-4 object-contain"
                        />
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {match.league.name} • {match.league.season}
                        {match.league.round && ` • ${match.league.round}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
