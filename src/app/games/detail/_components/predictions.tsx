"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { PredictionsApiResponse } from "@/type/predictions";
import Loading from "@/components/common/loading";
import { Trophy, TrendingUp, Target, BarChart3 } from "lucide-react";

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

function formatValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "–";
  }
  if (typeof value === "string") {
    return value;
  }
  return value.toString();
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error || !predictionsData || !predictionsData.response) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No predictions data available"}
        </p>
      </div>
    );
  }

  const prediction = predictionsData.response[0];
  if (!prediction) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No predictions available for this fixture.
        </p>
      </div>
    );
  }

  const { predictions, teams, comparison, h2h } = prediction;
  const homePercent = parsePercentage(predictions.percent.home);
  const drawPercent = parsePercentage(predictions.percent.draw);
  const awayPercent = parsePercentage(predictions.percent.away);

  return (
    <div className="space-y-6">
      {/* Main Prediction */}
      <div className="bg-gradient-to-br from-card to-card/95 border border-border rounded-lg p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg md:text-xl font-bold">Prediction</h3>
        </div>

        {/* Winner Prediction */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm md:text-base font-semibold text-muted-foreground">
              Predicted Winner
            </span>
            <span className="text-xs md:text-sm text-muted-foreground">
              {predictions.winner.comment}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {teams.home.id === predictions.winner.id ? (
              teams.home.logo ? (
                <Image
                  src={teams.home.logo}
                  alt={teams.home.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/40 text-xs font-semibold uppercase text-muted-foreground">
                  {getInitials(teams.home.name)}
                </div>
              )
            ) : teams.away.logo ? (
              <Image
                src={teams.away.logo}
                alt={teams.away.name}
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/40 text-xs font-semibold uppercase text-muted-foreground">
                {getInitials(teams.away.name)}
              </div>
            )}
            <div>
              <p className="text-base md:text-lg font-bold">
                {predictions.winner.name}
              </p>
              {predictions.win_or_draw && (
                <p className="text-xs md:text-sm text-muted-foreground">
                  Win or Draw
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Win Probability */}
        <div className="space-y-2">
          <h4 className="text-sm md:text-base font-semibold">
            Win Probability
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-card rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Home</p>
              <p className="text-lg md:text-xl font-bold text-primary">
                {predictions.percent.home}
              </p>
              <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-bar-green transition-all duration-500"
                  style={{ width: `${homePercent}%` }}
                />
              </div>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Draw</p>
              <p className="text-lg md:text-xl font-bold">
                {predictions.percent.draw}
              </p>
              <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-muted-foreground/50 transition-all duration-500"
                  style={{ width: `${drawPercent}%` }}
                />
              </div>
            </div>
            <div className="text-center p-3 bg-card rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Away</p>
              <p className="text-lg md:text-xl font-bold text-primary">
                {predictions.percent.away}
              </p>
              <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-bar-red transition-all duration-500"
                  style={{ width: `${awayPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">
                Recommendation
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">
                {predictions.advice}
              </p>
            </div>
          </div>
        </div>

        {/* Goals Prediction */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Under/Over</p>
            <p className="text-base md:text-lg font-bold">
              {predictions.under_over}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Goals</p>
            <p className="text-base md:text-lg font-bold">
              H: {predictions.goals.home} / A: {predictions.goals.away}
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Statistics */}
      <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg md:text-xl font-bold">Comparison</h3>
        </div>

        <div className="space-y-3">
          {Object.entries(comparison).map(([key, value]) => {
            if (typeof value !== "object" || !("home" in value)) return null;
            const homeVal = parsePercentage(value.home);
            const awayVal = parsePercentage(value.away);

            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {teams.home.name}
                      </span>
                      <span className="text-xs font-bold">{value.home}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bar-green transition-all duration-500"
                        style={{ width: `${homeVal}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {teams.away.name}
                      </span>
                      <span className="text-xs font-bold">{value.away}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-bar-red transition-all duration-500"
                        style={{ width: `${awayVal}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Home Team */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            {teams.home.logo ? (
              <Image
                src={teams.home.logo}
                alt={teams.home.name}
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                {getInitials(teams.home.name)}
              </div>
            )}
            <h3 className="text-base md:text-lg font-bold">
              {teams.home.name}
            </h3>
          </div>

          {/* Last 5 */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold mb-2">
              Last 5 Matches
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Form: </span>
                <span className="font-semibold">{teams.home.last_5.form}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Attack: </span>
                <span className="font-semibold">{teams.home.last_5.att}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Defense: </span>
                <span className="font-semibold">{teams.home.last_5.def}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Goals: </span>
                <span className="font-semibold">
                  {teams.home.last_5.goals.for.total} /{" "}
                  {teams.home.last_5.goals.against.total}
                </span>
              </div>
            </div>
          </div>

          {/* League Stats */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold mb-2">
              League Form
            </h4>
            <div className="text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Record: </span>
                <span className="font-semibold">
                  {teams.home.league.fixtures.wins.total}W -{" "}
                  {teams.home.league.fixtures.draws.total}D -{" "}
                  {teams.home.league.fixtures.loses.total}L
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Goals: </span>
                <span className="font-semibold">
                  {teams.home.league.goals.for.total.total} /{" "}
                  {teams.home.league.goals.against.total.total}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg: </span>
                <span className="font-semibold">
                  {teams.home.league.goals.for.average.total} /{" "}
                  {teams.home.league.goals.against.average.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            {teams.away.logo ? (
              <Image
                src={teams.away.logo}
                alt={teams.away.name}
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8 object-contain"
              />
            ) : (
              <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                {getInitials(teams.away.name)}
              </div>
            )}
            <h3 className="text-base md:text-lg font-bold">
              {teams.away.name}
            </h3>
          </div>

          {/* Last 5 */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold mb-2">
              Last 5 Matches
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Form: </span>
                <span className="font-semibold">{teams.away.last_5.form}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Attack: </span>
                <span className="font-semibold">{teams.away.last_5.att}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Defense: </span>
                <span className="font-semibold">{teams.away.last_5.def}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Goals: </span>
                <span className="font-semibold">
                  {teams.away.last_5.goals.for.total} /{" "}
                  {teams.away.last_5.goals.against.total}
                </span>
              </div>
            </div>
          </div>

          {/* League Stats */}
          <div>
            <h4 className="text-xs md:text-sm font-semibold mb-2">
              League Form
            </h4>
            <div className="text-xs space-y-1">
              <div>
                <span className="text-muted-foreground">Record: </span>
                <span className="font-semibold">
                  {teams.away.league.fixtures.wins.total}W -{" "}
                  {teams.away.league.fixtures.draws.total}D -{" "}
                  {teams.away.league.fixtures.loses.total}L
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Goals: </span>
                <span className="font-semibold">
                  {teams.away.league.goals.for.total.total} /{" "}
                  {teams.away.league.goals.against.total.total}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg: </span>
                <span className="font-semibold">
                  {teams.away.league.goals.for.average.total} /{" "}
                  {teams.away.league.goals.against.average.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Head-to-Head History */}
      {h2h && h2h.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg md:text-xl font-bold">Head-to-Head</h3>
          </div>

          <div className="space-y-2">
            {h2h.slice(0, 10).map((match) => (
              <div
                key={match.fixture.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {match.teams.home.logo ? (
                    <Image
                      src={match.teams.home.logo}
                      alt={match.teams.home.name}
                      width={24}
                      height={24}
                      className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                      {getInitials(match.teams.home.name)}
                    </div>
                  )}
                  <span className="text-xs md:text-sm font-medium truncate">
                    {match.teams.home.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mx-2">
                  <span className="text-xs md:text-sm font-bold">
                    {match.goals.home}
                  </span>
                  <span className="text-xs text-muted-foreground">-</span>
                  <span className="text-xs md:text-sm font-bold">
                    {match.goals.away}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                  <span className="text-xs md:text-sm font-medium truncate text-right">
                    {match.teams.away.name}
                  </span>
                  {match.teams.away.logo ? (
                    <Image
                      src={match.teams.away.logo}
                      alt={match.teams.away.name}
                      width={24}
                      height={24}
                      className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                      {getInitials(match.teams.away.name)}
                    </div>
                  )}
                </div>
                <div className="ml-2 text-[10px] text-muted-foreground">
                  {formatDate(match.fixture.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
