"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFixtureStatus } from "@/data/fixture-status";
import { useFixturesNextLast } from "@/services/football-api/fixtures";
import { IoFootball } from "react-icons/io5";
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
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Use React Query to fetch last 15 fixtures for league ID 2 (UEFA Champions League)
  const {
    data: fixturesData,
    isLoading,
    error: queryError,
  } = useFixturesNextLast("last", 15, 2);

  const fixtures = useMemo(
    () => fixturesData?.response ?? [],
    [fixturesData?.response]
  );

  const error =
    queryError instanceof Error
      ? queryError.message
      : fixturesData?.errors && fixturesData.errors.length > 0
      ? fixturesData.errors.join("\n")
      : null;

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
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="px-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <CarouselItem
                key={idx}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/7 2xl:basis-1/8 px-0"
              >
                <div className="group relative block border border-border bg-card p-2">
                  {/* Teams & Score */}
                  <div className="space-y-2 md:space-y-3">
                    {/* Home Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                        <Skeleton className="h-[12px] md:h-[14px] flex-1 max-w-[100px]" />
                      </div>
                      <Skeleton className="h-[16px] w-6 ml-2" />
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                        <Skeleton className="h-[12px] md:h-[14px] flex-1 max-w-[100px]" />
                      </div>
                      <Skeleton className="h-[16px] w-6 ml-2" />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-2 pt-1 border-t border-border">
                    <div className="flex items-center justify-start">
                      <Skeleton className="h-5 w-12 rounded px-2" />
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

  if (error || !fixturesData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No fixtures available"}
        </p>
      </div>
    );
  }

  if (fixtures.length === 0) {
    return (
      <div className="w-full">
        <Link href="/games" className="group">
          <div className="bg-gradient-to-br from-primary/50 via-card/40 to-slate-900/5 dark:to-slate-900 cursor-pointer min-h-[110px] flex items-center justify-center gap-3 transition-colors">
            <IoFootball className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            <span className="text-muted-foreground group-hover:text-primary-font text-sm md:text-base font-medium transition-colors">
              No fixtures available
            </span>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
        dragFree: true,
      }}
      setApi={setApi}
      className="w-full bg-slate-900/5 dark:bg-slate-900"
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
              className=" basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/7 2xl:basis-1/8 px-0"
            >
              <Link
                href={detailUrl}
                className="group relative block  border border-border bg-card p-2 hover:bg-card/80 transition-colors"
              >
                {isInPlay && (
                  <div className="absolute bottom-2 right-2.5">
                    <span className="flex items-center p-1 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    </span>
                  </div>
                )}

                {/* Teams & Score */}
                <div className="space-y-2 md:space-y-3">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {fixture.teams.home.logo ? (
                        <Image
                          src={fixture.teams.home.logo}
                          alt={fixture.teams.home.name}
                          width={20}
                          height={20}
                          className="w-6 h-6 object-contain flex-shrink-0"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground flex-shrink-0">
                          {getInitials(fixture.teams.home.name)}
                        </div>
                      )}
                      <p className="text-xs md:text-sm font-semibold truncate">
                        {fixture.teams.home.name}
                      </p>
                    </div>
                    {hasStarted && (
                      <span className="text-base font-bold ml-2">
                        {formatGoals(fixture.goals.home)}
                      </span>
                    )}
                  </div>

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
                      <p className="text-xs md:text-sm font-semibold truncate">
                        {fixture.teams.away.name}
                      </p>
                    </div>
                    {hasStarted && (
                      <span className="text-base font-bold ml-2">
                        {formatGoals(fixture.goals.away)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="mt-2  pt-1 border-t border-border">
                  <div className="flex items-center justify-start">
                    <span
                      className={`text-xs font-semibold px-2  rounded ${statusInfo.badgeClass}`}
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
  );
}
