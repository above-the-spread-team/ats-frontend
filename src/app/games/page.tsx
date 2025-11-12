"use client";

import * as React from "react";
import { Eye, EyeClosed } from "lucide-react";
import FullPage from "@/components/common/full-page";
import Loading from "@/components/common/loading";
import Datepicker from "./_components/datepicker";
import NoGame from "./_components/no-game";
import FixturesError from "./_components/error";
import { useEffect, useMemo, useState } from "react";
import { getFixtureStatus } from "@/data/fixture-status";
import type { FixturesApiResponse, FixtureResponseItem } from "@/type/fixture";
import TeamInfo from "./_components/team";

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
    <div className="container mx-auto space-y-2 ">
      <Datepicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      {meta.parameters && (
        <div className="flex max-w-4xl mx-auto px-6 md:px-8 flex-row items-center justify-between text-xs md:text-sm font-bold dark:text-mygray text-primary">
          <p>Timezone: {meta.parameters.timezone ?? timezone}</p>
          <button
            onClick={() => setHideScores(!hideScores)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:bg-muted/50 transition-colors"
            aria-label={hideScores ? "Show scores" : "Hide scores"}
            title={hideScores ? "Show scores" : "Hide scores"}
          >
            {hideScores ? (
              <EyeClosed className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">
              {hideScores ? "Show" : "Hide"} Scores
            </span>
          </button>
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
        <div className="flex flex-col  justify-center  items-center pt-2 pb-3 space-y-4">
          {groupedFixtures.map((group) => (
            <div className="" key={group.leagueId}>
              <p className="text-sm md:text-base text-center font-semibold text-foreground">
                {group.leagueName}
              </p>
              {group.fixtures.map((fixture) => {
                const statusInfo = getFixtureStatus(
                  fixture.fixture.status.short
                );
                const hasStarted =
                  statusInfo.type === "In Play" ||
                  statusInfo.type === "Finished";
                const kickoffTime = new Date(
                  fixture.fixture.date
                ).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                  timeZone: fixture.fixture.timezone,
                });

                const borderColor =
                  statusInfo.type === "Finished"
                    ? "border-primary/80"
                    : statusInfo.type !== "In Play"
                    ? "border-mygray dark:border-mygray/50"
                    : "border-card";

                return (
                  <div
                    key={fixture.fixture.id}
                    className={`flex flex-col items-center rounded-sm border-l-[6px] relative ${borderColor} bg-card my-2 py-2`}
                  >
                    {/* animation for in play */}
                    {statusInfo.type === "In Play" && (
                      <div className="absolute top-3 left-1 pointer-events-none z-10">
                        <div className="relative w-[10px] h-[10px]">
                          {/* Outer pulsing ring */}
                          <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping"></div>
                          {/* Middle pulsing ring with delay */}
                          <div
                            className="absolute inset-0 rounded-full bg-primary/30 animate-ping"
                            style={{ animationDelay: "0.5s" }}
                          ></div>
                          {/* Inner glowing dot */}
                          <div className="absolute inset-0 rounded-full bg-primary/50 animate-pulse"></div>
                          {/* Solid center core */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/20 shadow-lg shadow-primary/50"></div>
                        </div>
                      </div>
                    )}
                    <div className="w-[90vw]  md:w-[700px] lg:w-[750px]  grid grid-cols-7">
                      <TeamInfo
                        team={fixture.teams.home}
                        orientation="home"
                        className="col-span-3"
                        nameClassName="text-xs md:text-sm font-medium"
                      />
                      <div className="col-span-1 flex  flex-col items-center justify-center  text-foreground gap-1">
                        {hasStarted ? (
                          <div className="flex h-6  items-center justify-center gap-4">
                            {hideScores ? (
                              <>
                                <span className="text-base font-bold md:text-base">
                                  –
                                </span>
                                <span className="h-6 w-[2px] bg-primary/50 " />
                                <span className="text-base font-bold md:text-base">
                                  –
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-lg  font-bold md:text-xl">
                                  {formatGoals(fixture.goals.home)}
                                </span>
                                <span className="h-6 w-[2px] bg-primary/50 " />
                                <span className="text-lg font-bold md:text-xl">
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
      )}
    </div>
  );
}
