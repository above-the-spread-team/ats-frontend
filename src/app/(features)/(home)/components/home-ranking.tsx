"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { StandingsApiResponse, StandingEntry } from "@/type/standing";

export default function HomeRanking() {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leagueName, setLeagueName] = useState<string>("");

  const leagueId = 2;
  const season = new Date().getFullYear();

  useEffect(() => {
    const controller = new AbortController();

    const fetchStandings = async () => {
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
          setLeagueName(league.name);
          // Flatten the standings array (it's an array of arrays for groups)
          const allStandings = league.standings.flat();
          // Get top 10 teams
          setStandings(allStandings.slice(0, 10));
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

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || standings.length === 0) {
    return (
      <div className="w-full text-center py-4">
        <p className="text-sm text-muted-foreground">
          {error || "No standings available"}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold">{leagueName}</h2>
        <Link
          href={`/stats/${leagueId}?season=${season}`}
          className="text-sm text-primary hover:underline font-semibold"
        >
          View All →
        </Link>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6">Team</div>
          <div className="col-span-2 text-center hidden sm:block">P</div>
          <div className="col-span-3 text-right">Pts</div>
        </div>
        {/* Standings List */}
        <div className="divide-y divide-border">
          {standings.map((standing) => {
            const isTopThree = standing.rank <= 3;
            const rankColor =
              standing.rank === 1
                ? "text-yellow-600 dark:text-yellow-400"
                : standing.rank === 2
                ? "text-gray-500 dark:text-gray-400"
                : standing.rank === 3
                ? "text-orange-600 dark:text-orange-400"
                : "text-muted-foreground";

            return (
              <Link
                key={standing.team.id}
                href={`/stats/${leagueId}/${standing.team.id}?season=${season}`}
                className={`grid grid-cols-12 gap-2 px-3 py-2.5 hover:bg-muted/30 transition-colors group ${
                  isTopThree ? "bg-muted/20" : ""
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center justify-center">
                  <span
                    className={`font-bold text-xs md:text-sm ${rankColor} ${
                      isTopThree ? "text-base md:text-lg" : ""
                    }`}
                  >
                    {standing.rank}
                  </span>
                </div>
                {/* Team */}
                <div className="col-span-6 flex items-center gap-2 min-w-0">
                  {standing.team.logo && (
                    <div className="relative w-6 h-6 md:w-7 md:h-7 flex-shrink-0">
                      <Image
                        src={standing.team.logo}
                        alt={standing.team.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 24px, 28px"
                      />
                    </div>
                  )}
                  <span className="font-semibold text-xs md:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {standing.team.name}
                  </span>
                </div>
                {/* Played */}
                <div className="col-span-2 text-center hidden sm:flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    {standing.all.played}
                  </span>
                </div>
                {/* Points */}
                <div className="col-span-3 flex items-center justify-end gap-1">
                  <span
                    className={`font-bold text-xs md:text-sm ${
                      isTopThree ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {standing.points}
                  </span>
                  <span className="text-xs text-muted-foreground hidden md:inline">
                    pts
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
