"use client";

import type { FixtureEventsResponseItem } from "@/type/footballapi/fixture-events";
import { Skeleton } from "@/components/ui/skeleton";
import NoDate from "@/components/common/no-data";
import FullPage from "@/components/common/full-page";
import { useFixtureEvents } from "@/services/football-api/fixture-events";
import {
  Target,
  Square,
  RefreshCw,
  Video,
  AlertCircle,
  User,
  ArrowRight,
} from "lucide-react";

function formatTime(elapsed: number, extra: number | null): string {
  if (extra !== null && extra > 0) {
    return `${elapsed}+${extra}`;
  }
  return `${elapsed}`;
}

function getEventIcon(type: string, detail: string) {
  switch (type) {
    case "Goal":
      return <Target className="w-4 h-4" />;
    case "Card":
      if (detail === "Red Card") {
        return <Square className="w-4 h-4 text-red-500 fill-red-500" />;
      }
      return <Square className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
    case "subst":
      return <RefreshCw className="w-4 h-4" />;
    case "Var":
      return <Video className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

function getEventStyles(type: string, detail: string) {
  // Same background and border for all event types
  const commonBg = "bg-muted/50 dark:bg-muted/30";
  const commonBorder = "border-border";

  switch (type) {
    case "Goal":
      return {
        bg: commonBg,
        border: commonBorder,
        text: "text-green-700 dark:text-green-400",
        iconBg: "bg-green-500",
        shadow: "shadow-green-500/10",
      };
    case "Card":
      if (detail === "Red Card") {
        return {
          bg: commonBg,
          border: commonBorder,
          text: "text-red-700 dark:text-red-400",
          iconBg: "bg-red-500",
          shadow: "shadow-red-500/10",
        };
      }
      return {
        bg: commonBg,
        border: commonBorder,
        text: "text-yellow-700 dark:text-yellow-400",
        iconBg: "bg-yellow-500",
        shadow: "shadow-yellow-500/10",
      };
    case "subst":
      return {
        bg: commonBg,
        border: commonBorder,
        text: "text-blue-700 dark:text-blue-400",
        iconBg: "bg-blue-500",
        shadow: "shadow-blue-500/10",
      };
    case "Var":
      return {
        bg: commonBg,
        border: commonBorder,
        text: "text-purple-700 dark:text-purple-400",
        iconBg: "bg-purple-500",
        shadow: "shadow-purple-500/10",
      };
    default:
      return {
        bg: commonBg,
        border: commonBorder,
        text: "text-muted-foreground",
        iconBg: "bg-muted-foreground",
        shadow: "shadow-muted/10",
      };
  }
}

type FixtureStatusType =
  | "Scheduled"
  | "In Play"
  | "Finished"
  | "Postponed"
  | "Cancelled"
  | "Abandoned"
  | "Not Played"
  | "Unknown";

interface EventsProps {
  fixtureId: number;
  homeTeamId?: number;
  awayTeamId?: number;
  statusType?: FixtureStatusType | null;
}

export default function Events({
  fixtureId,
  homeTeamId,
  awayTeamId,
  statusType,
}: EventsProps) {
  // Use React Query to fetch events
  // Pass status type from parent to determine refetch intervals
  const {
    data: eventsData,
    isLoading,
    error: queryError,
  } = useFixtureEvents(fixtureId, statusType);

  // Handle error state
  const error =
    queryError instanceof Error
      ? queryError.message
      : eventsData?.errors && eventsData.errors.length > 0
      ? eventsData.errors.join("\n")
      : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="text-center space-y-1">
          <Skeleton className="h-5 md:h-6 w-32 mx-auto" />
          <Skeleton className="h-3 md:h-4 w-40 mx-auto" />
        </div>

        {/* Timeline Skeleton */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-border via-border to-border -translate-x-1/2" />

          {/* Events Container Skeleton */}
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, timeIdx) => (
              <div key={timeIdx} className="relative">
                {/* Time Badge Skeleton */}
                <div className="flex items-center justify-center mb-3 md:mb-6">
                  <div className="relative">
                    {/* Connection line to timeline */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 md:w-12 h-0.5 bg-border" />
                    <div className="relative z-10">
                      <Skeleton className="h-6 md:h-8 w-12 md:w-16 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Events at this time - Two columns */}
                <div className="grid grid-cols-2 gap-2 md:gap-6">
                  {/* Home Team Events Skeleton */}
                  <div className="space-y-2 md:space-y-4">
                    {Array.from({ length: timeIdx % 2 === 0 ? 1 : 2 }).map(
                      (_, eventIdx) => (
                        <div
                          key={eventIdx}
                          className="rounded-xl border-2 border-border bg-muted/50 dark:bg-muted/30 p-2 md:p-3 shadow-inner"
                        >
                          {/* Event Type Header Skeleton */}
                          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                            <Skeleton className="w-6 h-6 md:w-7 md:h-7 rounded-lg flex-shrink-0" />
                            <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                          </div>

                          {/* Player Info Skeleton */}
                          <div className="space-y-1 md:space-y-1.5">
                            <div className="flex items-center gap-1.5 md:gap-2">
                              <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
                              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                            </div>

                            {/* Optional Assist Skeleton (random) */}
                            {timeIdx % 3 === 0 && (
                              <div className="flex items-center gap-1.5 md:gap-2">
                                <Skeleton className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                                <Skeleton className="h-3 w-28 md:w-36" />
                              </div>
                            )}

                            {/* Optional Comments Skeleton (random) */}
                            {timeIdx % 4 === 0 && (
                              <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-border">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4 mt-1" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* Away Team Events Skeleton */}
                  <div className="space-y-2 md:space-y-4">
                    {Array.from({ length: timeIdx % 2 === 1 ? 1 : 2 }).map(
                      (_, eventIdx) => (
                        <div
                          key={eventIdx}
                          className="rounded-xl border-2 border-border bg-muted/50 dark:bg-muted/30 p-2 md:p-3 shadow-inner"
                        >
                          {/* Event Type Header Skeleton */}
                          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 flex-row-reverse">
                            <Skeleton className="w-6 h-6 md:w-7 md:h-7 rounded-lg flex-shrink-0" />
                            <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                          </div>

                          {/* Player Info Skeleton */}
                          <div className="space-y-1 md:space-y-1.5 text-right">
                            <div className="flex items-center gap-1.5 md:gap-2 flex-row-reverse">
                              <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
                              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                            </div>

                            {/* Optional Assist Skeleton (random) */}
                            {timeIdx % 3 === 1 && (
                              <div className="flex items-center gap-1.5 md:gap-2 flex-row-reverse">
                                <Skeleton className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
                                <Skeleton className="h-3 w-28 md:w-36" />
                              </div>
                            )}

                            {/* Optional Comments Skeleton (random) */}
                            {timeIdx % 4 === 1 && (
                              <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-border">
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4 mt-1 ml-auto" />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !eventsData || !eventsData.response) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message={error || "No events data available"}
          helpText="Events are usually available once the match starts or shortly after."
        />
      </FullPage>
    );
  }

  const events = eventsData.response;

  if (events.length === 0) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message="No events available for this fixture."
          helpText="Events are usually available once the match starts or shortly after."
        />
      </FullPage>
    );
  }

  // Group events by time (elapsed minute)
  const eventsByTime = new Map<number, FixtureEventsResponseItem[]>();
  events.forEach((event) => {
    const timeKey = event.time.elapsed;
    if (!eventsByTime.has(timeKey)) {
      eventsByTime.set(timeKey, []);
    }
    eventsByTime.get(timeKey)!.push(event);
  });

  // Sort by time (descending - latest first)
  const sortedTimes = Array.from(eventsByTime.keys()).sort((a, b) => b - a);

  function renderEvent(event: FixtureEventsResponseItem) {
    const styles = getEventStyles(event.type, event.detail);
    const isHomeTeam = homeTeamId ? event.team.id === homeTeamId : false;

    return (
      <div
        key={`${event.time.elapsed}-${event.team.id}-${event.player.id}-${event.type}-${event.detail}`}
        className="group  relative"
      >
        {/* Event Content */}
        <div
          className={` rounded-xl border-2 ${styles.border} ${
            styles.bg
          } p-2 md:p-3 shadow-inner ${styles.shadow} ${
            isHomeTeam ? "text-left" : "text-right"
          }`}
        >
          {/* Event Type Header */}
          <div
            className={`flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2 ${
              isHomeTeam ? "flex-row" : "flex-row-reverse"
            }`}
          >
            <div
              className={`flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg ${styles.iconBg} text-white shadow-sm flex-shrink-0`}
            >
              {getEventIcon(event.type, event.detail)}
            </div>
            <span
              className={`text-xs md:text-sm font-bold ${styles.text} truncate`}
            >
              {event.detail}
            </span>
          </div>

          {/* Player Info */}
          <div
            className={`space-y-1 md:space-y-1.5 ${
              isHomeTeam ? "text-left" : "text-right"
            }`}
          >
            <div
              className={`flex items-center gap-1.5 md:gap-2 ${
                isHomeTeam ? "flex-row" : "flex-row-reverse"
              }`}
            >
              <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                {event.player.name}
              </p>
            </div>

            {/* Assist */}
            {event.assist.name && (
              <div
                className={`flex items-center gap-1.5 md:gap-2 ${
                  isHomeTeam ? "flex-row" : "flex-row-reverse"
                } text-xs text-muted-foreground`}
              >
                <ArrowRight className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="font-medium truncate">
                  Assist: {event.assist.name}
                </span>
              </div>
            )}

            {/* Comments */}
            {event.comments && (
              <div
                className={`mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t ${styles.border} opacity-50`}
              >
                <p className="text-xs text-muted-foreground italic leading-relaxed break-words">
                  {event.comments}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-base md:text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Match Events
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground">
          {eventsData.results} event{eventsData.results !== 1 ? "s" : ""}{" "}
          recorded
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line - visible on all screen sizes */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 md:w-1 bg-gradient-to-b from-border via-border to-border -translate-x-1/2" />

        {/* Events Container */}
        <div className="space-y-1">
          {sortedTimes.map((time) => {
            const timeEvents = eventsByTime.get(time)!;
            const firstEvent = timeEvents[0];
            const homeEvents = homeTeamId
              ? timeEvents.filter((event) => event.team.id === homeTeamId)
              : [];
            const awayEvents = awayTeamId
              ? timeEvents.filter((event) => event.team.id === awayTeamId)
              : [];

            return (
              <div key={time} className="relative">
                {/* Time Badge with connection to timeline */}
                <div className="flex  items-center justify-center mb-3 md:mb-6">
                  <div className="relative">
                    {/* Connection line to timeline */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 md:w-12 h-0.5  bg-border" />
                    <div className="relative bg-card border-2 border-border rounded-full px-2  md:px-3 md:py-1 shadow-md z-10 backdrop-blur-sm">
                      <span className="text-xs md:text-sm font-bold text-foreground">
                        {formatTime(
                          firstEvent.time.elapsed,
                          firstEvent.time.extra
                        )}
                        &apos;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Events at this time */}
                <div className="grid grid-cols-2 gap-2 md:gap-6">
                  {/* Home Team Events */}
                  <div className="space-y-2 md:space-y-4 ">
                    {homeEvents.length > 0 ? (
                      homeEvents.map((event) => renderEvent(event))
                    ) : (
                      <div className="h-full min-h-[40px] md:min-h-[60px] flex items-center justify-center">
                        <div className="text-xs text-muted-foreground/50 italic">
                          No events
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Away Team Events */}
                  <div className="space-y-2 md:space-y-4">
                    {awayEvents.length > 0 ? (
                      awayEvents.map((event) => renderEvent(event))
                    ) : (
                      <div className="h-full min-h-[40px] md:min-h-[60px] flex items-center justify-center">
                        <div className="text-xs text-muted-foreground/50 italic">
                          No events
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
