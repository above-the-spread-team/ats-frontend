"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWorldCupFixtures } from "@/services/football-api/world-cup-fixtures";
import { getFixtureStatus } from "@/data/fixture-status";
import type { FixtureResponseItem } from "@/type/footballapi/fixture";
import { useUserTimezone } from "@/hooks/use-user-timezone";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatGoals(v: number | null) {
  return v === null || Number.isNaN(v) ? "–" : String(v);
}

function formatTime(dateStr: string, tz: string) {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: tz,
  });
}

function formatMatchDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── grouping ─────────────────────────────────────────────────────────────────

type SortMode = "date" | "stage";

interface FixtureGroup {
  label: string;
  fixtures: FixtureResponseItem[];
}

function groupByStage(fixtures: FixtureResponseItem[]): FixtureGroup[] {
  const map = new Map<string, FixtureResponseItem[]>();
  for (const f of fixtures) {
    const round = f.league.round ?? "Unknown";
    if (!map.has(round)) map.set(round, []);
    map.get(round)!.push(f);
  }

  return Array.from(map.entries())
    .map(([label, items]) => ({
      label,
      fixtures: [...items].sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime(),
      ),
    }))
    .sort((a, b) => {
      const aTime = new Date(a.fixtures[0].fixture.date).getTime();
      const bTime = new Date(b.fixtures[0].fixture.date).getTime();
      return aTime - bTime;
    });
}

function groupByDate(fixtures: FixtureResponseItem[]): FixtureGroup[] {
  const map = new Map<string, FixtureResponseItem[]>();
  for (const f of fixtures) {
    const day = new Date(f.fixture.date).toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(f);
  }

  return Array.from(map.entries())
    .map(([label, items]) => ({
      label,
      fixtures: [...items].sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() -
          new Date(b.fixture.date).getTime(),
      ),
    }))
    .sort((a, b) => {
      const aTime = new Date(a.fixtures[0].fixture.date).getTime();
      const bTime = new Date(b.fixtures[0].fixture.date).getTime();
      return aTime - bTime;
    });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ fixture }: { fixture: FixtureResponseItem }) {
  const info = getFixtureStatus(fixture.fixture.status.short);
  const isInPlay = info.type === "In Play";

  if (info.type === "Scheduled") return null;

  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
        isInPlay
          ? "bg-green-500/20 text-green-400 border border-green-500/40"
          : info.type === "Finished"
            ? "bg-muted text-muted-foreground"
            : "bg-yellow-500/15 text-yellow-500"
      }`}
    >
      {isInPlay && fixture.fixture.status.elapsed
        ? `${fixture.fixture.status.elapsed}'`
        : info.short}
    </span>
  );
}

function TeamLogo({
  logo,
  name,
  size = 40,
}: {
  logo: string | null;
  name: string;
  size?: number;
}) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={name}
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

function FixtureCard({
  fixture,
  timezone,
}: {
  fixture: FixtureResponseItem;
  timezone: string;
}) {
  const info = getFixtureStatus(fixture.fixture.status.short);
  const isInPlay = info.type === "In Play";
  const hasStarted = isInPlay || info.type === "Finished";

  return (
    <Link
      href={`/games/detail?id=${fixture.fixture.id}`}
      className={`
        group relative flex items-center gap-3 px-3 sm:px-4 lg:px-5 py-3 lg:py-4
        bg-card hover:bg-muted/40 transition-colors rounded-lg border border-border/60
        ${isInPlay ? "border-green-500/30" : ""}
      `}
    >
      {/* Live pulse bar */}
      {isInPlay && (
        <span className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl bg-primary-font/80 animate-pulse" />
      )}

      {/* Date/time column */}
      <div className="w-14 sm:w-16 lg:w-20 flex-shrink-0 text-center">
        <p className="text-[10px] sm:text-[11px] lg:text-xs text-muted-foreground leading-tight">
          {formatMatchDate(fixture.fixture.date)}
        </p>
        {!hasStarted && (
          <p className="text-xs sm:text-sm lg:text-base font-semibold mt-0.5">
            {formatTime(fixture.fixture.date, timezone)}
          </p>
        )}
        <StatusBadge fixture={fixture} />
      </div>

      {/* Home team */}
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
        <p
          className={`text-xs sm:text-sm lg:text-base font-semibold truncate text-right ${
            fixture.teams.home.winner
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {fixture.teams.home.name}
        </p>
        <TeamLogo
          logo={fixture.teams.home.logo}
          name={fixture.teams.home.name}
          size={30}
        />
      </div>

      {/* Score */}
      <div className="flex-shrink-0 w-14 sm:w-16 lg:w-20 flex items-center justify-center gap-1.5">
        {hasStarted ? (
          <>
            <span className="text-base sm:text-lg lg:text-xl font-black w-4 lg:w-5 text-center tabular-nums">
              {formatGoals(fixture.goals.home)}
            </span>
            <span className="text-muted-foreground/40 text-xs lg:text-sm">
              –
            </span>
            <span className="text-base sm:text-lg lg:text-xl font-black w-4 lg:w-5 text-center tabular-nums">
              {formatGoals(fixture.goals.away)}
            </span>
          </>
        ) : (
          <span className="text-xs lg:text-sm font-semibold text-muted-foreground/50 tracking-widest">
            vs
          </span>
        )}
      </div>

      {/* Away team */}
      <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
        <TeamLogo
          logo={fixture.teams.away.logo}
          name={fixture.teams.away.name}
          size={26}
        />
        <p
          className={`text-xs sm:text-sm lg:text-base font-semibold truncate ${
            fixture.teams.away.winner
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {fixture.teams.away.name}
        </p>
      </div>
    </Link>
  );
}

function GroupSection({
  label,
  fixtures,
  timezone,
}: {
  label: string;
  fixtures: FixtureResponseItem[];
  timezone: string;
}) {
  const completedCount = fixtures.filter(
    (f) => getFixtureStatus(f.fixture.status.short).type === "Finished",
  ).length;
  const liveCount = fixtures.filter(
    (f) => getFixtureStatus(f.fixture.status.short).type === "In Play",
  ).length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-yellow-400 flex-shrink-0" />
          <h3 className="text-xs sm:text-sm lg:text-base font-bold text-foreground">
            {label}
          </h3>
          {liveCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] lg:text-xs font-semibold text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {liveCount} live
            </span>
          )}
        </div>
        <span className="text-[10px] lg:text-xs text-muted-foreground">
          {completedCount}/{fixtures.length} played
        </span>
      </div>

      <div className="space-y-1">
        {fixtures.map((f) => (
          <FixtureCard key={f.fixture.id} fixture={f} timezone={timezone} />
        ))}
      </div>
    </div>
  );
}

/** Mirrors `FixtureCard` flex layout for loading (RWD column widths match real card). */
function FixtureCardSkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-3 sm:px-4 lg:px-5 py-3 lg:py-4 rounded-lg border border-border/60 bg-card"
      aria-hidden
    >
      <div className="w-14 sm:w-16 lg:w-20 flex-shrink-0 flex flex-col items-center gap-1.5">
        <Skeleton className="h-2.5 w-10 sm:w-11 lg:w-14 rounded" />
        <Skeleton className="h-4 w-8 sm:w-9 lg:w-11 rounded" />
      </div>
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
        <Skeleton className="h-4 w-[40%] sm:w-[45%] max-w-[140px] lg:max-w-[180px] rounded" />
        <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0" />
      </div>
      <div className="flex-shrink-0 w-14 sm:w-16 lg:w-20 flex items-center justify-center">
        <Skeleton className="h-5 w-8 lg:h-6 lg:w-10 rounded" />
      </div>
      <div className="flex-1 flex items-center justify-start gap-2 min-w-0">
        <Skeleton className="h-6 w-6 sm:h-7 sm:w-7 rounded-full flex-shrink-0" />
        <Skeleton className="h-4 w-[40%] sm:w-[45%] max-w-[140px] lg:max-w-[180px] rounded" />
      </div>
    </div>
  );
}

/** Mirrors `GroupSection`: header row + stacked fixture skeletons. */
function GroupSectionSkeleton({
  fixtureCount,
}: {
  fixtureCount: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 min-w-0">
          <Skeleton className="w-1 h-4 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 w-32 sm:w-40 lg:w-48 rounded" />
        </div>
        <Skeleton className="h-3 w-14 lg:w-16 rounded flex-shrink-0" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: fixtureCount }).map((_, i) => (
          <FixtureCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function WorldCupPageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8 pb-16 space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
        <div className="flex flex-col gap-2 min-w-0">
          <Skeleton className="h-4 w-44 sm:w-56 lg:w-64 rounded" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded flex-shrink-0" />
            <Skeleton className="h-3 w-28 sm:w-36 rounded" />
          </div>
        </div>
        <Skeleton className="h-7 lg:h-8 w-28 lg:w-32 rounded-md flex-shrink-0 self-start sm:self-auto" />
      </div>

      <GroupSectionSkeleton fixtureCount={3} />
      <GroupSectionSkeleton fixtureCount={2} />
      <GroupSectionSkeleton fixtureCount={4} />
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function WorldCupFixtures() {
  const timezone = useUserTimezone();
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const { data, isLoading, error } = useWorldCupFixtures(timezone);

  const groups = useMemo(() => {
    if (!data?.response) return [];
    return sortMode === "date"
      ? groupByDate(data.response)
      : groupByStage(data.response);
  }, [data?.response, sortMode]);

  if (isLoading) {
    return <WorldCupPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {error instanceof Error ? error.message : "Failed to load fixtures."}
        </p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-5xl">🏆</span>
        <p className="text-sm text-muted-foreground">
          No fixtures available yet.
        </p>
        <p className="text-xs text-muted-foreground/60">
          FIFA World Cup 2026 · 11 Jun – 19 Jul
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8 pb-16 space-y-8">
      {/* Meta / controls bar */}
      <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs lg:text-sm text-muted-foreground font-medium">
            {data?.results ?? 0} fixtures · {groups.length}{" "}
            {sortMode === "date" ? "days" : "stages"}
          </span>
          <span className="text-[10px] md:text-xs lg:text-xs text-muted-foreground flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l4 2m6-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0z"
              />
            </svg>
            {timezone}
          </span>
        </div>

        <Select
          value={sortMode}
          onValueChange={(v) => setSortMode(v as SortMode)}
        >
          <SelectTrigger className="h-7 lg:h-8 w-28 lg:w-32 text-xs lg:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date" className="text-xs lg:text-sm">
              By Date
            </SelectItem>
            <SelectItem value="stage" className="text-xs lg:text-sm">
              By Stage
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <GroupSection
          key={group.label}
          label={group.label}
          fixtures={group.fixtures}
          timezone={timezone}
        />
      ))}
    </div>
  );
}
