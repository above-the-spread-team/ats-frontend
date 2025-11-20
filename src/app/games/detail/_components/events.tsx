"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type {
  FixtureEventsApiResponse,
  FixtureEventsResponseItem,
} from "@/type/fixture-events";
import Loading from "@/components/common/loading";
import { Target, Square, RefreshCw, Video, AlertCircle } from "lucide-react";

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
        return <Square className="w-4 h-4 text-red-500" />;
      }
      return <Square className="w-4 h-4 text-yellow-500" />;
    case "subst":
      return <RefreshCw className="w-4 h-4" />;
    case "Var":
      return <Video className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
}

function getEventColor(type: string, detail: string): string {
  switch (type) {
    case "Goal":
      return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case "Card":
      if (detail === "Red Card") {
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      }
      return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
    case "subst":
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "Var":
      return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

interface EventsProps {
  fixtureId: number;
  homeTeamId?: number;
  awayTeamId?: number;
}

export default function Events({
  fixtureId,
  homeTeamId,
  awayTeamId,
}: EventsProps) {
  const [eventsData, setEventsData] = useState<FixtureEventsApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          fixture: fixtureId.toString(),
        });

        const response = await fetch(
          `/api/fixture-events?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to load fixture events (${response.status})`);
        }

        const data = (await response.json()) as FixtureEventsApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        setEventsData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setEventsData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvents();

    return () => {
      controller.abort();
    };
  }, [fixtureId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
    );
  }

  if (error || !eventsData || !eventsData.response) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No events data available"}
        </p>
      </div>
    );
  }

  const events = eventsData.response;

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No events available for this fixture.
        </p>
      </div>
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

  // Sort by time
  const sortedTimes = Array.from(eventsByTime.keys()).sort((a, b) => a - b);

  function renderEvent(event: FixtureEventsResponseItem) {
    const eventColor = getEventColor(event.type, event.detail);
    const isHomeTeam = homeTeamId ? event.team.id === homeTeamId : false;

    return (
      <div
        key={`${event.time.elapsed}-${event.team.id}-${event.player.id}-${event.type}-${event.detail}`}
        className={`flex items-start gap-3 ${
          isHomeTeam ? "flex-row" : "flex-row-reverse"
        }`}
      >
        {/* Team Logo */}
        <div className="flex-shrink-0">
          {event.team.logo ? (
            <Image
              src={event.team.logo}
              alt={event.team.name}
              width={32}
              height={32}
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
            />
          ) : (
            <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
              {getInitials(event.team.name)}
            </div>
          )}
        </div>

        {/* Event Content */}
        <div
          className={`flex-1 rounded-lg border p-2 md:p-3 ${eventColor} ${
            isHomeTeam ? "text-left" : "text-right"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-shrink-0">
              {getEventIcon(event.type, event.detail)}
            </div>
            <span className="text-xs md:text-sm font-semibold">
              {event.detail}
            </span>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs md:text-sm font-medium">
              {event.player.name}
            </p>
            {event.assist.name && (
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Assist: {event.assist.name}
              </p>
            )}
            {event.comments && (
              <p className="text-[10px] md:text-xs text-muted-foreground italic">
                {event.comments}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold">Match Events</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {eventsData.results} event{eventsData.results !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block" />

        {/* Events */}
        <div className="space-y-6">
          {sortedTimes.map((time) => {
            const timeEvents = eventsByTime.get(time)!;
            const firstEvent = timeEvents[0];

            return (
              <div key={time} className="relative">
                {/* Time Badge */}
                <div className="flex items-center justify-center mb-3">
                  <div className="bg-card border border-border rounded-full px-3 py-1 z-10">
                    <span className="text-xs md:text-sm font-semibold">
                      {formatTime(
                        firstEvent.time.elapsed,
                        firstEvent.time.extra
                      )}
                      &apos;
                    </span>
                  </div>
                </div>

                {/* Events at this time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Home Team Events */}
                  <div className="space-y-2">
                    {homeTeamId &&
                      timeEvents
                        .filter((event) => event.team.id === homeTeamId)
                        .map((event) => renderEvent(event))}
                  </div>

                  {/* Away Team Events */}
                  <div className="space-y-2">
                    {awayTeamId &&
                      timeEvents
                        .filter((event) => event.team.id === awayTeamId)
                        .map((event) => renderEvent(event))}
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
