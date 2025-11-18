"use client";

import { useEffect, useState, useMemo } from "react";
import { Trophy, Award, Search, SearchX, Inbox } from "lucide-react";
import FullPage from "@/components/common/full-page";
import Section from "./_components/section";
import LeagueCard from "./_components/league-card";
import StatsSkeleton from "./_components/skeleton";
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
    return (
      <LeagueCard
        key={league.league.id}
        league={league}
        season={selectedSeason}
        getCurrentSeasonData={getCurrentSeasonData}
      />
    );
  };

  return (
    <div className="container mx-auto   px-4 max-w-6xl  py-3 md:py-4">
      {/* Header */}
      <div className="space-y-3 md:space-y-4">
        <h1 className="text-xl md:text-2xl font-bold text-primary-title">
          Leagues & Cups
        </h1>

        {/* Search */}
        <div className="relative w-full md:w-auto md:max-w-md">
          <div className="absolute left-5 md:left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Search className="w-4 h-4 text-primary-font scale-95 md:scale-100" />
          </div>
          <input
            type="text"
            placeholder="Search leagues or countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full scale-95 md:scale-100 pl-10 pr-4 py-1.5 md:py-2 text-base md:text-sm border border-primary-title/30 rounded-2xl placeholder:text-primary-font/50 bg-background text-primary-font focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {[
            { id: "all" as LeagueType, label: "All", icon: null },
            { id: "league" as LeagueType, label: "Leagues", icon: Award },
            { id: "cup" as LeagueType, label: "Cups", icon: Trophy },
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
                className={`flex  items-center gap-2 px-2 md:px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary-font font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-xs md:text-sm">{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-primary/20 text-primary-font"
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
        <FullPage minusHeight={minusHeight}>
          <StatsSkeleton />
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
          <div className="text-center space-y-4 max-w-md mx-auto px-4">
            <div className="flex justify-center">
              {searchQuery.trim() ? (
                <SearchX className="w-8 h-8 md:w-10 md:h-10 text-primary-font" />
              ) : (
                <Inbox className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs md:text-sm font-semibold text-muted-foreground">
              {searchQuery.trim()
                ? `No leagues match "${searchQuery}"`
                : "No leagues found for this season"}
            </p>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-medium text-primary-font bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <SearchX className="w-4 h-4" />
                Clear search
              </button>
            )}
          </div>
        </FullPage>
      )}

      {/* Leagues Content */}
      {!isLoading && !error && totalFilteredCount > 0 && (
        <FullPage minusHeight={minusHeight} className="space-y-4 mt-4 pb-10">
          <Section
            title="Cups"
            icon={Trophy}
            count={groupedLeagues.cup.length}
            leagues={groupedLeagues.cup}
            renderLeagueCard={renderLeagueCard}
          />
          <Section
            title="Leagues"
            icon={Award}
            count={groupedLeagues.league.length}
            leagues={groupedLeagues.league}
            renderLeagueCard={renderLeagueCard}
          />
          <Section
            title="Other"
            icon={Trophy}
            count={groupedLeagues.other.length}
            leagues={groupedLeagues.other}
            renderLeagueCard={renderLeagueCard}
          />
        </FullPage>
      )}
    </div>
  );
}
