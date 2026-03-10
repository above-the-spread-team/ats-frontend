"use client";

import Image from "next/image";
import Link from "next/link";
import { useWorldCupStandings } from "@/services/football-api/world-cup-standings";
import type { StandingEntry } from "@/type/footballapi/standing";
import { Skeleton } from "@/components/ui/skeleton";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getFormColor(char: string) {
  if (char === "W") return "bg-green-500/20 text-green-500 dark:text-green-400";
  if (char === "D")
    return "bg-yellow-500/20 text-yellow-500 dark:text-yellow-400";
  if (char === "L") return "bg-red-500/20 text-red-500 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

function getDescriptionColor(desc: string | null) {
  if (!desc) return "";
  const d = desc.toLowerCase();
  if (
    d.includes("round of") ||
    d.includes("knockout") ||
    d.includes("next round") ||
    d.includes("qualify")
  )
    return "border-l-2 border-yellow-400";
  if (d.includes("elimination") || d.includes("relegated"))
    return "border-l-2 border-red-500/50";
  return "";
}

// ─── skeleton ─────────────────────────────────────────────────────────────────

function GroupSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-32 rounded" />
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-muted/40 px-3 py-2 grid grid-cols-[1.5rem_1fr_repeat(7,2rem)] sm:grid-cols-[1.5rem_1fr_repeat(9,2.5rem)] gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full rounded" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-3 py-2.5 border-t border-border flex items-center gap-3"
          >
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-24 rounded flex-1" />
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-6 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── group table ──────────────────────────────────────────────────────────────

function GroupTable({
  group,
  entries,
  leagueId,
}: {
  group: string;
  entries: StandingEntry[];
  leagueId: number;
}) {
  const sorted = [...entries].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-1.5">
      {/* Group header */}
      <div className="flex items-center gap-2 px-1">
        <span className="w-1 h-4 rounded-full bg-yellow-400 flex-shrink-0" />
        <h3 className="text-xs sm:text-sm lg:text-base font-bold">{group}</h3>
        <span className="text-[10px] lg:text-xs text-muted-foreground">
          {sorted.length} teams
        </span>
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {/* Header row */}
        <div
          className="grid items-center bg-muted/50 px-2 sm:px-3 lg:px-4 py-1.5 lg:py-2 text-[9px] sm:text-[10px] lg:text-xs font-semibold uppercase tracking-wider text-muted-foreground
            [grid-template-columns:1.2rem_1fr_1.8rem_1.8rem_1.8rem_1.8rem_2rem_2rem_2.2rem_2.5rem]
            sm:[grid-template-columns:1.2rem_1fr_1.8rem_1.8rem_1.8rem_1.8rem_2rem_2rem_2.2rem_2.5rem_5.5rem]
            lg:[grid-template-columns:1.5rem_1fr_2.2rem_2.2rem_2.2rem_2.2rem_2.5rem_2.5rem_2.8rem_3rem_7rem]"
        >
          <span className="text-center">#</span>
          <span className="pl-1">Team</span>
          <span className="text-center">P</span>
          <span className="text-center">W</span>
          <span className="text-center">D</span>
          <span className="text-center">L</span>
          <span className="text-center">GF</span>
          <span className="text-center">GA</span>
          <span className="text-center font-bold">GD</span>
          <span className="text-center font-bold text-foreground">Pts</span>
          <span className="hidden sm:block text-center">Form</span>
        </div>

        {/* Data rows */}
        {sorted.map((entry, idx) => {
          const descClass = getDescriptionColor(entry.description);
          return (
            <Link
              key={entry.team.id}
              href={`/stats/${leagueId}/${entry.team.id}?season=2026`}
              className={`grid items-center px-2 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 border-t border-border/60 transition-colors hover:bg-muted/40 cursor-pointer
                [grid-template-columns:1.2rem_1fr_1.8rem_1.8rem_1.8rem_1.8rem_2rem_2rem_2.2rem_2.5rem]
                sm:[grid-template-columns:1.2rem_1fr_1.8rem_1.8rem_1.8rem_1.8rem_2rem_2rem_2.2rem_2.5rem_5.5rem]
                lg:[grid-template-columns:1.5rem_1fr_2.2rem_2.2rem_2.2rem_2.2rem_2.5rem_2.5rem_2.8rem_3rem_7rem]
                ${descClass} ${idx === 0 ? "bg-yellow-500/5" : ""}`}
            >
              {/* Rank */}
              <span className="text-[10px] sm:text-xs lg:text-sm font-bold text-center text-muted-foreground">
                {entry.rank}
              </span>

              {/* Team */}
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 pl-1">
                {entry.team.logo ? (
                  <Image
                    src={entry.team.logo}
                    alt={entry.team.name}
                    width={24}
                    height={24}
                    className="object-contain flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                  />
                ) : (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full bg-muted flex-shrink-0" />
                )}
                <span className="text-[10px] hidden sm:block sm:text-xs lg:text-sm font-semibold truncate">
                  {entry.team.name}
                </span>
              </div>

              {/* Stats */}
              <span className="text-[10px] sm:text-xs lg:text-sm text-center text-muted-foreground">
                {entry.all.played}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm text-center text-muted-foreground">
                {entry.all.win}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm text-center text-muted-foreground">
                {entry.all.draw}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm text-center text-muted-foreground">
                {entry.all.lose}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm text-center text-muted-foreground">
                {entry.all.goals.for}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm text-center text-muted-foreground">
                {entry.all.goals.against}
              </span>
              <span
                className={`text-[10px] sm:text-xs lg:text-sm text-center font-semibold ${
                  entry.goalsDiff > 0
                    ? "text-green-600 dark:text-green-400"
                    : entry.goalsDiff < 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-muted-foreground"
                }`}
              >
                {entry.goalsDiff > 0 ? "+" : ""}
                {entry.goalsDiff}
              </span>

              {/* Points */}
              <span className="text-xs sm:text-sm lg:text-base font-black text-foreground text-center">
                {entry.points}
              </span>

              {/* Form */}
              <div className="hidden sm:flex items-center justify-center gap-0.5">
                {entry.form ? (
                  entry.form
                    .split("")
                    .slice(-5)
                    .map((r, i) => (
                      <span
                        key={i}
                        className={`w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-sm text-[8px] lg:text-[9px] font-bold flex items-center justify-center ${getFormColor(r)}`}
                      >
                        {r}
                      </span>
                    ))
                ) : (
                  <span className="text-[10px] text-muted-foreground/40">
                    —
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Description legend — show if any entry has one */}
      {sorted.some((e) => e.description) && (
        <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 px-1">
          {sorted[0]?.description && (
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
              {sorted[0].description}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function WorldCupRanking() {
  const { data, isLoading, error } = useWorldCupStandings();

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8 pb-16 space-y-8">
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <GroupSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-4xl">⚠️</span>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          {error instanceof Error ? error.message : "Failed to load standings."}
        </p>
      </div>
    );
  }

  const league = data?.response?.[0]?.league;
  const groups = league?.standings ?? [];

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <span className="text-5xl">🏆</span>
        <p className="text-sm text-muted-foreground">
          Group standings not available yet.
        </p>
        <p className="text-xs text-muted-foreground/60">
          FIFA World Cup 2026 · Group stage begins 11 Jun
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8 pb-16 space-y-6">
      {/* Meta bar */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs text-muted-foreground font-medium">
          {groups.length} groups · {groups.flat().length} teams
        </span>
        <span className="text-[12px] text-muted-foreground/80 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          Yellow bar = advances to knockout stage
        </span>
      </div>

      {/* Two-column grid on md+, single column on mobile */}
      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {groups.map((group, idx) => {
          const groupName = group[0]?.group ?? `Group ${idx + 1}`;
          return (
            <GroupTable
              key={groupName}
              group={groupName}
              entries={group}
              leagueId={league?.id ?? 1}
            />
          );
        })}
      </div>
    </div>
  );
}
