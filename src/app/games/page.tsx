"use client";

import * as React from "react";
import Image from "next/image";
import FullPage from "@/components/common/full-page";
import Loading from "@/components/common/loading";
import Datepicker from "./_components/datepicker";
import NoGame from "./_components/no-game";
import FixturesError from "./_components/error";
import { useEffect, useMemo, useState } from "react";
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
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [fixtures, setFixtures] = useState<FixtureResponseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    parameters?: FixturesApiResponse["parameters"];
    results?: number;
  }>({});
  const [timezone, setTimezone] = React.useState(DEFAULT_TIMEZONE);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setTimezone(tz);
      }
    } catch {
      setTimezone(DEFAULT_TIMEZONE);
    }
  }, []);

  useEffect(() => {
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

  const groupedFixtures = useMemo(
    () => groupFixturesByLeague(fixtures),
    [fixtures]
  );

  return (
    <div className="container mx-auto space-y-2 ">
      <Datepicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />

      {/* {meta.parameters && (
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
      )} */}
      {meta.parameters && (
        <div className="flex max-w-4xl mx-auto px-6 md:px-8 flex-row items-center justify-between text-xs md:text-sm font-bold dark:text-mygray text-primary">
          <p>Season {meta.parameters.season}</p>
          <p>Timezone: {meta.parameters.timezone ?? timezone}</p>
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

      {!isLoading && (
        <div className="flex flex-col  justify-center items-center space-y-2">
          {groupedFixtures.map((group) => (
            <div className="" key={group.leagueId}>
              <div className="flex flex-row items-center gap-2">
                {group.logo ? (
                  <Image
                    src={group.logo}
                    alt={group.leagueName}
                    width={100}
                    height={100}
                    className="w-8 h-8 object-contain"
                  />
                ) : null}
                <p className="text-lg font-bold text-foreground">
                  {group.leagueName}
                </p>
              </div>
              <div className="">
                {group.fixtures.map((fixture) => (
                  <div
                    key={fixture.fixture.id}
                    className="w-[800px] bg-pink-100 my-2 grid grid-cols-7"
                  >
                    <div className="flex flex-row items-center justify-end gap-2 col-span-3">
                      <p>{fixture.teams.home.name} </p>
                      {fixture.teams.home.logo ? (
                        <Image
                          src={fixture.teams.home.logo}
                          alt={fixture.teams.home.name}
                          width={100}
                          height={100}
                          className="w-10 h-10 object-contain  "
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                          {getInitials(fixture.teams.home.name)}
                        </div>
                      )}
                    </div>
                    <div className=" bg-blue-500 col-span-1 flex items-center justify-center">
                      <p className="text-center text-2xl font-bold">
                        {fixture.goals.home} - {fixture.goals.away}
                      </p>
                    </div>
                    <div className="flex flex-row items-center justify-start gap-2 col-span-3">
                      {fixture.teams.away.logo ? (
                        <Image
                          src={fixture.teams.away.logo}
                          alt={fixture.teams.away.name}
                          width={100}
                          height={100}
                          className="w-10 h-10 object-contain rounded-md "
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
                          {getInitials(fixture.teams.away.name)}
                        </div>
                      )}
                      <p>{fixture.teams.away.name} </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
