"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWorldCupTeams } from "@/services/football-api/world-cup-teams";
import type { TeamResponseItem } from "@/type/footballapi/teams-info";
import { Skeleton } from "@/components/ui/skeleton";

const LEAGUE_ID = 1;
const SEASON = 2026;

const HOST_IDS = new Set([5529, 16, 2384]); // Canada, Mexico, USA
const HOST_FLAGS: Record<number, string> = {
  5529: "🇨🇦",
  16: "🇲🇽",
  2384: "🇺🇸",
};

// ─── team logo with error fallback ────────────────────────────────────────────

function TeamLogo({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (error) {
    return (
      <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center">
        <span className="text-sm sm:text-base font-black text-muted-foreground">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      className="object-contain drop-shadow-sm"
      sizes="(max-width: 640px) 56px, 72px"
      onError={() => setError(true)}
    />
  );
}

// ─── section header ───────────────────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  accent = "yellow",
}: {
  label: string;
  count: number;
  accent?: "yellow" | "blue";
}) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span
        className={`w-1 h-5 rounded-full flex-shrink-0 ${
          accent === "yellow" ? "bg-primary-font" : "bg-blue-400"
        }`}
      />
      <h2 className="text-sm sm:text-base lg:text-lg font-bold">{label}</h2>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

// ─── host team card (gold treatment) ─────────────────────────────────────────

function HostTeamCard({ item }: { item: TeamResponseItem }) {
  const { team, venue } = item;
  const flag = HOST_FLAGS[team.id] ?? "🏳️";

  return (
    <Link
      href={`/stats/${LEAGUE_ID}/${team.id}?season=${SEASON}`}
      className="group block h-full"
    >
      <div className="relative h-full flex flex-col items-center text-center gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 rounded-xl bg-card border border-primary-font/40 hover:border-primary-font/80 hover:bg-primary-font/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-font/10 overflow-hidden cursor-pointer">
        {/* Shimmer background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-font/8 via-transparent to-transparent pointer-events-none rounded-xl" />

        {/* Host badge */}
        <span className="absolute top-2 right-2 flex items-center gap-1 bg-primary-font/15 border border-primary-font/30 text-primary-font text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
          <span>{flag}</span>
          Host
        </span>

        {/* Logo */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
          {team.logo ? (
            <TeamLogo src={team.logo} name={team.name} />
          ) : (
            <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center">
              <span className="text-lg font-black text-muted-foreground">
                {team.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name + code */}
        <div className="flex flex-col items-center gap-1.5 min-w-0 w-full">
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary-font transition-colors duration-200 leading-tight">
            {team.name}
          </h3>
          {team.code && (
            <span className="text-[10px] sm:text-xs font-bold text-primary-font bg-primary-font/10 border border-primary-font/20 px-2 py-0.5 rounded-full">
              {team.code}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-col items-center gap-1 mt-auto w-full">
          {team.founded && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/90">
              Est. {team.founded}
            </p>
          )}
          {venue.name && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/80 truncate w-full">
              {venue.name}
            </p>
          )}
          {venue.city && (
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/70">
              {venue.city}
              {venue.capacity
                ? ` · ${venue.capacity.toLocaleString()} cap.`
                : ""}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── team card ────────────────────────────────────────────────────────────────

function TeamCard({ item }: { item: TeamResponseItem }) {
  const { team, venue } = item;

  return (
    <Link
      href={`/stats/${LEAGUE_ID}/${team.id}?season=${SEASON}`}
      className="group block h-full"
    >
      <div className="relative h-full flex flex-col items-center text-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl bg-card border border-border/60 hover:border-primary-font/40 hover:bg-muted/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden cursor-pointer">
        {/* Subtle glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-font/0 to-primary-font/0 group-hover:from-primary-font/5 group-hover:to-transparent transition-all duration-300 rounded-xl pointer-events-none" />

        {/* Logo */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
          {team.logo ? (
            <TeamLogo src={team.logo} name={team.name} />
          ) : (
            <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center">
              <span className="text-base font-black text-muted-foreground">
                {team.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name + code */}
        <div className="flex flex-col items-center gap-1 min-w-0 w-full">
          <h3 className="text-xs sm:text-sm lg:text-base font-bold text-foreground line-clamp-2 group-hover:text-primary-font transition-colors duration-200 leading-tight">
            {team.name}
          </h3>
          {team.code && (
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {team.code}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-col items-center gap-1 mt-auto w-full">
          {team.founded && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/90">
              Est. {team.founded}
            </p>
          )}
          {venue.name && (
            <p className="text-[10px] sm:text-xs text-muted-foreground/60 truncate w-full">
              {venue.name}
            </p>
          )}
          {venue.capacity && (
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/50">
              {venue.capacity.toLocaleString()} cap.
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/60 bg-card">
      <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl" />
      <Skeleton className="h-3.5 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/3 rounded-full" />
      <div className="flex flex-col items-center gap-1.5 w-full mt-1">
        <Skeleton className="h-2.5 w-1/2 rounded" />
        <Skeleton className="h-2.5 w-2/3 rounded" />
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function WorldCupTeams() {
  const { data, isLoading, error } = useWorldCupTeams();
  const [search, setSearch] = useState("");

  const { hosts, qualified } = useMemo(() => {
    const sorted = [...(data?.response ?? [])].sort((a, b) =>
      a.team.name.localeCompare(b.team.name),
    );
    const q = search.trim().toLowerCase();
    const filtered = q
      ? sorted.filter(
          (t) =>
            t.team.name.toLowerCase().includes(q) ||
            t.team.code?.toLowerCase().includes(q) ||
            t.team.country?.toLowerCase().includes(q),
        )
      : sorted;
    return {
      hosts: filtered.filter((t) => HOST_IDS.has(t.team.id)),
      qualified: filtered.filter((t) => !HOST_IDS.has(t.team.id)),
    };
  }, [data?.response, search]);

  const totalFiltered = hosts.length + qualified.length;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8 pb-16 space-y-5">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs lg:text-sm text-muted-foreground font-medium">
            {isLoading
              ? "Loading…"
              : `${data?.results ?? 0} teams · FIFA World Cup 2026`}
          </span>
          {!isLoading && search.trim() && (
            <span className="text-[10px] text-muted-foreground/60">
              {totalFiltered} match{totalFiltered !== 1 ? "es" : ""} for &ldquo;
              {search}&rdquo;
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56 lg:w-64">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            className="w-full h-8 lg:h-9 pl-8 pr-3 text-xs lg:text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary-font/60 focus:border-primary-font/60 transition-colors"
          />
        </div>
      </div>

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-4xl">⚠️</span>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {error instanceof Error ? error.message : "Failed to load teams."}
          </p>
        </div>
      )}

      {/* Loading grid */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 48 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty search result */}
      {!isLoading && !error && totalFiltered === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">🔍</span>
          <p className="text-sm text-muted-foreground">
            No teams match &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => setSearch("")}
            className="text-xs text-primary-font hover:text-primary-font/70 underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Host Nations ── */}
      {!isLoading && !error && hosts.length > 0 && (
        <div className="space-y-3">
          <SectionHeader
            label="Host Nations"
            count={hosts.length}
            accent="yellow"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {hosts.map((item) => (
              <HostTeamCard key={item.team.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── Qualified Teams ── */}
      {!isLoading && !error && qualified.length > 0 && (
        <div className="space-y-3">
          <SectionHeader
            label="Qualified Teams"
            count={qualified.length}
            accent="blue"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {qualified.map((item) => (
              <TeamCard key={item.team.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
