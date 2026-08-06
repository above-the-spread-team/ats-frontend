"use client";

import { useState } from "react";
import { useFixtures } from "@/services/football-api/fixtures";
import { getFixtureStatus } from "@/data/fixture-status";
import type { FixtureResponseItem } from "@/type/footballapi/fixture";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

interface LeagueGroup {
  leagueId: number;
  leagueName: string;
  country: string;
  logo: string | null;
  flag: string | null;
  season: number;
  round: string | null;
  fixtures: FixtureResponseItem[];
}

export default function FixturesTestPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showJson, setShowJson] = useState(false);
  const timezone = "UTC"; // You can make this configurable if needed

  const { data, isLoading, error } = useFixtures(selectedDate, timezone);

  // Group fixtures by league
  const groupedFixtures: LeagueGroup[] = [];
  if (data?.response) {
    const leagueMap = new Map<number, LeagueGroup>();

    data.response.forEach((fixture) => {
      const league = fixture.league;
      const leagueId = league.id;

      if (!leagueMap.has(leagueId)) {
        leagueMap.set(leagueId, {
          leagueId: league.id,
          leagueName: league.name,
          country: league.country,
          logo: league.logo,
          flag: league.flag,
          season: league.season,
          round: league.round,
          fixtures: [],
        });
      }

      leagueMap.get(leagueId)!.fixtures.push(fixture);
    });

    groupedFixtures.push(...Array.from(leagueMap.values()));
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatGoals = (goals: number | null) => {
    return goals !== null ? goals.toString() : "-";
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Fixtures Test Page</h1>

        {/* Date Picker */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="date-input" className="text-sm font-medium">
              Select Date:
            </label>
            <input
              id="date-input"
              type="date"
              value={formatDateInput(selectedDate)}
              onChange={(e) => {
                const newDate = new Date(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  setSelectedDate(newDate);
                }
              }}
              className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2 pt-6">
            <div className="text-sm text-muted-foreground">
              Selected: {formatDateDisplay(selectedDate)}
            </div>
            <div className="text-sm text-muted-foreground">
              Timezone: {timezone}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              Error loading fixtures:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Data */}
      {!isLoading &&
        !error &&
        (!data || !data.response || data.response.length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                No fixtures found for {formatDateDisplay(selectedDate)}
              </p>
            </CardContent>
          </Card>
        )}

      {/* Fixtures List */}
      {!isLoading && !error && groupedFixtures.length > 0 && (
        <div className="space-y-6">
          {groupedFixtures.map((group) => (
            <Card key={group.leagueId}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {group.logo && (
                    <Image
                      src={group.logo}
                      alt={group.leagueName}
                      width={32}
                      height={32}
                      className="object-contain"
                      unoptimized
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {group.leagueName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {group.country} • Season {group.season}
                      {group.round && ` • ${group.round}`}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.fixtures.map((fixture) => {
                    const statusInfo = getFixtureStatus(
                      fixture.fixture.status.short
                    );
                    const hasStarted =
                      statusInfo.type === "In Play" ||
                      statusInfo.type === "Finished";
                    const kickoffTime = formatTime(fixture.fixture.date);

                    return (
                      <div
                        key={fixture.fixture.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        {/* Home Team */}
                        <div className="flex items-center gap-3 flex-1">
                          {fixture.teams.home.logo && (
                            <Image
                              src={fixture.teams.home.logo}
                              alt={fixture.teams.home.name}
                              width={32}
                              height={32}
                              className="object-contain"
                              unoptimized
                            />
                          )}
                          <span className="font-medium text-sm md:text-base">
                            {fixture.teams.home.name}
                          </span>
                        </div>

                        {/* Score/Time */}
                        <div className="flex flex-col items-center gap-1 min-w-[120px]">
                          {hasStarted ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                {formatGoals(fixture.goals.home)}
                              </span>
                              <span className="text-muted-foreground">-</span>
                              <span className="text-lg font-bold">
                                {formatGoals(fixture.goals.away)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium">
                              {kickoffTime}
                            </span>
                          )}
                          {statusInfo.type !== "Scheduled" && (
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {statusInfo.short}
                            </span>
                          )}
                        </div>

                        {/* Away Team */}
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-medium text-sm md:text-base text-right">
                            {fixture.teams.away.name}
                          </span>
                          {fixture.teams.away.logo && (
                            <Image
                              src={fixture.teams.away.logo}
                              alt={fixture.teams.away.name}
                              width={32}
                              height={32}
                              className="object-contain"
                              unoptimized
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {!isLoading && !error && data && (
        <div className="mt-6 text-sm text-muted-foreground">
          Total fixtures: {data.results || 0} • Date:{" "}
          {data.parameters?.date || "N/A"}
        </div>
      )}

      {/* JSON Response */}
      {!isLoading && data && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>JSON Response</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJson(!showJson)}
              >
                {showJson ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Hide JSON
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show JSON
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showJson && (
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs md:text-sm">
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
