"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";
import type { StandingsApiResponse, StandingEntry } from "@/type/standing";

function getFormColor(result: string | null): string {
  if (!result) return "bg-muted text-muted-foreground";
  const char = result.toUpperCase();
  if (char === "W") return "bg-green-500/20 text-green-600 dark:text-green-400";
  if (char === "D")
    return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
  if (char === "L") return "bg-red-500/20 text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

interface StandingsProps {
  leagueId: string;
  season: number;
}

export default function Standings({ leagueId, season }: StandingsProps) {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [leagueInfo, setLeagueInfo] = useState<{
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStandings = async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/standings?league=${leagueId}&season=${season}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load standings (${response.status})`);
        }

        const data = (await response.json()) as StandingsApiResponse;

        if (data.response && data.response.length > 0) {
          const league = data.response[0].league;
          setLeagueInfo({
            name: league.name,
            country: league.country,
            logo: league.logo,
            flag: league.flag,
            season: league.season,
          });

          // Flatten the standings array (it's an array of arrays for groups)
          const allStandings = league.standings.flat();
          setStandings(allStandings);
        } else {
          setStandings([]);
        }

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setStandings([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchStandings();

    return () => {
      controller.abort();
    };
  }, [leagueId, season]);

  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => a.rank - b.rank);
  }, [standings]);

  if (!leagueId) {
    return (
      <FullPage>
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">
            Invalid league ID
          </p>
        </div>
      </FullPage>
    );
  }

  return (
    <div className="space-y-4">
      {isLoading && (
        <FullPage>
          <Loading />
        </FullPage>
      )}

      {!isLoading && error && (
        <FullPage>
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold text-destructive">{error}</p>
          </div>
        </FullPage>
      )}

      {!isLoading && !error && sortedStandings.length === 0 && (
        <FullPage>
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground">
              No standings available for this league and season
            </p>
          </div>
        </FullPage>
      )}

      {!isLoading && !error && sortedStandings.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Desktop Table */}
            <table className="hidden md:table w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                    Pos
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                    Team
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    P
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    W
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    D
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    L
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    GF
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    GA
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    GD
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    Pts
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    Form
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStandings.map((standing) => (
                  <tr
                    key={standing.team.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3 font-semibold text-foreground">
                      {standing.rank}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {standing.team.logo && (
                          <Image
                            src={standing.team.logo}
                            alt={standing.team.name}
                            width={24}
                            height={24}
                            className="object-contain"
                          />
                        )}
                        <span className="font-medium text-foreground">
                          {standing.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-center text-muted-foreground">
                      {standing.all.played}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">
                      {standing.all.win}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">
                      {standing.all.draw}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">
                      {standing.all.lose}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">
                      {standing.all.goals.for}
                    </td>
                    <td className="p-3 text-center text-muted-foreground">
                      {standing.all.goals.against}
                    </td>
                    <td
                      className={`p-3 text-center font-semibold ${
                        standing.goalsDiff > 0
                          ? "text-green-600 dark:text-green-400"
                          : standing.goalsDiff < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {standing.goalsDiff > 0 ? "+" : ""}
                      {standing.goalsDiff}
                    </td>
                    <td className="p-3 text-center font-bold text-foreground">
                      {standing.points}
                    </td>
                    <td className="p-3 text-center">
                      {standing.form && (
                        <div className="flex items-center justify-center gap-0.5">
                          {standing.form.split("").map((result, idx) => (
                            <span
                              key={idx}
                              className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${getFormColor(
                                result
                              )}`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {sortedStandings.map((standing) => (
                <div
                  key={standing.team.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-foreground w-6">
                        {standing.rank}
                      </span>
                      {standing.team.logo && (
                        <Image
                          src={standing.team.logo}
                          alt={standing.team.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      )}
                      <span className="font-semibold text-foreground">
                        {standing.team.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        {standing.points}
                      </div>
                      <div className="text-xs text-muted-foreground">pts</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                    <div className="text-center">
                      <div className="text-muted-foreground">Played</div>
                      <div className="font-semibold text-foreground">
                        {standing.all.played}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">W</div>
                      <div className="font-semibold text-foreground">
                        {standing.all.win}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">D</div>
                      <div className="font-semibold text-foreground">
                        {standing.all.draw}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-muted-foreground">L</div>
                      <div className="font-semibold text-foreground">
                        {standing.all.lose}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-muted-foreground">GD: </span>
                        <span
                          className={`font-semibold ${
                            standing.goalsDiff > 0
                              ? "text-green-600 dark:text-green-400"
                              : standing.goalsDiff < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                          }`}
                        >
                          {standing.goalsDiff > 0 ? "+" : ""}
                          {standing.goalsDiff}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GF: </span>
                        <span className="font-semibold text-foreground">
                          {standing.all.goals.for}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">GA: </span>
                        <span className="font-semibold text-foreground">
                          {standing.all.goals.against}
                        </span>
                      </div>
                    </div>
                    {standing.form && (
                      <div className="flex items-center gap-0.5">
                        {standing.form.split("").map((result, idx) => (
                          <span
                            key={idx}
                            className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${getFormColor(
                              result
                            )}`}
                          >
                            {result}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
