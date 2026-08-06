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

// ─── Confederation mapping ───────────────────────────────────────────────────
// Names normalized lowercase for a forgiving lookup across api-sports variants.

type Confed =
  | "UEFA"
  | "CONMEBOL"
  | "AFC"
  | "CAF"
  | "CONCACAF"
  | "OFC"
  | "Other";

const CONFED_BY_COUNTRY: Record<string, Confed> = {
  // UEFA
  england: "UEFA",
  france: "UEFA",
  germany: "UEFA",
  spain: "UEFA",
  italy: "UEFA",
  netherlands: "UEFA",
  portugal: "UEFA",
  belgium: "UEFA",
  croatia: "UEFA",
  denmark: "UEFA",
  poland: "UEFA",
  switzerland: "UEFA",
  serbia: "UEFA",
  austria: "UEFA",
  ukraine: "UEFA",
  turkey: "UEFA",
  sweden: "UEFA",
  "czech-republic": "UEFA",
  "czech republic": "UEFA",
  czechia: "UEFA",
  wales: "UEFA",
  scotland: "UEFA",
  hungary: "UEFA",
  romania: "UEFA",
  norway: "UEFA",
  slovakia: "UEFA",
  slovenia: "UEFA",
  ireland: "UEFA",
  greece: "UEFA",
  finland: "UEFA",
  iceland: "UEFA",
  "bosnia and herzegovina": "UEFA",
  albania: "UEFA",
  israel: "UEFA",
  "north macedonia": "UEFA",
  georgia: "UEFA",
  "northern ireland": "UEFA",
  russia: "UEFA",
  bulgaria: "UEFA",
  montenegro: "UEFA",
  // CONMEBOL
  argentina: "CONMEBOL",
  brazil: "CONMEBOL",
  uruguay: "CONMEBOL",
  colombia: "CONMEBOL",
  paraguay: "CONMEBOL",
  ecuador: "CONMEBOL",
  chile: "CONMEBOL",
  peru: "CONMEBOL",
  bolivia: "CONMEBOL",
  venezuela: "CONMEBOL",
  // CAF
  morocco: "CAF",
  senegal: "CAF",
  tunisia: "CAF",
  egypt: "CAF",
  nigeria: "CAF",
  algeria: "CAF",
  ghana: "CAF",
  "ivory coast": "CAF",
  "ivory-coast": "CAF",
  "côte d'ivoire": "CAF",
  "cote d'ivoire": "CAF",
  cameroon: "CAF",
  "south africa": "CAF",
  "south-africa": "CAF",
  mali: "CAF",
  "dr congo": "CAF",
  "congo dr": "CAF",
  "burkina faso": "CAF",
  "burkina-faso": "CAF",
  "cape verde": "CAF",
  "cape-verde": "CAF",
  gabon: "CAF",
  zambia: "CAF",
  kenya: "CAF",
  uganda: "CAF",
  namibia: "CAF",
  angola: "CAF",
  // AFC
  japan: "AFC",
  "korea republic": "AFC",
  "south korea": "AFC",
  "south-korea": "AFC",
  "republic of korea": "AFC",
  iran: "AFC",
  "ir iran": "AFC",
  "saudi arabia": "AFC",
  "saudi-arabia": "AFC",
  australia: "AFC",
  qatar: "AFC",
  iraq: "AFC",
  uae: "AFC",
  "united arab emirates": "AFC",
  "united-arab-emirates": "AFC",
  uzbekistan: "AFC",
  jordan: "AFC",
  china: "AFC",
  "china pr": "AFC",
  thailand: "AFC",
  vietnam: "AFC",
  india: "AFC",
  indonesia: "AFC",
  // CONCACAF
  usa: "CONCACAF",
  "united states": "CONCACAF",
  "united-states": "CONCACAF",
  mexico: "CONCACAF",
  canada: "CONCACAF",
  "costa rica": "CONCACAF",
  "costa-rica": "CONCACAF",
  panama: "CONCACAF",
  jamaica: "CONCACAF",
  honduras: "CONCACAF",
  "el salvador": "CONCACAF",
  "el-salvador": "CONCACAF",
  curacao: "CONCACAF",
  curaçao: "CONCACAF",
  haiti: "CONCACAF",
  // OFC
  "new zealand": "OFC",
  "new-zealand": "OFC",
  "solomon islands": "OFC",
  "solomon-islands": "OFC",
  fiji: "OFC",
  "papua new guinea": "OFC",
  "papua-new-guinea": "OFC",
  tahiti: "OFC",
};

function getConfederation(country: string | null | undefined): Confed {
  if (!country) return "Other";
  return CONFED_BY_COUNTRY[country.trim().toLowerCase()] ?? "Other";
}

const CONFED_META: Record<
  Confed,
  { label: string; full: string; stripe: string; chip: string; dot: string }
> = {
  UEFA: {
    label: "UEFA",
    full: "Europe",
    stripe: "bg-sky-500",
    chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
    dot: "bg-sky-500",
  },
  CONMEBOL: {
    label: "CONMEBOL",
    full: "South America",
    stripe: "bg-amber-500",
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dot: "bg-amber-500",
  },
  AFC: {
    label: "AFC",
    full: "Asia",
    stripe: "bg-red-500",
    chip: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25",
    dot: "bg-red-500",
  },
  CAF: {
    label: "CAF",
    full: "Africa",
    stripe: "bg-emerald-500",
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  CONCACAF: {
    label: "CONCACAF",
    full: "N. & C. America",
    stripe: "bg-violet-500",
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25",
    dot: "bg-violet-500",
  },
  OFC: {
    label: "OFC",
    full: "Oceania",
    stripe: "bg-teal-500",
    chip: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/25",
    dot: "bg-teal-500",
  },
  Other: {
    label: "Other",
    full: "Other",
    stripe: "bg-muted-foreground/40",
    chip: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/40",
  },
};

const CONFED_ORDER: Confed[] = [
  "UEFA",
  "CONMEBOL",
  "AFC",
  "CAF",
  "CONCACAF",
  "OFC",
  "Other",
];

// ─── inline icons ────────────────────────────────────────────────────────────

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  );
}

// ─── team logo with error fallback ───────────────────────────────────────────

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

// ─── Host nation banner card ─────────────────────────────────────────────────

function HostCard({ item }: { item: TeamResponseItem }) {
  const { team, venue } = item;
  const flag = HOST_FLAGS[team.id] ?? "🏳️";

  return (
    <Link
      href={`/stats/${LEAGUE_ID}/${team.id}?season=${SEASON}`}
      className="group block"
    >
      <div className="relative overflow-hidden h-full rounded-2xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-amber-400/5 to-transparent p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-400/15 hover:border-amber-400/70">
        {/* Soft glow */}
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"
        />

        <div className="relative flex items-start gap-3.5 sm:gap-4">
          {/* Logo */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
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

          {/* Copy */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="text-base leading-none"
                aria-hidden
                style={{ fontFamily: "system-ui" }}
              >
                {flag}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400">
                Host nation
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {team.name}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {venue.name ?? team.country}
              {venue.capacity
                ? ` · ${(venue.capacity / 1000).toFixed(0)}k seats`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── regular team card ───────────────────────────────────────────────────────

function TeamCard({ item }: { item: TeamResponseItem }) {
  const { team } = item;
  const confed = getConfederation(team.country);
  const meta = CONFED_META[confed];

  return (
    <Link
      href={`/stats/${LEAGUE_ID}/${team.id}?season=${SEASON}`}
      className="group block h-full"
    >
      <div className="relative h-full flex flex-col items-stretch rounded-xl bg-card border border-border/70 hover:border-border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
        {/* Confederation top stripe */}
        <span
          aria-hidden
          className={`h-[3px] w-full ${meta.stripe} opacity-70 group-hover:opacity-100 transition-opacity`}
        />

        <div className="p-3 sm:p-3.5 flex flex-col items-center gap-2 text-center h-full">
          {/* Logo */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 mt-1 group-hover:scale-[1.04] transition-transform duration-200">
            {team.logo ? (
              <TeamLogo src={team.logo} name={team.name} />
            ) : (
              <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center">
                <span className="text-sm font-black text-muted-foreground">
                  {team.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="text-[13px] sm:text-sm font-bold text-foreground leading-tight line-clamp-2 min-h-[2.2em]">
            {team.name}
          </h3>

          {/* Code + confed chip */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {team.code && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-md tracking-wide">
                {team.code}
              </span>
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded-md ${meta.chip}`}
              title={meta.full}
            >
              {meta.label}
            </span>
          </div>

          {/* Meta (secondary, only if there's room) */}
          {team.founded && (
            <p className="text-[10px] text-muted-foreground/70 mt-auto pt-1">
              Est. {team.founded}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── skeleton card ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden">
      <Skeleton className="h-[3px] w-full rounded-none" />
      <div className="p-3 flex flex-col items-center gap-2">
        <Skeleton className="w-12 h-12 rounded-xl mt-1" />
        <Skeleton className="h-3 w-3/4 rounded" />
        <div className="flex gap-1.5">
          <Skeleton className="h-3 w-8 rounded-md" />
          <Skeleton className="h-3 w-10 rounded-md" />
        </div>
        <Skeleton className="h-2.5 w-1/2 rounded mt-1" />
      </div>
    </div>
  );
}

// ─── filter chip ─────────────────────────────────────────────────────────────

function FilterChip({
  label,
  count,
  active,
  onClick,
  dotClass,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  dotClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex-shrink-0 inline-flex items-center gap-1.5 h-8 sm:h-9 px-3 rounded-full text-xs font-bold transition-all duration-150 ${
        active
          ? "bg-foreground text-background shadow-sm"
          : "bg-muted/60 text-foreground/80 hover:bg-muted border border-transparent hover:border-border"
      }`}
    >
      {dotClass && (
        <span
          aria-hidden
          className={`w-1.5 h-1.5 rounded-full ${dotClass} ${
            active ? "opacity-100" : "opacity-80"
          }`}
        />
      )}
      <span>{label}</span>
      <span
        className={`text-[10px] font-semibold tabular-nums ${
          active ? "text-background/70" : "text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// ─── page ────────────────────────────────────────────────────────────────────

export default function WorldCupTeams() {
  const { data, isLoading, error } = useWorldCupTeams();
  const [search, setSearch] = useState("");
  const [confedFilter, setConfedFilter] = useState<Confed | "ALL">("ALL");

  const allTeams = useMemo(
    () =>
      [...(data?.response ?? [])].sort((a, b) =>
        a.team.name.localeCompare(b.team.name),
      ),
    [data?.response],
  );

  // Full confederation counts (unaffected by active filter, reflects search only)
  const confedCounts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searched = q
      ? allTeams.filter(
          (t) =>
            t.team.name.toLowerCase().includes(q) ||
            t.team.code?.toLowerCase().includes(q) ||
            t.team.country?.toLowerCase().includes(q),
        )
      : allTeams;

    const counts: Record<Confed | "ALL", number> = {
      ALL: searched.length,
      UEFA: 0,
      CONMEBOL: 0,
      AFC: 0,
      CAF: 0,
      CONCACAF: 0,
      OFC: 0,
      Other: 0,
    };
    for (const t of searched) {
      counts[getConfederation(t.team.country)] += 1;
    }
    return counts;
  }, [allTeams, search]);

  const visibleTeams = useMemo(() => {
    const q = search.trim().toLowerCase();
    let teams = allTeams;
    if (q) {
      teams = teams.filter(
        (t) =>
          t.team.name.toLowerCase().includes(q) ||
          t.team.code?.toLowerCase().includes(q) ||
          t.team.country?.toLowerCase().includes(q),
      );
    }
    if (confedFilter !== "ALL") {
      teams = teams.filter(
        (t) => getConfederation(t.team.country) === confedFilter,
      );
    }
    return teams;
  }, [allTeams, search, confedFilter]);

  const hosts = visibleTeams.filter((t) => HOST_IDS.has(t.team.id));
  const qualified = visibleTeams.filter((t) => !HOST_IDS.has(t.team.id));

  // Group qualified by confederation only when "ALL" filter is active.
  const qualifiedByConfed = useMemo(() => {
    const map = new Map<Confed, TeamResponseItem[]>();
    for (const t of qualified) {
      const c = getConfederation(t.team.country);
      if (!map.has(c)) map.set(c, []);
      map.get(c)!.push(t);
    }
    return CONFED_ORDER.filter((c) => map.has(c)).map((c) => ({
      confed: c,
      teams: map.get(c)!,
    }));
  }, [qualified]);

  const totalAll = data?.results ?? 0;
  const confedTally = useMemo(() => {
    const counts = new Set<Confed>();
    for (const t of allTeams) counts.add(getConfederation(t.team.country));
    counts.delete("Other");
    return counts.size;
  }, [allTeams]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8 pb-20 space-y-6 sm:space-y-8">
      {/* ── Hero ── */}
      <header className=" flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex items-start flex-col  gap-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              Teams · World Cup 2026
            </span>
          </div>
          <h1 className="text-md sm:text-lg lg:text-xl font-black tracking-tight leading-[1.05] max-w-xl">
            48 nations,
            <span className="text-muted-foreground/70"> one trophy.</span>
          </h1>
        </div>
        {/* Stats strip */}
        <div className="flex items-center divide-x divide-border/80 rounded-xl border border-border/70 bg-card overflow-hidden text-center">
          <div className="px-3 sm:px-4 py-2">
            <p className="text-lg sm:text-xl font-black leading-none tabular-nums">
              {isLoading ? "—" : totalAll}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              Teams
            </p>
          </div>
          <div className="px-3 sm:px-4 py-2">
            <p className="text-lg sm:text-xl font-black leading-none tabular-nums">
              {isLoading ? "—" : confedTally || 6}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              Confeds
            </p>
          </div>
          <div className="px-3 sm:px-4 py-2">
            <p className="text-lg sm:text-xl font-black leading-none tabular-nums">
              3
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              Hosts
            </p>
          </div>
        </div>
      </header>

      {/* ── Controls ── */}
      <div className="space-y-3 sticky top-2 z-20 sm:static">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team, code, or country…"
            className="w-full h-10 sm:h-11 pl-10 pr-10 text-sm rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary-font/30 focus:border-primary-font/40 transition-colors shadow-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Confederation filter chips — horizontal scroll on mobile */}
        <div className="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 sm:gap-2 w-max sm:w-auto sm:flex-wrap">
            <FilterChip
              label="All"
              count={confedCounts.ALL}
              active={confedFilter === "ALL"}
              onClick={() => setConfedFilter("ALL")}
            />
            {CONFED_ORDER.filter(
              (c) => c !== "Other" || confedCounts.Other > 0,
            ).map((c) => (
              <FilterChip
                key={c}
                label={CONFED_META[c].label}
                count={confedCounts[c]}
                active={confedFilter === c}
                dotClass={CONFED_META[c].dot}
                onClick={() => setConfedFilter(c)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 rounded-2xl border border-border/70 bg-card">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <XCircleIcon className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            {error instanceof Error ? error.message : "Failed to load teams."}
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4"
              >
                <div className="flex items-start gap-3.5">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-2.5 w-20 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && !error && visibleTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3 rounded-2xl border border-dashed border-border bg-card/50">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <SearchIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">No teams found</p>
          <p className="text-xs text-muted-foreground text-center max-w-xs -mt-1">
            {search.trim()
              ? `Nothing matches "${search}"`
              : `No teams in ${confedFilter !== "ALL" ? CONFED_META[confedFilter].label : "this filter"} yet.`}
          </p>
          {(search.trim() || confedFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setConfedFilter("ALL");
              }}
              className="text-xs font-semibold text-primary-font hover:opacity-70 underline underline-offset-2"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* ── Host nations ── */}
      {!isLoading && !error && hosts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-3.5 w-1 rounded-full bg-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-[0.14em]">
              Host nations
            </h2>
            <span className="text-[11px] text-muted-foreground">
              ({hosts.length})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {hosts.map((item) => (
              <HostCard key={item.team.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ── Qualified teams ── */}
      {!isLoading && !error && qualified.length > 0 && (
        <>
          {confedFilter === "ALL" ? (
            // Grouped by confederation
            <div className="space-y-6 sm:space-y-8">
              {qualifiedByConfed.map(({ confed, teams }) => {
                const meta = CONFED_META[confed];
                return (
                  <section key={confed} className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`h-3.5 w-1 rounded-full ${meta.stripe}`}
                      />
                      <h2 className="text-sm font-black uppercase tracking-[0.14em]">
                        {meta.label}
                      </h2>
                      <span className="text-[11px] text-muted-foreground/80">
                        {meta.full}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {teams.length} team{teams.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {teams.map((item) => (
                        <TeamCard key={item.team.id} item={item} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            // Flat grid when a specific confederation is selected
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`h-3.5 w-1 rounded-full ${
                    CONFED_META[confedFilter].stripe
                  }`}
                />
                <h2 className="text-sm font-black uppercase tracking-[0.14em]">
                  {CONFED_META[confedFilter].label}
                </h2>
                <span className="text-[11px] text-muted-foreground/80">
                  {CONFED_META[confedFilter].full}
                </span>
                <span className="text-[11px] text-muted-foreground ml-auto">
                  {qualified.length} team{qualified.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {qualified.map((item) => (
                  <TeamCard key={item.team.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
