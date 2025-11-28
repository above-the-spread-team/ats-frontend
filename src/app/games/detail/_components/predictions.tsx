"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PredictionsApiResponse } from "@/type/predictions";
import { Skeleton } from "@/components/ui/skeleton";
import NoDate from "@/components/common/no-date";
import FullPage from "@/components/common/full-page";
import {
  Trophy,
  Target,
  BarChart3,
  Percent,
  Activity,
  Swords,
} from "lucide-react";

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

function parsePercentage(value: string): number {
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface PredictionsProps {
  fixtureId: number;
}

export default function Predictions({ fixtureId }: PredictionsProps) {
  const [predictionsData, setPredictionsData] =
    useState<PredictionsApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPredictions = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          fixture: fixtureId.toString(),
        });

        const response = await fetch(`/api/predictions?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load predictions (${response.status})`);
        }

        const data = (await response.json()) as PredictionsApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        setPredictionsData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setPredictionsData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPredictions();

    return () => {
      controller.abort();
    };
  }, [fixtureId]);

  // Trigger animation after data is loaded
  useEffect(() => {
    if (!isLoading && predictionsData?.response) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setShouldAnimate(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShouldAnimate(false);
    }
  }, [isLoading, predictionsData]);

  if (isLoading) {
    return (
      <div className="space-y-3 md:space-y-4">
        {/* Match Prediction Section Skeleton */}
        <div>
          <div className="flex items-center gap-2 justify-center">
            <Skeleton className="w-4 h-4 md:w-5 md:h-5" />
            <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
          </div>
          <div className="flex items-center justify-end gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 md:h-4 w-28 md:w-36" />
              <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
            </div>
            <Skeleton className="h-5 w-20 md:w-24 rounded-xl" />
          </div>
        </div>

        {/* Win Probability Section Skeleton */}
        <div className="space-y-3 border-b border-border pb-4 md:pb-6">
          <div className="flex items-center gap-2 justify-start pl-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 md:h-5 w-28 md:w-36" />
          </div>
          <div className="bg-card rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
            {/* Win Probability Bars */}
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="text-center space-y-2">
                  <Skeleton className="h-3 w-12 mx-auto" />
                  <Skeleton className="h-4 md:h-5 w-16 mx-auto" />
                  <Skeleton className="w-full h-2 rounded-full" />
                </div>
              ))}
            </div>

            {/* Under/Over, Expected Goals, Recommendation */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-4 md:h-5 w-12" />
              </div>
              <div>
                <Skeleton className="h-3 w-24 mb-1" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 md:h-5 w-8" />
                  <Skeleton className="h-4 w-2" />
                  <Skeleton className="h-4 md:h-5 w-8" />
                </div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-start gap-2">
                  <Skeleton className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-24 mb-1" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Comparison Section Skeleton */}
        <div className="space-y-3 border-b border-border pb-4 md:pb-6">
          <div className="flex items-center gap-2 justify-start pl-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
          </div>
          <div className="space-y-6 md:space-y-8 max-w-xl px-4 mx-auto">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                {/* Team info and values */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="w-5 h-5 rounded-full" />
                  </div>
                </div>
                {/* Combined bar */}
                <Skeleton className="w-full h-2 md:h-2.5 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Team Statistics Section Skeleton */}
        <div className="space-y-3 border-b border-border pb-4 md:pb-6">
          <div className="flex items-center gap-2 justify-start pl-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 md:h-5 w-28 md:w-36" />
          </div>
          <div className="bg-card border-2 border-border rounded-xl p-3 md:p-4 space-y-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Home Team Skeleton */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 pb-3 border-b border-border">
                  <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
                  <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                </div>

                {/* Last 5 Matches */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* League Stats */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <Skeleton className="h-3 w-20" />
                  <div className="space-y-1.5">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Away Team Skeleton */}
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 pb-3 border-b border-border">
                  <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
                  <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                </div>

                {/* Last 5 Matches */}
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* League Stats */}
                <div className="space-y-2 pt-3 border-t border-border">
                  <Skeleton className="h-3 w-20" />
                  <div className="space-y-1.5">
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Head-to-Head History Section Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 justify-start pl-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 md:h-5 w-40 md:w-48" />
          </div>
          <div className="max-w-xl mx-auto">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0" />
                  <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                </div>
                <div className="flex flex-col gap-2 items-center justify-center">
                  <div className="flex items-center justify-center gap-4">
                    <Skeleton className="h-3 md:h-4 w-6" />
                    <Skeleton className="h-6 w-[2px]" />
                    <Skeleton className="h-3 md:h-4 w-6" />
                  </div>
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <Skeleton className="h-3 md:h-4 w-24 md:w-32 ml-auto" />
                  <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !predictionsData || !predictionsData.response) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message={error || "No predictions data available"}
          helpText="Predictions are usually available before the match starts or up to 20 minutes before kickoff."
        />
      </FullPage>
    );
  }

  const prediction = predictionsData.response[0];
  if (!prediction) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message="No predictions available for this fixture."
          helpText="Predictions are usually available before the match starts or up to 20 minutes before kickoff."
        />
      </FullPage>
    );
  }

  const { predictions, teams, comparison, h2h } = prediction;
  const homePercent = parsePercentage(predictions.percent.home);
  const drawPercent = parsePercentage(predictions.percent.draw);
  const awayPercent = parsePercentage(predictions.percent.away);

  return (
    <div className="space-y-3 md:space-y-4">
      <div>
        <div className="flex items-center gap-2 justify-center ">
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-bar-yellow" />
          <h3 className="text-base md:text-lg font-bold">Match Prediction</h3>
        </div>
        {/* Winner Prediction */}
        <div className="flex items-center justify-end gap-4 ">
          <div className="flex items-center gap-2">
            <p className="text-xs md:text-sm font-semibold text-primary-font">
              Predicted Winner :
            </p>
            <div className="flex items-center gap-2">
              {teams.home.id === predictions.winner.id ? (
                teams.home.logo ? (
                  <Image
                    src={teams.home.logo}
                    alt={teams.home.name}
                    width={48}
                    height={48}
                    className="w-5 h-5 md:w-6 md:h-6 object-contain"
                  />
                ) : (
                  <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                    {getInitials(teams.home.name)}
                  </div>
                )
              ) : teams.away.logo ? (
                <Image
                  src={teams.away.logo}
                  alt={teams.away.name}
                  width={48}
                  height={48}
                  className="w-5 h-5 md:w-6 md:h-6 object-contain"
                />
              ) : (
                <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                  {getInitials(teams.away.name)}
                </div>
              )}
            </div>
          </div>
          {predictions.win_or_draw && (
            <span className="text-xs bg-primary-font/20 text-primary-font px-2 py-1 rounded-xl font-medium">
              Win or Draw
            </span>
          )}
        </div>
      </div>
      {/* Win probability */}
      <div className="space-y-3 border-b border-border pb-4  md:pb-6">
        <div className="flex items-center gap-2 justify-start pl-2">
          <Percent className="w-4 h-4 text-primary-font" />
          <h3 className="text-sm md:text-base font-bold">Win Probability</h3>
        </div>
        {/* Main Prediction Section */}
        <div className="bg-card rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
          {/* Win Probability */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Home</p>
              <p className="text-sm md:text-base font-bold">
                {predictions.percent.home}
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-bar-green rounded-full transition-all duration-700"
                  style={{ width: shouldAnimate ? `${homePercent}%` : "0%" }}
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Draw</p>
              <p className="text-sm md:text-base font-bold">
                {predictions.percent.draw}
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-bar-yellow rounded-full transition-all duration-700"
                  style={{ width: shouldAnimate ? `${drawPercent}%` : "0%" }}
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-xs text-muted-foreground">Away</p>
              <p className="text-sm md:text-base font-bold">
                {predictions.percent.away}
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-bar-red rounded-full transition-all duration-700"
                  style={{ width: shouldAnimate ? `${awayPercent}%` : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Goals & Advice */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Under/Over</p>
              {predictions.under_over ? (
                <p className="text-sm md:text-base font-bold">
                  {predictions.under_over}
                </p>
              ) : (
                <p className="text-sm md:text-base font-bold">-</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Expected Goals
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-bold text-green-600">
                  {predictions.goals.home}
                </span>
                <span className="text-muted-foreground font-bold">~</span>
                <span className="text-sm md:text-base font-bold text-red-600">
                  {predictions.goals.away}
                </span>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-start gap-2">
                <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Recommendation
                  </p>
                  <p className="text-xs  font-medium text-foreground leading-relaxed">
                    {predictions.advice}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Statistics */}
      <div className="space-y-3 border-b border-border pb-4 md:pb-6">
        <div className="flex items-center gap-2 justify-start pl-2">
          <BarChart3 className="w-4 h-4 text-primary-font" />
          <h3 className="text-sm md:text-base font-bold">Team Comparison</h3>
        </div>
        <div className=" space-y-6 md:space-y-8 max-w-xl px-4 mx-auto">
          {Object.entries(comparison).map(([key, value]) => {
            if (typeof value !== "object" || !("home" in value)) return null;
            const homeVal = parsePercentage(value.home);
            const awayVal = parsePercentage(value.away);
            const totalVal = homeVal + awayVal || 1; // Avoid division by zero
            const homePercent = (homeVal / totalVal) * 100;
            const awayPercent = (awayVal / totalVal) * 100;

            return (
              <div key={key} className="space-y-2">
                {/* Team info and values */}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {teams.home.logo ? (
                      <Image
                        src={teams.home.logo}
                        alt={teams.home.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                        {getInitials(teams.home.name)}
                      </div>
                    )}

                    <span className="text-xs font-bold">{value.home}</span>
                  </div>
                  <span className="text-xs md:text-sm text-center  text-primary-font font-bold capitalize block ">
                    {key.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{value.away}</span>
                    {teams.away.logo ? (
                      <Image
                        src={teams.away.logo}
                        alt={teams.away.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                        {getInitials(teams.away.name)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Combined bar */}
                <div className="w-full h-2 md:h-2.5 bg-muted rounded-full overflow-hidden flex">
                  {homePercent > 0 && (
                    <div
                      className="h-full bg-bar-green transition-all duration-700"
                      style={{
                        width: shouldAnimate ? `${homePercent}%` : "0%",
                      }}
                    />
                  )}
                  {awayPercent > 0 && (
                    <div
                      className="h-full bg-bar-red transition-all duration-700"
                      style={{
                        width: shouldAnimate ? `${awayPercent}%` : "0%",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Statistics */}
      <div className="space-y-3 border-b border-border pb-4 md:pb-6">
        <div className="flex items-center gap-2 justify-start pl-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm md:text-base font-bold">Team Statistics</h3>
        </div>
        <div className="bg-card border-2 border-border rounded-xl p-3 md:p-4 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Home Team */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 pb-3 border-b border-border">
                {teams.home.logo ? (
                  <Image
                    src={teams.home.logo}
                    alt={teams.home.name}
                    width={32}
                    height={32}
                    className="w-5 h-5 md:w-6 md:h-6 object-contain"
                  />
                ) : (
                  <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                    {getInitials(teams.home.name)}
                  </div>
                )}
                <h4 className="text-xs md:text-sm font-bold">
                  {teams.home.name}
                </h4>
              </div>

              {/* Last 5 */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-muted-foreground">
                  Last 5 Matches
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Form</span>
                    <span className="font-bold">{teams.home.last_5.form}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attack</span>
                    <span className="font-bold">{teams.home.last_5.att}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Defense</span>
                    <span className="font-bold">{teams.home.last_5.def}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Goals</span>
                    <span className="font-bold">
                      {teams.home.last_5.goals.for.total} /{" "}
                      {teams.home.last_5.goals.against.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* League Stats */}
              <div className="space-y-2 pt-3 border-t border-border">
                <h5 className="text-xs font-semibold text-muted-foreground">
                  League Form
                </h5>
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Record</span>
                    <span className="font-bold">
                      {teams.home.league.fixtures.wins.total}W -{" "}
                      {teams.home.league.fixtures.draws.total}D -{" "}
                      {teams.home.league.fixtures.loses.total}L
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Goals</span>
                    <span className="font-bold">
                      {teams.home.league.goals.for.total.total} /{" "}
                      {teams.home.league.goals.against.total.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average</span>
                    <span className="font-bold">
                      {teams.home.league.goals.for.average.total} /{" "}
                      {teams.home.league.goals.against.average.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Away Team */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3 pb-3 border-b border-border">
                {teams.away.logo ? (
                  <Image
                    src={teams.away.logo}
                    alt={teams.away.name}
                    width={32}
                    height={32}
                    className="w-5 h-5 md:w-6 md:h-6 object-contain"
                  />
                ) : (
                  <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
                    {getInitials(teams.away.name)}
                  </div>
                )}
                <h4 className="text-xs md:text-sm font-bold">
                  {teams.away.name}
                </h4>
              </div>

              {/* Last 5 */}
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-muted-foreground">
                  Last 5 Matches
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Form</span>
                    <span className="font-bold">{teams.away.last_5.form}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Attack</span>
                    <span className="font-bold">{teams.away.last_5.att}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Defense</span>
                    <span className="font-bold">{teams.away.last_5.def}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Goals</span>
                    <span className="font-bold">
                      {teams.away.last_5.goals.for.total} /{" "}
                      {teams.away.last_5.goals.against.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* League Stats */}
              <div className="space-y-2 pt-3 border-t border-border">
                <h5 className="text-xs font-semibold text-muted-foreground">
                  League Form
                </h5>
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Record</span>
                    <span className="font-bold">
                      {teams.away.league.fixtures.wins.total}W -{" "}
                      {teams.away.league.fixtures.draws.total}D -{" "}
                      {teams.away.league.fixtures.loses.total}L
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Goals</span>
                    <span className="font-bold">
                      {teams.away.league.goals.for.total.total} /{" "}
                      {teams.away.league.goals.against.total.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Average</span>
                    <span className="font-bold">
                      {teams.away.league.goals.for.average.total} /{" "}
                      {teams.away.league.goals.against.average.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head History */}
      {h2h && h2h.length > 0 && (
        <div className="space-y-3 ">
          <div className="flex items-center gap-2 justify-start pl-2">
            <Swords className="w-4 h-4 text-primary-font" />
            <h3 className="text-sm md:text-base font-bold">
              Last {h2h.length} games history
            </h3>
          </div>
          <div className=" max-w-xl mx-auto">
            {h2h.slice(0, 10).map((match) => (
              <div
                key={match.fixture.id}
                className="flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {match.teams.home.logo ? (
                    <Image
                      src={match.teams.home.logo}
                      alt={match.teams.home.name}
                      width={28}
                      height={28}
                      className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                      {getInitials(match.teams.home.name)}
                    </div>
                  )}
                  <span className="text-[11px] md:text-xs font-semibold truncate">
                    {match.teams.home.name}
                  </span>
                </div>
                <div className="flex flex-col gap-2 items-center justify-center">
                  <div className="flex items-center justify-center gap-4">
                    <span
                      className={`text-xs md:text-sm font-bold text-foreground`}
                    >
                      {match.goals.home}
                    </span>
                    <span className="h-6 w-[2px] bg-primary-font/50" />
                    <span
                      className={`text-xs md:text-sm font-bold text-foreground`}
                    >
                      {match.goals.away}
                    </span>
                  </div>
                  <div className=" text-[11px] md:text-xs text-muted-foreground ">
                    {formatDate(match.fixture.date)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-[11px] md:text-xs font-semibold truncate text-right">
                    {match.teams.away.name}
                  </span>
                  {match.teams.away.logo ? (
                    <Image
                      src={match.teams.away.logo}
                      alt={match.teams.away.name}
                      width={28}
                      height={28}
                      className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                      {getInitials(match.teams.away.name)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
