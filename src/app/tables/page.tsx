"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import MinHeight from "@/components/common/min-height";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";
import type { LeaguesApiResponse, LeagueResponseItem } from "@/type/league";

export default function Tables() {
  const [leagues, setLeagues] = useState<LeagueResponseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    new Date().getFullYear()
  );

  const currentSeason = useMemo(() => {
    return (
      leagues
        .flatMap((league) => league.seasons)
        .find((season) => season.current)?.year || new Date().getFullYear()
    );
  }, [leagues]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLeagues = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/leagues?season=${selectedSeason}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load leagues (${response.status})`);
        }

        const data = (await response.json()) as LeaguesApiResponse;

        setLeagues(data.response ?? []);
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setLeagues([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeagues();

    return () => {
      controller.abort();
    };
  }, [selectedSeason]);

  const sortedLeagues = useMemo(() => {
    return [...leagues].sort((a, b) => {
      // Sort by country first, then by league name
      const countryCompare = a.country.name.localeCompare(b.country.name);
      if (countryCompare !== 0) return countryCompare;
      return a.league.name.localeCompare(b.league.name);
    });
  }, [leagues]);

  const getCurrentSeasonData = (league: LeagueResponseItem) => {
    return (
      league.seasons.find((s) => s.year === selectedSeason) ||
      league.seasons.find((s) => s.current) ||
      league.seasons[league.seasons.length - 1]
    );
  };

  return (
    <MinHeight>
      <div className="container mx-auto space-y-4 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Leagues & Competitions
          </h1>
          <div className="flex items-center gap-2">
            <label
              htmlFor="season-select"
              className="text-sm font-medium text-muted-foreground"
            >
              Season:
            </label>
            <select
              id="season-select"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = currentSeason - i;
                return (
                  <option key={year} value={year}>
                    {year}/{year + 1}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {isLoading && (
          <FullPage>
            <Loading />
          </FullPage>
        )}

        {!isLoading && error && (
          <FullPage>
            <div className="text-center space-y-4">
              <p className="text-lg font-semibold text-destructive">{error}</p>
              <button
                onClick={() => setSelectedSeason(selectedSeason)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </FullPage>
        )}

        {!isLoading && !error && sortedLeagues.length === 0 && (
          <FullPage>
            <div className="text-center">
              <p className="text-lg font-semibold text-muted-foreground">
                No leagues found for this season
              </p>
            </div>
          </FullPage>
        )}

        {!isLoading && !error && sortedLeagues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedLeagues.map((league) => {
              const seasonData = getCurrentSeasonData(league);
              const hasStandings = seasonData?.coverage.standings ?? false;

              const CardContent = (
                <div
                  className={`bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow ${
                    hasStandings ? "cursor-pointer" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* League Logo */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                      {league.league.logo ? (
                        <Image
                          src={league.league.logo}
                          alt={league.league.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 64px, 80px"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {league.league.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* League Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-base md:text-lg font-bold text-foreground line-clamp-2">
                          {league.league.name}
                        </h3>
                        {league.country.flag && (
                          <div className="relative w-6 h-6 md:w-7 md:h-7 flex-shrink-0">
                            <Image
                              src={league.country.flag}
                              alt={league.country.name}
                              fill
                              className="object-contain"
                              sizes="28px"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{league.country.name}</span>
                          {league.league.type && (
                            <>
                              <span>•</span>
                              <span className="capitalize">
                                {league.league.type}
                              </span>
                            </>
                          )}
                        </div>

                        {seasonData && (
                          <div className="text-xs text-muted-foreground">
                            <div>
                              {seasonData.start} - {seasonData.end}
                            </div>
                            {seasonData.current && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                                Current Season
                              </span>
                            )}
                          </div>
                        )}

                        {/* Coverage Badges */}
                        {seasonData && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {hasStandings && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 rounded text-xs font-medium">
                                Standings
                              </span>
                            )}
                            {seasonData.coverage.fixtures.events && (
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded text-xs font-medium">
                                Events
                              </span>
                            )}
                            {seasonData.coverage.standings && (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded text-xs font-medium">
                                Stats
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );

              return hasStandings ? (
                <Link
                  key={league.league.id}
                  href={`/tables/standing/${league.league.id}`}
                  className="block"
                >
                  {CardContent}
                </Link>
              ) : (
                <div key={league.league.id}>{CardContent}</div>
              );
            })}
          </div>
        )}

        {!isLoading && !error && sortedLeagues.length > 0 && (
          <div className="text-center text-sm text-muted-foreground pt-4">
            Showing {sortedLeagues.length} league
            {sortedLeagues.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </MinHeight>
  );
}
