"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFixtures } from "@/services/fastapi/vote";
import { getFixtureGroup } from "@/services/fastapi/groups";
import type { FixtureVotesResult, VoteChoice } from "@/type/fastapi/vote";
import type { GroupResponse } from "@/type/fastapi/groups";
import { usePathname } from "next/navigation";

const VOTE_META: { key: VoteChoice; color: string }[] = [
  { key: "home", color: "bg-vote-blue" },
  { key: "draw", color: "bg-vote-yellow" },
  { key: "away", color: "bg-vote-red" },
];

function pct(fixture: FixtureVotesResult, key: VoteChoice) {
  return key === "home"
    ? fixture.home_percentage
    : key === "draw"
      ? fixture.draw_percentage
      : fixture.away_percentage;
}

function TeamLogo({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={22}
        height={22}
        quality={50}
        className="w-6 h-6 object-contain flex-shrink-0"
      />
    );
  }

  return (
    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function FixtureRow({
  fixture,
  href,
  isActive,
}: {
  fixture: FixtureVotesResult;
  href: string | null;
  isActive: boolean;
}) {
  const hasVotes = fixture.total_votes > 0;

  const yourVote: VoteChoice | null = fixture.user_vote;
  const highlightHome = yourVote === "home";
  const highlightDraw = yourVote === "draw";
  const highlightAway = yourVote === "away";

  const content = (
    <div
      className={[
        "px-3 py-2 rounded-xl transition-colors",
        "border-l-2 border-l-transparent",
        "transition-[background-color,border-color,box-shadow] duration-200",
        isActive ? "bg-primary text-white" : "bg-card/0 hover:bg-primary/10",
        yourVote && !isActive ? "bg-muted/20" : "",
        href ? "cursor-pointer" : "cursor-default",
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={
              highlightHome ? "ring-1 ring-primary/40 rounded-full p-0.5" : ""
            }
          >
            <TeamLogo src={fixture.home_team_logo} name={fixture.home_team} />
          </div>
          <span className="text-xs font-semibold line-clamp-1 leading-tight">
            {fixture.home_team}
          </span>
        </div>

        <div className="flex flex-row-reverse items-center  gap-2 flex-1 min-w-0">
          <div
            className={
              highlightAway ? "ring-1 ring-primary/40 rounded-full p-0.5" : ""
            }
          >
            <TeamLogo src={fixture.away_team_logo} name={fixture.away_team} />
          </div>
          <span className="text-xs font-semibold line-clamp-1 leading-tight">
            {fixture.away_team}
          </span>
        </div>
      </div>

      {hasVotes ? (
        <div className="mt-2 space-y-1">
          <div className="flex w-full rounded-full overflow-hidden h-1.5 bg-muted/30">
            {VOTE_META.map((v) => {
              const w = pct(fixture, v.key);
              const isHighlighted =
                (v.key === "home" && highlightHome) ||
                (v.key === "draw" && highlightDraw) ||
                (v.key === "away" && highlightAway);
              return (
                <div
                  key={v.key}
                  style={{ width: `${w}%` }}
                  className={[
                    v.color,
                    "transition-all duration-500",
                    isHighlighted ? "opacity-100" : "opacity-85",
                  ].join(" ")}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-muted-foreground">No votes yet</p>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block no-underline">
      {content}
    </Link>
  );
}

export default function RightSidebar() {
  // dateOffset UI contract: -1 tomorrow, 0 today, 1 yesterday
  const [dateOffset, setDateOffset] = useState<0 | -1 | 1>(0);
  const pathname = usePathname();
  const { data, isLoading, error } = useFixtures(dateOffset);

  const leagueSections = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, FixtureVotesResult[]>();

    for (const f of data) {
      const key = f.league_name ?? "Other";
      map.set(key, [...(map.get(key) ?? []), f]);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(([leagueName, fixtures]) => ({
        leagueName,
        fixtures: fixtures.sort(
          (x, y) =>
            new Date(x.match_date).getTime() - new Date(y.match_date).getTime(),
        ),
      }));
  }, [data]);

  const displayedFixtures = useMemo(() => {
    return leagueSections.slice(0, 3).flatMap((s) => s.fixtures.slice(0, 4));
  }, [leagueSections]);

  const fixtureIds = useMemo(
    () => displayedFixtures.map((f) => f.fixture_id),
    [displayedFixtures],
  );

  const fixtureGroupQueries = useQueries({
    queries: fixtureIds.map((apiFixtureId) => ({
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

  const fixtureHrefById = useMemo(() => {
    const map = new Map<number, string>();
    displayedFixtures.forEach((fx, i) => {
      const group = fixtureGroupQueries[i]?.data ?? null;
      if (!group || group.group_type !== "fixture") return;
      map.set(fx.fixture_id, `/discuss/group-posts/${group.id}`);
    });
    return map;
  }, [displayedFixtures, fixtureGroupQueries]);

  return (
    <div className="w-60 md:w-72 xl:w-80 2xl:w-96 h-full flex-shrink-0 flex flex-col p-2 gap-3 bg-card/60 border-l border-border/60">
      <div className="px-1.5 pt-2 pb-1">
        <h3 className="text-base font-bold text-foreground">Match Threads</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Click to join the discussion
        </p>
      </div>

      <div className="px-1.5">
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          {[
            { label: "Tomorrow", offset: -1 },
            { label: "Today", offset: 0 },
            { label: "Yesterday", offset: 1 },
          ].map((t) => {
            const active = dateOffset === (t.offset as 0 | -1 | 1);
            return (
              <button
                key={t.offset}
                onClick={() => setDateOffset(t.offset as 0 | -1 | 1)}
                className={[
                  "flex-1 text-[11px] md:text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors",
                  active
                    ? "bg-card text-foreground shadow-sm border border-border/60"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 pr-2">
        <div className="pt-1 pb-2">
          {isLoading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/20">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-9 w-full mb-2" />
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30">
              <p className="text-xs font-semibold text-destructive">Failed</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Could not load voting results.
              </p>
            </div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {leagueSections.slice(0, 3).map((section) => (
                <div key={section.leagueName} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary-font" />
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      {section.leagueName}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {section.fixtures.slice(0, 4).map((fixture) => {
                      const href =
                        fixtureHrefById.get(fixture.fixture_id) ?? null;
                      return (
                        <FixtureRow
                          key={fixture.fixture_id}
                          fixture={fixture}
                          href={href}
                          isActive={
                            href != null &&
                            (pathname === href ||
                              pathname.startsWith(href + "/"))
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-muted/20 border border-border/60">
              <p className="text-xs font-semibold">No fixtures</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Try switching tabs.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
