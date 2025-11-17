"use client";

import * as React from "react";
import { Eye, EyeClosed, Clock8, ChevronRight } from "lucide-react";
import Link from "next/link";
import FullPage from "@/components/common/full-page";
import Loading from "@/components/common/loading";
import Datepicker from "./_components/datepicker";
import NoGame from "./_components/no-game";
import FixturesError from "./_components/error";
import { useEffect, useMemo, useState } from "react";
import { getFixtureStatus } from "@/data/fixture-status";
import type { FixturesApiResponse, FixtureResponseItem } from "@/type/fixture";
import TeamInfo from "./_components/team";
import { Switch } from "@/components/ui/switch";

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
  const [hideScores, setHideScores] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hideScores");
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  });
  const [meta, setMeta] = useState<{
    parameters?: FixturesApiResponse["parameters"];
    results?: number;
  }>({});
  const timezone = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz && tz.trim().length > 0 ? tz : "UTC";
    } catch {
      return "UTC";
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hideScores", JSON.stringify(hideScores));
    }
  }, [hideScores]);

  const groupedFixtures = useMemo(
    () => groupFixturesByLeague(fixtures),
    [fixtures]
  );

  return (
    <div className="container mx-auto  space-y-2 max-w-4xl">
      <Datepicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      {meta.parameters && (
        <div className="flex  mx-auto px-6 md:px-8 flex-row items-center justify-between text-xs md:text-sm font-bold dark:text-mygray text-primary">
          <div className="flex items-center gap-2">
            <Clock8 className="w-4 h-4" />{" "}
            <p>{meta.parameters.timezone ?? timezone}</p>
          </div>
          <div className="flex items-center gap-2">
            {hideScores ? (
              <EyeClosed className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">Scores</span>
            <Switch
              checked={hideScores}
              onCheckedChange={setHideScores}
              aria-label={hideScores ? "Show scores" : "Hide scores"}
              className="data-[state=unchecked]:bg-primary/50"
            />
          </div>
        </div>
      )}

      {isLoading && (
        <FullPage center>
          <Loading />
        </FullPage>
      )}

      {!isLoading && error && (
        <FullPage center>
          <FixturesError
            message={error}
            onRetry={() => setSelectedDate(new Date(selectedDate))}
          />
        </FullPage>
      )}

      {!isLoading && !error && groupedFixtures.length === 0 && (
        <FullPage center>
          <NoGame date={formatDateParam(selectedDate)} />
        </FullPage>
      )}

      {!isLoading && !error && groupedFixtures.length > 0 && (
        <FullPage>
          <div className="flex flex-col  justify-center  items-center pt-2 pb-10 md:pt-3 md:pb-12 space-y-5">
            {groupedFixtures.map((group) => (
              <div
                className="justify-center items-center flex flex-col space-y-2"
                key={group.leagueId}
              >
                <Link
                  className="flex ml-2   items-center gap-1 hover:text-primary"
                  href={`/stats/${group.leagueId}?season=${group.season}&tab=standings`}
                >
                  <p className="text-sm md:text-base text-center font-semibold ">
                    {group.leagueName}
                  </p>
                  <ChevronRight className="w-5 h-5 text-bold mt-0.5  " />
                </Link>
                {group.fixtures.map((fixture) => {
                  const statusInfo = getFixtureStatus(
                    fixture.fixture.status.short
                  );
                  const isInPlay = statusInfo.type === "In Play";
                  const hasStarted = isInPlay || statusInfo.type === "Finished";
                  const kickoffTime = new Date(
                    fixture.fixture.date
                  ).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: fixture.fixture.timezone,
                  });

                  const borderClass = isInPlay
                    ? ""
                    : `border-l-[6px] ${
                        statusInfo.type === "Finished"
                          ? "border-primary/80"
                          : "border-mygray dark:border-mygray/50"
                      }`;

                  return (
                    <div
                      key={fixture.fixture.id}
                      className={`relative flex flex-col items-center rounded-sm ${borderClass} bg-card py-2 overflow-hidden`}
                    >
                      {isInPlay && (
                        <>
                          <span className="pointer-events-none absolute inset-y-0 left-0 w-[6px] animate-pulse bg-gradient-to-b from-primary via-primary/80 to-primary/30"></span>
                          <span
                            className="pointer-events-none absolute inset-y-0 left-0 w-[6px] bg-primary/50 blur-sm opacity-70 animate-pulse"
                            style={{ animationDelay: "0.4s" }}
                          ></span>
                        </>
                      )}
                      <div className="w-[90vw]  md:w-[700px] lg:w-[750px]  grid grid-cols-7">
                        <TeamInfo
                          team={fixture.teams.home}
                          orientation="home"
                          className="col-span-3"
                          nameClassName="text-xs md:text-sm font-medium"
                        />
                        <div className="col-span-1 flex  flex-col items-center justify-center   gap-1">
                          {hasStarted ? (
                            <div className="flex h-6  items-center justify-center gap-4">
                              {hideScores ? (
                                <>
                                  <span className="text-base  font-bold md:text-base">
                                    –
                                  </span>
                                  <span className="h-6 w-[2px] bg-primary/50 " />
                                  <span className="text-base font-bold md:text-base">
                                    –
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-lg  w-3  font-bold md:text-xl">
                                    {formatGoals(fixture.goals.home)}
                                  </span>
                                  <span className="h-6 w-[2px] bg-primary/50 " />
                                  <span className="text-lg w-3  font-bold md:text-xl">
                                    {formatGoals(fixture.goals.away)}
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="text-md md:text-lg font-medium">
                                {kickoffTime}
                              </p>
                            </div>
                          )}
                          {statusInfo.type !== "Scheduled" && (
                            <p className="text-xs font-semibold uppercase tracking-wide">
                              {statusInfo.short}
                            </p>
                          )}
                        </div>
                        <TeamInfo
                          team={fixture.teams.away}
                          orientation="away"
                          className="col-span-3"
                          nameClassName="text-xs md:text-sm font-medium"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </FullPage>
      )}
    </div>
  );
}
