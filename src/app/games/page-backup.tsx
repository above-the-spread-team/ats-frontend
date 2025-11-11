"use client";

import * as React from "react";
import Image from "next/image";
import FullPage from "@/components/common/full-page";
import Loading from "@/components/common/loading";
import Datepicker from "./_components/datepicker";
import NoGame from "./_components/no-game";
import FixturesError from "./_components/error";
import { getFixtureStatus } from "@/data/fixture-status";
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

export default function Fixtures() {
  const today = React.useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);
  const [fixtures, setFixtures] = React.useState<FixtureResponseItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [meta, setMeta] = React.useState<{
    parameters?: FixturesApiResponse["parameters"];
    results?: number;
  }>({});
  const [timezone, setTimezone] = React.useState(DEFAULT_TIMEZONE);

  React.useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setTimezone(tz);
      }
    } catch {
      setTimezone(DEFAULT_TIMEZONE);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    const fetchFixtures = async () => {
      setIsLoading(true);
      setError(null);

      const dateStr = formatDateParam(selectedDate);

      try {
        const response = await fetch(
          `/api/fixtures?date=${dateStr}&timezone=${encodeURIComponent(
            timezone
          )}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load fixtures (${response.status})`);
        }

        const data = (await response.json()) as FixturesApiResponse;

        setFixtures(data.response ?? []);
        setMeta({ parameters: data.parameters, results: data.results });

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
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
  }, [selectedDate, timezone]);

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
            {meta.parameters.timezone ?? timezone}
          </p>
        </div>
      )}

      {isLoading && (
        <FullPage>
          <Loading />
        </FullPage>
      )}

      {!isLoading && error && (
        <FullPage>
          <FixturesError
            message={error}
            onRetry={() => setSelectedDate(new Date(selectedDate))}
          />
        </FullPage>
      )}

      {!isLoading && !error && groupedFixtures.length === 0 && (
        <FullPage>
          <NoGame date={formatDateParam(selectedDate)} />
        </FullPage>
      )}

      {!isLoading &&
        groupedFixtures.map((group) => (
          <div
            key={group.leagueId}
            className="rounded-3xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {group.logo ? (
                  <Image
                    src={group.logo}
                    alt={`${group.leagueName} logo`}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-contain bg-white p-1 dark:bg-background"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/40 text-xs font-semibold uppercase text-muted-foreground">
                    {getInitials(group.leagueName)}
                  </div>
                )}
                <div>
                  <p className="text-lg font-semibold text-primary">
                    {group.leagueName}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {group.country} • Season {group.season}
                    {group.round ? ` • ${group.round}` : ""}
                  </p>
                </div>
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
                  className="space-y-3 rounded-2xl border border-border/60 bg-background/70 p-4 text-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {(["home", "away"] as const).map((side) => {
                          const team = fixture.teams[side];
                          const isWinner = team.winner === true;
                          const isLoser = team.winner === false;
                          const score =
                            side === "home"
                              ? formatGoals(fixture.goals.home)
                              : formatGoals(fixture.goals.away);
                          return (
                            <div
                              key={side}
                              className="flex w-full items-center justify-between gap-3 md:w-[calc(50%-0.75rem)]"
                            >
                              <div className="flex items-center gap-3">
                                {team.logo ? (
                                  <Image
                                    src={team.logo}
                                    alt={`${team.name} logo`}
                                    width={32}
                                    height={32}
                                    className="h-8 w-8 rounded-full object-contain bg-white p-1 dark:bg-background"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                                    {getInitials(team.name)}
                                  </div>
                                )}
                                <p
                                  className={`text-base font-semibold ${
                                    isWinner
                                      ? "text-primary"
                                      : isLoser
                                      ? "text-muted-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {team.name}
                                </p>
                              </div>
                              <span className="min-w-[2.5rem] text-center text-base font-semibold text-foreground">
                                {score}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {fixture.fixture.venue.name},{" "}
                        {fixture.fixture.venue.city}
                      </p>
                    </div>
                    {(() => {
                      const statusInfo = getFixtureStatus(
                        fixture.fixture.status.short
                      );
                      return (
                        <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground md:items-end">
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusInfo.badgeClass}`}
                            >
                              {statusInfo.short}
                            </span>
                            <span>
                              {new Date(
                                fixture.fixture.date
                              ).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {statusInfo.long} • {statusInfo.type}
                          </p>
                          <p className="max-w-sm text-[11px] text-muted-foreground/80">
                            {statusInfo.description}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
