"use client";

import Image from "next/image";
import type { FixtureResponseItem } from "@/type/footballapi/fixture";
import { getFixtureStatus } from "@/data/fixture-status";
import TeamInfo from "../../_components/team";

function formatGoals(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "–";
  }
  return value.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string, timezone: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  });
}

interface FixtureDetailProps {
  fixture: FixtureResponseItem;
}

export default function FixtureDetail({ fixture }: FixtureDetailProps) {
  const statusInfo = getFixtureStatus(fixture.fixture.status.short);
  const isInPlay = statusInfo.type === "In Play";
  const isFinished = statusInfo.type === "Finished";
  const hasStarted = isInPlay || isFinished;

  // Get user's timezone (UTC fallback when browser fails to resolve, e.g. Safari low‑power)
  const userTimezone = (() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return tz?.trim() ? tz : "UTC";
    } catch {
      return "UTC";
    }
  })();

  return (
    <div className="space-y-0 flex flex-col items-center justify-center gap-1 md:gap-2">
      <div className="space-y-1 mb-1 -mt-2 md:-mt-4">
        {/* League Header */}
        {fixture.league && (
          <div className="flex items-start justify-center gap-3">
            {fixture.league.logo && (
              <Image
                src={fixture.league.logo}
                alt={fixture.league.name}
                width={20}
                height={20}
                className="w-6 md:w-6 h-6 md:h-6 object-contain"
              />
            )}
            <h2 className="text-base md:text-lg font-bold text-white">
              {fixture.league.name}
            </h2>
          </div>
        )}

        {/* Match Date & Time */}
        <div className="text-center  space-y-1">
          <p className="text-xs md:text-sm text-gray-300">
            {formatDate(fixture.fixture.date)}
          </p>
          {!hasStarted && (
            <p className="text-base md:text-lg font-semibold text-white">
              {formatTime(fixture.fixture.date, userTimezone)}
            </p>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="w-full max-w-2xl grid grid-cols-7 gap-4 mb-4">
        <TeamInfo
          isDetail={true}
          team={fixture.teams.home}
          orientation="home"
          className="col-span-3 md:gap-4"
          nameClassName="text-xs md:text-sm lg:text-base font-semibold text-white"
          logoClassName="w-10 h-10 md:w-12 md:h-12 object-contain"
        />
        <div className="col-span-1 flex flex-col items-center justify-center gap-2">
          {hasStarted ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {formatGoals(fixture.goals.home)}
              </span>
              <span className="h-8 w-[2px] bg-primary/50" />
              <span className="text-2xl md:text-3xl font-bold text-white">
                {formatGoals(fixture.goals.away)}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-base md:text-lg font-medium text-white">VS</p>
            </div>
          )}
          {statusInfo.type !== "Scheduled" && (
            <p className="text-xs font-semibold uppercase tracking-wide text-white">
              {statusInfo.short}
            </p>
          )}
        </div>
        <TeamInfo
          isDetail={true}
          team={fixture.teams.away}
          orientation="away"
          className="col-span-3  md:gap-4"
          nameClassName="text-xs md:text-sm lg:text-base font-semibold text-white"
          logoClassName="w-10 h-10 md:w-12 md:h-12 object-contain"
        />
      </div>
      {statusInfo.type === "In Play" && (
        <div className="flex flex-col -mt-8 md:-mt-4 items-center justify-center gap-0">
          <p className="text-base md:text-lg font-semibold uppercase tracking-wide text-white">
            {fixture.fixture.status.elapsed}&apos;
          </p>
          <div className="relative w-10 h-[2.5px] overflow-hidden">
            <div className="absolute inset-0 bg-white/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent  animate-shimmer"></div>
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      {hasStarted && (
        <div className=" flex items-center justify-center gap-4 pt-2">
          {fixture.score.halftime.home !== null &&
            fixture.fixture.status.elapsed &&
            fixture.fixture.status.elapsed >= 45 && (
              <div className="text-center">
                <p className="text-xs text-gray-300 mb-1">Halftime</p>
                <p className="text-sm font-semibold text-white">
                  {formatGoals(fixture.score.halftime.home)} -{" "}
                  {formatGoals(fixture.score.halftime.away)}
                </p>
              </div>
            )}
          {fixture.score.fulltime.home !== null &&
            fixture.score.fulltime.home !== fixture.goals.home && (
              <div className="text-center">
                <p className="text-xs text-gray-300 mb-1">Fulltime</p>
                <p className="text-sm font-semibold text-white">
                  {formatGoals(fixture.score.fulltime.home)} -{" "}
                  {formatGoals(fixture.score.fulltime.away)}
                </p>
              </div>
            )}
          {fixture.score.extratime.home !== null && (
            <div className="text-center">
              <p className="text-xs text-gray-300 mb-1">Extra Time</p>
              <p className="text-sm font-semibold">
                {formatGoals(fixture.score.extratime.home)} -{" "}
                {formatGoals(fixture.score.extratime.away)}
              </p>
            </div>
          )}
          {fixture.score.penalty.home !== null && (
            <div className="text-center">
              <p className="text-xs text-gray-300 mb-1">Penalties</p>
              <p className="text-sm font-semibold">
                {formatGoals(fixture.score.penalty.home)} -{" "}
                {formatGoals(fixture.score.penalty.away)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
