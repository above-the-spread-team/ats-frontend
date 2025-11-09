"use client";

import * as React from "react";
import LoadingFull from "@/components/common/loading-full";
import Datepicker from "./_components/datepicker";
import type { FixturesApiResponse, FixtureResponseItem } from "@/type/fixture";

const DEFAULT_TIMEZONE = "Europe/London";

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

function formatDateParam(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function groupFixturesByLeague(fixtures: FixtureResponseItem[]): LeagueGroup[] {
  const map = new Map<number, LeagueGroup>();

  fixtures.forEach((fixture) => {
    const { league } = fixture;
    if (!map.has(league.id)) {
      map.set(league.id, {
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
    map.get(league.id)?.fixtures.push(fixture);
  });

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      fixtures: [...group.fixtures].sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime()
      ),
    }))
    .sort((a, b) => a.leagueName.localeCompare(b.leagueName));
}

export default function Fixtures() {
  const today = React.useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);
  const [fixtures, setFixtures] = React.useState<FixtureResponseItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState<{
    parameters?: FixturesApiResponse["parameters"];
    results?: number;
  }>({});

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchFixtures = async () => {
      setIsLoading(true);
      setError(null);

      const dateStr = formatDateParam(selectedDate);

      try {
        const response = await fetch(
          `/api/fixtures?date=${dateStr}&timezone=${encodeURIComponent(
            DEFAULT_TIMEZONE
          )}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load fixtures (${response.status})`);
        }

        const data = (await response.json()) as FixturesApiResponse & {
          errors?: Record<string, string> | null;
        };

        setFixtures(data.response ?? []);
        setMeta({ parameters: data.parameters, results: data.results });

        if (data.errors && Object.keys(data.errors).length > 0) {
          setError(
            Object.entries(data.errors)
              .map(([leagueId, message]) => `League ${leagueId}: ${message}`)
              .join("\n")
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setFixtures([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFixtures();

    return () => {
      controller.abort();
    };
  }, [selectedDate]);

  const groupedFixtures = React.useMemo(
    () => groupFixturesByLeague(fixtures),
    [fixtures]
  );

  return (
    <div className="container mx-auto space-y-6 pb-8 pt-4">
      <Datepicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {meta.parameters && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 text-xs text-muted-foreground">
          <p>
            Showing fixtures for{" "}
            <span className="font-semibold text-foreground">
              {meta.parameters.date}
            </span>{" "}
            (Season {meta.parameters.season}) • timezone{" "}
            {meta.parameters.timezone ?? DEFAULT_TIMEZONE}
          </p>
        </div>
      )}

      {isLoading && (
        <div className="w-full">
          <LoadingFull />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive whitespace-pre-line">
          {error}
        </div>
      )}

      {!isLoading && !error && groupedFixtures.length === 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-6 text-center text-sm text-muted-foreground">
          No fixtures found for {formatDateParam(selectedDate)}.
        </div>
      )}

      {!isLoading &&
        groupedFixtures.map((group) => (
          <div
            key={group.leagueId}
            className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-primary">
                  {group.leagueName}
                </p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {group.country} • Season {group.season}
                  {group.round ? ` • ${group.round}` : ""}
                </p>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {group.fixtures.length}{" "}
                {group.fixtures.length === 1 ? "fixture" : "fixtures"}
              </span>
            </div>

            <div className="space-y-3">
              {group.fixtures.map((fixture) => (
                <div
                  key={fixture.fixture.id}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4 text-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <p className="text-base font-semibold text-foreground">
                        {fixture.teams.home.name} vs {fixture.teams.away.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fixture.fixture.venue.name},{" "}
                        {fixture.fixture.venue.city}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(fixture.fixture.date).toLocaleTimeString(
                        undefined,
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      • {fixture.fixture.status.short}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
