"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQueries } from "@tanstack/react-query";
import { useUserGroups, getFixtureGroup } from "@/services/fastapi/groups";
import { useFixtures } from "@/services/fastapi/vote";
import type { FixtureStatusFilter } from "@/services/fastapi/vote";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Crown,
  UserPlus,
  Calendar,
} from "lucide-react";
import type { FixtureVotesResult } from "@/type/fastapi/vote";
import type { GroupResponse } from "@/type/fastapi/groups";
import { usePathname } from "next/navigation";
import { cn, shouldShowDiscussMatchChatsInSidebar } from "@/lib/utils";
import { useSidebar } from "../_contexts/sidebar-context";
import { useMobile } from "@/hooks/use-mobile";

type FixtureSidebarRow = { fx: FixtureVotesResult; group: GroupResponse };

function leagueSortKey(name: string) {
  if (name === "Other") return "\uffff";
  return name.toLowerCase();
}

/** Overlapping home / away crests for sidebar fixture rows */
function DualTeamLogos({
  homeLogo,
  awayLogo,
  homeName,
  awayName,
}: {
  homeLogo: string | null;
  awayLogo: string | null;
  homeName: string;
  awayName: string;
}) {
  return (
    <div className="flex items-center flex-shrink-0" aria-hidden>
      <div className="relative flex items-center">
        <div className="relative z-[2] w-8 h-8 rounded-full ring-2 ring-background overflow-hidden bg-muted shadow-sm">
          {homeLogo ? (
            <Image
              src={homeLogo}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground bg-muted">
              {homeName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="relative z-[1] w-8 h-8 rounded-full ring-2 ring-background overflow-hidden bg-muted shadow-sm -ml-3">
          {awayLogo ? (
            <Image
              src={awayLogo}
              alt=""
              fill
              className="object-cover"
              sizes="32px"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-muted-foreground bg-muted">
              {awayName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { closeSidebar } = useSidebar();
  const isMobile = useMobile();

  // Use cached currentUser as the auth gate — automatically false after logout
  // without any extra network request (staleTime: 5 min, already fetched by header).
  const { data: currentUser } = useCurrentUser();
  const isAuthenticated = !!currentUser;

  // "Match chats" should be shown only when viewport is <= 960px.
  // On larger screens, the right sidebar handles voting-related browsing.
  const [showMatchChatsInSidebar, setShowMatchChatsInSidebar] = useState(() => {
    if (typeof window === "undefined") return false;
    return shouldShowDiscussMatchChatsInSidebar(window.innerWidth);
  });

  useEffect(() => {
    const update = () => {
      setShowMatchChatsInSidebar(
        shouldShowDiscussMatchChatsInSidebar(window.innerWidth),
      );
    };

    update();

    let timeoutId: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 100);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const { data: groupsData, isLoading } = useUserGroups(1, 20, isAuthenticated);

  const SIDEBAR_STATUS_FILTERS: FixtureStatusFilter[] = ["upcoming", "in_play"];

  const { data: todayFixtures = [], isLoading: loadingToday } = useFixtures(
    0,
    SIDEBAR_STATUS_FILTERS,
  );
  const { data: tomorrowFixtures = [], isLoading: loadingTomorrow } =
    useFixtures(-1, SIDEBAR_STATUS_FILTERS);

  /** Vote-synced fixtures (same pool as fixture groups); merge today + tomorrow, dedupe, sort by kickoff */
  const mergedVoteFixtures = useMemo(() => {
    const byId = new Map<number, FixtureVotesResult>();
    for (const f of tomorrowFixtures) byId.set(f.fixture_id, f);
    for (const f of todayFixtures) byId.set(f.fixture_id, f);
    return [...byId.values()].sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    );
  }, [todayFixtures, tomorrowFixtures]);

  const sidebarFixtureIds = useMemo(
    () => mergedVoteFixtures.slice(0, 15).map((f) => f.fixture_id),
    [mergedVoteFixtures],
  );

  const fixtureGroupQueries = useQueries({
    queries: sidebarFixtureIds.map((apiFixtureId) => ({
      queryKey: ["fixtureGroup", apiFixtureId] as const,
      queryFn: async (): Promise<GroupResponse | null> => {
        try {
          return await getFixtureGroup(apiFixtureId);
        } catch {
          return null;
        }
      },
      staleTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    })),
  });

  const matchDiscussionRows = useMemo((): FixtureSidebarRow[] => {
    return sidebarFixtureIds
      .map((apiId, i) => {
        const fx = mergedVoteFixtures.find((f) => f.fixture_id === apiId);
        const group = fixtureGroupQueries[i]?.data ?? null;
        if (!fx || !group || group.group_type !== "fixture") return null;
        return { fx, group };
      })
      .filter((row): row is FixtureSidebarRow => row != null);
  }, [sidebarFixtureIds, mergedVoteFixtures, fixtureGroupQueries]);

  /** Group fixture rows by league, leagues A–Z, matches by kickoff within each league */
  const fixtureSectionsByLeague = useMemo(() => {
    const leagueMap = new Map<string, FixtureSidebarRow[]>();
    for (const row of matchDiscussionRows) {
      const raw =
        row.group.fixture_meta?.league_name?.trim() ||
        row.fx.league_name?.trim() ||
        "";
      const leagueName = raw.length > 0 ? raw : "Other";
      const list = leagueMap.get(leagueName) ?? [];
      list.push(row);
      leagueMap.set(leagueName, list);
    }
    for (const rows of leagueMap.values()) {
      rows.sort(
        (a, b) =>
          new Date(a.fx.match_date).getTime() -
          new Date(b.fx.match_date).getTime(),
      );
    }
    const leagueNames = [...leagueMap.keys()].sort((a, b) =>
      leagueSortKey(a).localeCompare(leagueSortKey(b)),
    );
    return leagueNames.map((leagueName) => {
      const rows = leagueMap.get(leagueName)!;
      const leagueLogo =
        rows[0]?.group.fixture_meta?.league_logo ??
        rows[0]?.fx.league_logo ??
        null;
      return { leagueName, leagueLogo, rows };
    });
  }, [matchDiscussionRows]);

  const fixturesFeedLoading = loadingToday || loadingTomorrow;
  const anyFixtureGroupQueryPending =
    sidebarFixtureIds.length > 0 &&
    fixtureGroupQueries.some((q) => q.isPending);

  // Show skeleton only when we know the user is logged in and groups are loading
  const showLoading = isAuthenticated && isLoading;

  // Memoize groups extraction
  const groups = useMemo(() => groupsData?.items || [], [groupsData]);

  // Handle link click - close sidebar on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  // Memoize group filtering to avoid recalculation on every render
  const { ownedGroups, followedGroups } = useMemo(() => {
    return {
      ownedGroups: groups.filter((group) => group.is_owner),
      followedGroups: groups.filter((group) => !group.is_owner),
    };
  }, [groups]);

  const navigationLinks = [
    {
      href: "/discuss",
      label: "All Posts",
      icon: MessageSquare,
    },
    {
      href: "/discuss/create-group",
      label: "Create Group",
      icon: Plus,
    },
    {
      href: "/discuss/search-group",
      label: "Search Group",
      icon: Search,
    },
  ];

  return (
    <div className="sticky   top-0 ">
      <Card className=" bg-gradient-to-br  pb-32 md:pb-6 border-border/50 min-h-[calc(100vh-80px)]   rounded-none    w-60 md:w-64 xl:w-72  backdrop-blur-sm">
        <CardContent className="py-2 px-3">
          {/* Navigation Section */}
          <nav className="flex flex-col gap-1.5 mb-4 pb-4 border-b border-border/60">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:text-foreground hover:shadow-sm",
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 relative z-10 transition-transform duration-300",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground group-hover:scale-110",
                    )}
                  />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {showMatchChatsInSidebar && (
            <>
              {/* Fixture match discussions — grouped by league, dual team crests */}
              <div className="mb-4 pb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5 mb-2.5 px-1">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-foreground tracking-tight leading-tight">
                      Match Threads
                    </h3>
                  </div>
                  {matchDiscussionRows.length > 0 && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20">
                      {matchDiscussionRows.length}
                    </span>
                  )}
                </div>

                {fixturesFeedLoading && (
                  <div className="space-y-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                      >
                        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3.5 w-full rounded-md" />
                          <Skeleton className="h-2.5 w-24 rounded-md" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!fixturesFeedLoading &&
                  sidebarFixtureIds.length > 0 &&
                  matchDiscussionRows.length === 0 &&
                  anyFixtureGroupQueryPending && (
                    <div className="space-y-1">
                      {[...Array(2)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                        >
                          <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-3.5 w-full rounded-md" />
                            <Skeleton className="h-2.5 w-20 rounded-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {!fixturesFeedLoading && fixtureSectionsByLeague.length > 0 && (
                  <div className="space-y-3">
                    {fixtureSectionsByLeague.map(
                      ({ leagueName, leagueLogo, rows }) => (
                        <div key={leagueName} className="  overflow-hidden ">
                          <div className="flex items-center gap-2">
                            <div className="relative w-6 h-6 rounded-md overflow-hidden bg-background/80 flex-shrink-0 ring-1 ring-border/50">
                              {leagueLogo ? (
                                <Image
                                  src={leagueLogo}
                                  alt=""
                                  fill
                                  className="object-contain p-0.5"
                                  sizes="24px"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                  {leagueName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-wide text-foreground truncate">
                              {leagueName}
                            </span>
                          </div>
                          <div className="divide-y divide-border/50">
                            {rows.map(({ fx, group }) => {
                              const isActive =
                                pathname === `/discuss/group-posts/${group.id}`;
                              const kickoff = new Date(
                                fx.match_date,
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                              const homeName =
                                group.fixture_meta?.home_team ?? fx.home_team;
                              const awayName =
                                group.fixture_meta?.away_team ?? fx.away_team;
                              const homeLogo =
                                group.fixture_meta?.home_team_logo ??
                                fx.home_team_logo;
                              const awayLogo =
                                group.fixture_meta?.away_team_logo ??
                                fx.away_team_logo;
                              return (
                                <Link
                                  key={group.id}
                                  href={`/discuss/group-posts/${group.id}`}
                                  onClick={handleLinkClick}
                                  className={cn(
                                    "flex items-center gap-2.5 px-2 py-1.5 transition-colors",
                                    isActive
                                      ? "bg-sky-500/15 border-l-[3px] border-l-sky-500"
                                      : "border-l-[3px] border-l-transparent hover:bg-muted/50",
                                  )}
                                >
                                  <DualTeamLogos
                                    homeLogo={homeLogo}
                                    awayLogo={awayLogo}
                                    homeName={homeName}
                                    awayName={awayName}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={cn(
                                        "text-[11px] font-semibold leading-snug line-clamp-2",
                                        isActive
                                          ? "text-sky-900 dark:text-sky-100"
                                          : "text-foreground",
                                      )}
                                    >
                                      <span className="text-foreground/90">
                                        {homeName}
                                      </span>
                                      <span className="text-muted-foreground font-medium mx-0.5">
                                        vs
                                      </span>
                                      <span className="text-foreground/90">
                                        {awayName}
                                      </span>
                                    </p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {!fixturesFeedLoading &&
                  sidebarFixtureIds.length > 0 &&
                  matchDiscussionRows.length === 0 &&
                  !anyFixtureGroupQueryPending && (
                    <p className="text-xs text-muted-foreground px-1 py-2">
                      Match discussions appear when synced fixtures have a
                      linked group.
                    </p>
                  )}

                {!fixturesFeedLoading && mergedVoteFixtures.length === 0 && (
                  <p className="text-xs text-muted-foreground px-1 py-2">
                    No matches in the feed right now.
                  </p>
                )}
              </div>
            </>
          )}

          {/* My Groups Section */}
          <div className="space-y-4 ">
            {/* Owned Groups Section */}
            <div>
              <div className="flex items-center gap-2.5 mb-2 px-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
                  <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  My Groups
                </h3>
                {ownedGroups.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                    {ownedGroups.length}
                  </span>
                )}
              </div>

              {/* Loading State */}
              {showLoading && (
                <div className="space-y-1">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                    >
                      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-28 rounded-md" />
                        <Skeleton className="h-2.5 w-36 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Owned Groups List */}
              {!showLoading && ownedGroups.length > 0 && (
                <div className="space-y-1">
                  {ownedGroups.map((group) => {
                    const isActive =
                      pathname === `/discuss/group-posts/${group.id}`;
                    return (
                      <Link
                        key={group.id}
                        href={`/discuss/group-posts/${group.id}`}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-lg shadow-primary/25"
                            : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-md border border-transparent hover:border-border/50",
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                        )}
                        {/* Group Icon */}
                        {group.icon_url ? (
                          <div
                            className={cn(
                              "relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md",
                            )}
                          >
                            <Image
                              src={group.icon_url}
                              alt={group.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "bg-white/20 ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "bg-gradient-to-br from-primary/15 to-primary/5 ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md group-hover:from-primary/20 group-hover:to-primary/10",
                            )}
                          >
                            <Users
                              className={cn(
                                "w-4 h-4",
                                isActive ? "text-white" : "text-primary",
                              )}
                            />
                          </div>
                        )}

                        {/* Group Info */}
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className={cn(
                                "text-sm font-semibold truncate transition-colors",
                                isActive ? "text-white" : "text-foreground",
                              )}
                            >
                              {group.name}
                            </p>
                            {group.is_private && (
                              <Lock
                                className={cn(
                                  "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                                  isActive
                                    ? "text-white/80"
                                    : "text-muted-foreground group-hover:text-foreground/70",
                                )}
                              />
                            )}
                          </div>
                          {group.description && (
                            <p
                              className={cn(
                                "text-xs truncate transition-colors",
                                isActive
                                  ? "text-white/85"
                                  : "text-muted-foreground group-hover:text-muted-foreground/90",
                              )}
                            >
                              {group.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Empty State for Owned Groups */}
              {!showLoading && ownedGroups.length === 0 && (
                <Link
                  href="/discuss/create-group"
                  onClick={handleLinkClick}
                  className="block group"
                >
                  <div className="py-8 px-4 text-center rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 transition-transform duration-200 group-hover:shadow-md group-hover:scale-[1.01]">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      No groups owned yet
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Create your first group to get started
                    </p>
                  </div>
                </Link>
              )}
            </div>

            {/* Following Groups Section */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 px-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Following
                </h3>
                {followedGroups.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                    {followedGroups.length}
                  </span>
                )}
              </div>

              {/* Loading State */}
              {showLoading && (
                <div className="space-y-1">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                    >
                      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-28 rounded-md" />
                        <Skeleton className="h-2.5 w-36 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Following Groups List */}
              {!showLoading && followedGroups.length > 0 && (
                <div className="space-y-1">
                  {followedGroups.map((group) => {
                    const isActive =
                      pathname === `/discuss/group-posts/${group.id}`;
                    return (
                      <Link
                        key={group.id}
                        href={`/discuss/group-posts/${group.id}`}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-lg shadow-primary/25"
                            : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-md border border-transparent hover:border-border/50",
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                        )}
                        {/* Group Icon */}
                        {group.icon_url ? (
                          <div
                            className={cn(
                              "relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md",
                            )}
                          >
                            <Image
                              src={group.icon_url}
                              alt={group.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "bg-white/20 ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "bg-gradient-to-br from-primary/15 to-primary/5 ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md group-hover:from-primary/20 group-hover:to-primary/10",
                            )}
                          >
                            <Users
                              className={cn(
                                "w-4 h-4",
                                isActive ? "text-white" : "text-primary",
                              )}
                            />
                          </div>
                        )}

                        {/* Group Info */}
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className={cn(
                                "text-sm font-semibold truncate transition-colors",
                                isActive ? "text-white" : "text-foreground",
                              )}
                            >
                              {group.name}
                            </p>
                            {group.is_private && (
                              <Lock
                                className={cn(
                                  "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                                  isActive
                                    ? "text-white/80"
                                    : "text-muted-foreground group-hover:text-foreground/70",
                                )}
                              />
                            )}
                          </div>
                          {group.description && (
                            <p
                              className={cn(
                                "text-xs truncate transition-colors",
                                isActive
                                  ? "text-white/85"
                                  : "text-muted-foreground group-hover:text-muted-foreground/90",
                              )}
                            >
                              {group.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Empty State for Following Groups */}
              {!showLoading && followedGroups.length === 0 && (
                <Link
                  href="/discuss/search-group"
                  onClick={handleLinkClick}
                  className="block group"
                >
                  <div className="py-8 px-4 text-center rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 transition-transform duration-200 group-hover:shadow-md group-hover:scale-[1.01]">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Not following any groups
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Search for groups to join and start discussing
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
