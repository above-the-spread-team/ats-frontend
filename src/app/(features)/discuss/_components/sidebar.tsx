"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUserGroups } from "@/services/fastapi/groups";
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
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { FixtureVotesResult } from "@/type/fastapi/vote";
import { usePathname } from "next/navigation";
import { cn, shouldShowDiscussMatchChatsInSidebar } from "@/lib/utils";
import { useSidebar } from "../_contexts/sidebar-context";
import { useMobile } from "@/hooks/use-mobile";

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
  isActive = false,
}: {
  homeLogo: string | null;
  awayLogo: string | null;
  homeName: string;
  awayName: string;
  isActive?: boolean;
}) {
  return (
    <div className="flex items-center flex-shrink-0" aria-hidden>
      <div className="relative flex items-center">
        <div
          className={cn(
            "relative z-[2] w-8 h-8 rounded-full ring-2 overflow-hidden shadow-sm transition-all duration-300",
            isActive
              ? "ring-white/30 ring-offset-2 ring-offset-primary"
              : "ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30",
          )}
        >
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
        <div
          className={cn(
            "relative z-[1] w-8 h-8 rounded-full ring-2 overflow-hidden shadow-sm -ml-3 transition-all duration-300",
            isActive
              ? "ring-white/30 ring-offset-2 ring-offset-primary"
              : "ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30",
          )}
        >
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

  const [matchThreadsOpen, setMatchThreadsOpen] = useState(true);
  const [myGroupsOpen, setMyGroupsOpen] = useState(true);
  const [followingOpen, setFollowingOpen] = useState(true);

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

  /** Group fixtures by league, leagues A–Z, matches by kickoff within each league */
  const fixtureSectionsByLeague = useMemo(() => {
    const leagueMap = new Map<string, FixtureVotesResult[]>();
    for (const fx of mergedVoteFixtures.slice(0, 15)) {
      const leagueName = fx.league_name?.trim() || "Other";
      const list = leagueMap.get(leagueName) ?? [];
      list.push(fx);
      leagueMap.set(leagueName, list);
    }
    for (const fixtures of leagueMap.values()) {
      fixtures.sort(
        (a, b) =>
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
      );
    }
    const leagueNames = [...leagueMap.keys()].sort((a, b) =>
      leagueSortKey(a).localeCompare(leagueSortKey(b)),
    );
    return leagueNames.map((leagueName) => ({
      leagueName,
      leagueLogo: leagueMap.get(leagueName)![0]?.league_logo ?? null,
      fixtures: leagueMap.get(leagueName)!,
    }));
  }, [mergedVoteFixtures]);

  const fixturesFeedLoading = loadingToday || loadingTomorrow;

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
              <Collapsible
                open={matchThreadsOpen}
                onOpenChange={setMatchThreadsOpen}
                className="mb-4 pb-2 border-b border-border/60"
              >
                <CollapsibleTrigger className="flex items-center gap-2.5 mb-2.5 px-1 w-full group/trigger">
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="text-base font-bold text-foreground tracking-tight leading-tight">
                      Match Threads
                    </h3>
                  </div>
                  {mergedVoteFixtures.length > 0 && (
                    <span className="flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-800 dark:text-sky-300 border border-sky-500/20">
                      {mergedVoteFixtures.length}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 group-hover/trigger:text-foreground",
                      matchThreadsOpen ? "rotate-0" : "-rotate-90",
                    )}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent>
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
                    fixtureSectionsByLeague.length > 0 && (
                      <div className="space-y-3">
                        {fixtureSectionsByLeague.map(
                          ({ leagueName, leagueLogo, fixtures }) => (
                            <div key={leagueName} className="overflow-hidden">
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
                                {fixtures.map((fx) => {
                                  const href = `/discuss/fixture/${fx.fixture_id}`;
                                  const isActive = pathname === href;
                                  return (
                                    <Link
                                      key={fx.fixture_id}
                                      href={href}
                                      onClick={handleLinkClick}
                                      className={cn(
                                        "flex items-center gap-2.5 p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                        isActive
                                          ? "bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-lg shadow-primary/25"
                                          : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-md border border-transparent hover:border-border/50",
                                      )}
                                    >
                                      {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                                      )}
                                      <DualTeamLogos
                                        homeLogo={fx.home_team_logo}
                                        awayLogo={fx.away_team_logo}
                                        homeName={fx.home_team}
                                        awayName={fx.away_team}
                                        isActive={isActive}
                                      />
                                      <div className="flex-1 min-w-0 relative z-10">
                                        <p
                                          className={cn(
                                            "text-[11px] font-semibold leading-snug line-clamp-2",
                                            isActive
                                              ? "text-white"
                                              : "text-foreground",
                                          )}
                                        >
                                          <span
                                            className={cn(
                                              isActive
                                                ? "text-white"
                                                : "text-foreground/90 group-hover:text-foreground",
                                            )}
                                          >
                                            {fx.home_team}
                                          </span>
                                          <span
                                            className={cn(
                                              "font-medium mx-0.5",
                                              isActive
                                                ? "text-white/80"
                                                : "text-muted-foreground group-hover:text-foreground/70",
                                            )}
                                          >
                                            vs
                                          </span>
                                          <span
                                            className={cn(
                                              isActive
                                                ? "text-white"
                                                : "text-foreground/90 group-hover:text-foreground",
                                            )}
                                          >
                                            {fx.away_team}
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

                  {!fixturesFeedLoading && mergedVoteFixtures.length === 0 && (
                    <p className="text-xs text-muted-foreground px-1 py-2">
                      No matches in the feed right now.
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {/* My Groups Section */}
          <div className="space-y-4 ">
            {/* Owned Groups Section */}
            <Collapsible open={myGroupsOpen} onOpenChange={setMyGroupsOpen}>
              <CollapsibleTrigger className="flex items-center gap-2.5 mb-2 px-1 w-full group/trigger">
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
                <ChevronDown
                  className={cn(
                    "w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 group-hover/trigger:text-foreground",
                    myGroupsOpen ? "rotate-0" : "-rotate-90",
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>

            {/* Following Groups Section */}
            <Collapsible open={followingOpen} onOpenChange={setFollowingOpen}>
              <CollapsibleTrigger className="flex items-center gap-2.5 mb-4 px-1 w-full group/trigger">
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
                <ChevronDown
                  className={cn(
                    "w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform duration-300 group-hover/trigger:text-foreground",
                    followingOpen ? "rotate-0" : "-rotate-90",
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent>
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
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
