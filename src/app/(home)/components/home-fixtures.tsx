"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { FixturesApiResponse } from "@/type/fixture";
import { getFixtureStatus } from "@/data/fixture-status";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";

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
  if (value === null || value === undefined) {
    return "–";
  }
  return value.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Fixtures() {
  const [fixturesData, setFixturesData] = useState<FixturesApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchFixtures = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        const params = new URLSearchParams({
          date: today,
        });

        const response = await fetch(`/api/fixtures?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load fixtures (${response.status})`);
        }

        const data = (await response.json()) as FixturesApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        setFixturesData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setFixturesData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchFixtures();

    // Refresh every 5 minutes for fixtures
    const interval = setInterval(() => {
      if (!controller.signal.aborted) {
        fetchFixtures();
      }
    }, 300000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on("reInit", updateScrollState);
    api.on("select", updateScrollState);

    return () => {
      api.off("reInit", updateScrollState);
      api.off("select", updateScrollState);
    };
  }, [api]);

  if (isLoading) {
    return (
      <div className="w-full">
        <Carousel
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="px-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <CarouselItem
                key={idx}
                className="basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-1/8 px-0"
              >
                <div className="group relative block border border-border bg-card p-2">
                  {/* Teams & Score */}
                  <div className="space-y-3">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                        <Skeleton className="h-4 flex-1 max-w-[100px]" />
                      </div>
                      <Skeleton className="h-5 w-6 ml-2" />
                    </div>

                    {/* Score Separator */}
                    <Skeleton className="h-px w-full" />

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                        <Skeleton className="h-4 flex-1 max-w-[100px]" />
                      </div>
                      <Skeleton className="h-5 w-6 ml-2" />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-12 rounded" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  if (error || !fixturesData || !fixturesData.response) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No fixtures available"}
        </p>
      </div>
    );
  }

  const fixtures = fixturesData.response;

  if (fixtures.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No fixtures available today</p>
      </div>
    );
  }

  return (
    <div className="">
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        setApi={setApi}
        className="w-full "
      >
        <CarouselContent className="px-4">
          {fixtures.map((fixture) => {
            const statusInfo = getFixtureStatus(fixture.fixture.status.short);
            const isInPlay = statusInfo.type === "In Play";
            const hasStarted = isInPlay || statusInfo.type === "Finished";
            const currentDateStr = formatDate(fixture.fixture.date);
            const detailUrl = `/games/detail?id=${fixture.fixture.id}&date=${currentDateStr}`;

            return (
              <CarouselItem
                key={fixture.fixture.id}
                className=" basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7 2xl:basis-1/8 px-0"
              >
                <Link
                  href={detailUrl}
                  className="group relative block  border border-border bg-card p-2 hover:bg-card/80 transition-colors"
                >
                  {isInPlay && (
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        LIVE
                      </span>
                    </div>
                  )}

                  {/* League Info
                  <div className="flex items-center gap-2 mb-3">
                    {fixture.league.logo && (
                      <Image
                        src={fixture.league.logo}
                        alt={fixture.league.name}
                        width={16}
                        height={16}
                        className="w-4 h-4 object-contain"
                      />
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {fixture.league.name}
                    </p>
                  </div> */}

                  {/* Teams & Score */}
                  <div className="space-y-3">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {fixture.teams.home.logo ? (
                          <Image
                            src={fixture.teams.home.logo}
                            alt={fixture.teams.home.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                            {getInitials(fixture.teams.home.name)}
                          </div>
                        )}
                        <p className="text-sm font-semibold truncate">
                          {fixture.teams.home.name}
                        </p>
                      </div>
                      {hasStarted && (
                        <span className="text-lg font-bold ml-2">
                          {formatGoals(fixture.goals.home)}
                        </span>
                      )}
                    </div>

                    {/* Score Separator */}
                    {hasStarted && <div className="h-px bg-border"></div>}

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {fixture.teams.away.logo ? (
                          <Image
                            src={fixture.teams.away.logo}
                            alt={fixture.teams.away.name}
                            width={24}
                            height={24}
                            className="w-6 h-6 object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                            {getInitials(fixture.teams.away.name)}
                          </div>
                        )}
                        <p className="text-sm font-semibold truncate">
                          {fixture.teams.away.name}
                        </p>
                      </div>
                      {hasStarted && (
                        <span className="text-lg font-bold ml-2">
                          {formatGoals(fixture.goals.away)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.short}
                      </span>
                      {fixture.fixture.status.elapsed !== null && (
                        <span className="text-xs text-muted-foreground">
                          {fixture.fixture.status.elapsed}&apos;
                          {fixture.fixture.status.extra !== null &&
                            fixture.fixture.status.extra > 0 &&
                            `+${fixture.fixture.status.extra}`}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {canScrollPrev && (
          <CarouselPrevious className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-primary rounded-full shadow-lg hover:bg-primary-active [&_svg]:!text-white" />
        )}
        {canScrollNext && (
          <CarouselNext className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-primary rounded-full shadow-lg hover:bg-primary-active [&_svg]:!text-white" />
        )}
      </Carousel>
    </div>
  );
}
