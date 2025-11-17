"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Award, Search } from "lucide-react";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";
import type { LeaguesApiResponse, LeagueResponseItem } from "@/type/league";

type LeagueType = "all" | "league" | "cup";

export default function Tables() {
  const [leagues, setLeagues] = useState<LeagueResponseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedType, setSelectedType] = useState<LeagueType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const minusHeight = 250;

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

  // Group and filter leagues
  const groupedLeagues = useMemo(() => {
    let filtered = [...leagues];

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (league) => league.league.type?.toLowerCase() === selectedType
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (league) =>
          league.league.name.toLowerCase().includes(query) ||
          league.country.name.toLowerCase().includes(query)
      );
    }

    // Sort by country first, then by league name
    filtered.sort((a, b) => {
      const countryCompare = a.country.name.localeCompare(b.country.name);
      if (countryCompare !== 0) return countryCompare;
      return a.league.name.localeCompare(b.league.name);
    });

    // Group by type
    const grouped: Record<string, LeagueResponseItem[]> = {
      league: [],
      cup: [],
      other: [],
    };

    filtered.forEach((league) => {
      const type = league.league.type?.toLowerCase();
      if (type === "league") {
        grouped.league.push(league);
      } else if (type === "cup") {
        grouped.cup.push(league);
      } else {
        grouped.other.push(league);
      }
    });

    return grouped;
  }, [leagues, selectedType, searchQuery]);

  const getCurrentSeasonData = (league: LeagueResponseItem) => {
    return (
      league.seasons.find((s) => s.year === selectedSeason) ||
      league.seasons.find((s) => s.current) ||
      league.seasons[league.seasons.length - 1]
    );
  };

  const totalFilteredCount = useMemo(() => {
    return (
      groupedLeagues.league.length +
      groupedLeagues.cup.length +
      groupedLeagues.other.length
    );
  }, [groupedLeagues]);

  // Always show total counts from original unfiltered data
  const totalLeaguesCount = useMemo(() => {
    return leagues.filter(
      (league) => league.league.type?.toLowerCase() === "league"
    ).length;
  }, [leagues]);

  const totalCupsCount = useMemo(() => {
    return leagues.filter(
      (league) => league.league.type?.toLowerCase() === "cup"
    ).length;
  }, [leagues]);

  const totalAllCount = useMemo(() => {
    return totalLeaguesCount + totalCupsCount;
  }, [totalLeaguesCount, totalCupsCount]);

  const renderLeagueCard = (league: LeagueResponseItem) => {
    const seasonData = getCurrentSeasonData(league);
    const hasStandings = seasonData?.coverage.standings ?? false;

    const CardContent = (
      <div
        className={`bg-card  rounded-lg px-4 py-3 md:p-4 hover:shadow-lg transition-shadow ${
          hasStandings ? "cursor-pointer" : "opacity-75"
        }`}
      >
        <div className="flex flex-row items-start gap-4">
          {/* League Logo */}
          <div className="relative w-12 h-12 md:w-14 md:h-14   flex-shrink-0">
            {league.league.logo ? (
              <Image
                src={league.league.logo}
                alt={league.league.name}
                fill
                className="object-contain  "
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-muted-foreground">
                  {league.league.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* League Info */}
          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="text-sm md:text-base font-bold text-foreground line-clamp-2">
              {league.league.name}
            </h4>

            <p className="text-sm text-muted-foreground">
              {league.country.name}
            </p>

            {seasonData && (
              <>
                {seasonData.current && (
                  <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                    Current Season
                  </span>
                )}
                <div className="text-xs text-muted-foreground">
                  {seasonData.start} - {seasonData.end}
                </div>
              </>
            )}
          </div>
          {league.country.flag && (
            <Image
              src={league.country.flag}
              alt={league.country.name}
              width={32}
              height={32}
              className="object-contain w-6 md:w-8"
            />
          )}
        </div>
      </div>
    );

    return hasStandings ? (
      <Link
        key={league.league.id}
        href={`/stats/${league.league.id}?season=${selectedSeason}&tab=standings`}
        className="block"
      >
        {CardContent}
      </Link>
    ) : (
      <div key={league.league.id}>{CardContent}</div>
    );
  };

  return (
    <div className="container mx-auto   px-4 max-w-6xl  py-4">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-xl md:text-2xl font-bold text-primary">
          Cups & Leagues
        </h1>

        {/* Search */}
        <div className="relative w-full md:w-auto md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leagues or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {[
            { id: "all" as LeagueType, label: "All", icon: Trophy },
            { id: "league" as LeagueType, label: "Leagues", icon: Trophy },
            { id: "cup" as LeagueType, label: "Cups", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedType === tab.id;
            const count =
              tab.id === "all"
                ? totalAllCount
                : tab.id === "league"
                ? totalLeaguesCount
                : totalCupsCount;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`flex  items-center gap-2 px-1 md:px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs md:text-sm">{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <FullPage center minusHeight={minusHeight}>
          <Loading />
        </FullPage>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <FullPage minusHeight={minusHeight}>
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

      {/* Empty State */}
      {!isLoading && !error && totalFilteredCount === 0 && (
        <FullPage center minusHeight={minusHeight}>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-muted-foreground">
              {searchQuery.trim()
                ? "No leagues found matching your search"
                : "No leagues found for this season"}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </FullPage>
      )}

      {/* Leagues Content */}
      {!isLoading && !error && totalFilteredCount > 0 && (
        <FullPage minusHeight={minusHeight} className="space-y-4 mt-4 pb-10">
          {/* Cups Section */}
          {groupedLeagues.cup.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="text-base md:text-lg font-bold text-foreground">
                  Cups
                </h3>
                <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {groupedLeagues.cup.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedLeagues.cup.map((league) => renderLeagueCard(league))}
              </div>
            </div>
          )}
          {/* Leagues Section */}
          {groupedLeagues.league.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="text-base md:text-lg font-bold text-foreground">
                  Leagues
                </h3>
                <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {groupedLeagues.league.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedLeagues.league.map((league) =>
                  renderLeagueCard(league)
                )}
              </div>
            </div>
          )}

          {/* Other Section */}
          {groupedLeagues.other.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <h3 className="text-base md:text-lg font-bold text-foreground">
                  Other
                </h3>
                <span className="px-2 py-0.5 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                  {groupedLeagues.other.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedLeagues.other.map((league) => renderLeagueCard(league))}
              </div>
            </div>
          )}
        </FullPage>
      )}
    </div>
  );
}
