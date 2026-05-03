"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/services/fastapi/vote";
import { VoteDialog } from "@/components/common/vote-today-popup";
import type { FixtureVotesResult, VoteChoice } from "@/type/fastapi/vote";
import { Button } from "@/components/ui/button";
import VoteColor from "@/components/common/vote-color";
import { VotingBar } from "@/components/common/voting-bar";
import HomeFailToLoad from "./home-fail-to-load";

// ── constants ──────────────────────────────────────────────────────────────

const VOTE_META: { key: VoteChoice; color: string; textColor: string }[] = [
  { key: "home", color: "bg-vote-blue", textColor: "text-foreground" },
  { key: "draw", color: "bg-vote-yellow", textColor: "text-foreground" },
  { key: "away", color: "bg-vote-red", textColor: "text-foreground" },
];

// backend contract: day=yesterday|today|tomorrow
// we keep the UI `dateOffset` mapping:
// -1 => tomorrow, 0 => today, 1 => yesterday
const DATE_TABS = [
  { label: "Tomorrow", offset: -1 },
  { label: "Today", offset: 0 },
  { label: "Yesterday", offset: 1 },
];

// ── helpers ────────────────────────────────────────────────────────────────

function TeamLogo({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={22}
        height={22}
        quality={50}
        className="w-7 h-7 md:w-8 md:h-8 object-contain flex-shrink-0"
      />
    );
  }
  return (
    <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function pct(fixture: FixtureVotesResult, key: VoteChoice) {
  return key === "home"
    ? fixture.home_percentage
    : key === "draw"
      ? fixture.draw_percentage
      : fixture.away_percentage;
}

// ── single fixture row ─────────────────────────────────────────────────────

function FixtureRow({ fixture }: { fixture: FixtureVotesResult }) {
  const hasVotes = fixture.total_votes > 0;

  return (
    <div className="flex flex-col gap-2.5 px-4 py-2 md:py-3 hover:bg-muted/20 transition-colors">
      {/* Teams + time */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamLogo src={fixture.home_team_logo} name={fixture.home_team} />
          <span className="text-sm md:text-base font-semibold truncate leading-tight">
            {fixture.home_team}
          </span>
        </div>

        {/* Centre */}
        {hasVotes && (
          <span className="text-[12px] text-muted-foreground">
            {fixture.total_votes.toLocaleString()} vote
            {fixture.total_votes !== 1 ? "s" : ""}
          </span>
        )}

        {/* Away */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm md:text-base font-semibold truncate leading-tight text-right">
            {fixture.away_team}
          </span>
          <TeamLogo src={fixture.away_team_logo} name={fixture.away_team} />
        </div>
      </div>

      {/* Vote bar + percentages (bar always shows three colors; empty = equal thirds; 0% still gets a minimum slice) */}
      <div className="space-y-1">
        <VotingBar
          fixture={fixture}
          segmentStyle="flat"
          size="sm"
          mdSize="md"
        />
        <div className="flex justify-between text-[11px] md:text-xs">
          {VOTE_META.map((v) => (
            <span key={v.key} className={`${v.textColor} font-medium`}>
              {`${pct(fixture, v.key).toFixed(0)}%`}
            </span>
          ))}
        </div>
        {!hasVotes && (
          <p className="text-[11px] md:text-xs text-muted-foreground text-center pt-0.5">
            No votes yet
          </p>
        )}
      </div>
    </div>
  );
}

// ── league group ───────────────────────────────────────────────────────────

function LeagueGroup({
  leagueName,
  leagueLogo,
  fixtures,
}: {
  leagueName: string;
  leagueLogo: string | null;
  fixtures: FixtureVotesResult[];
}) {
  return (
    <div>
      <div className="flex items-center px-4 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2 flex-shrink-0">
          {leagueLogo && (
            <Image
              src={leagueLogo}
              alt={leagueName}
              width={20}
              height={20}
              quality={50}
              className="w-5 h-5 md:w-6 md:h-6 object-contain flex-shrink-0"
            />
          )}
          <span className=" text-xs md:text-base font-semibold text-foreground line-clamp-1">
            {leagueName}
          </span>
        </div>
        <span className="flex-1 text-right text-xs text-muted-foreground">
          {fixtures.length} match{fixtures.length !== 1 ? "es" : ""}
        </span>
      </div>
      <div className="divide-y divide-border">
        {fixtures.map((f) => (
          <FixtureRow key={f.fixture_id} fixture={f} />
        ))}
      </div>
    </div>
  );
}

// ── skeleton ───────────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      {[0, 1].map((g) => (
        <div key={g}>
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-muted/50 border-b border-border">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="px-4 py-3 space-y-2.5 border-b border-border last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                  <Skeleton className="h-4 flex-1 max-w-[120px]" />
                </div>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-8 rounded-full" />
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <Skeleton className="h-4 flex-1 max-w-[120px]" />
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────

export default function VoteResult() {
  const [dateOffset, setDateOffset] = useState(0);
  const { data, isLoading, error } = useFixtures(dateOffset);

  const leagueGroups = useMemo(() => {
    if (!data) return [];
    const map = new Map<
      string,
      {
        leagueName: string;
        leagueLogo: string | null;
        fixtures: FixtureVotesResult[];
      }
    >();
    for (const f of data) {
      const key = f.league_name ?? "Other";
      if (!map.has(key)) {
        map.set(key, {
          leagueName: key,
          leagueLogo: f.league_logo,
          fixtures: [],
        });
      }
      map.get(key)!.fixtures.push(f);
    }
    return Array.from(map.values());
  }, [data]);

  return (
    <div className="w-full space-y-3">
      {/* Header + date tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 ">
        <div className="flex w-full md:w-auto items-center justify-between">
          <h2 className="text-lg md:text-xl  font-bold text-primary-font">
            User&apos;s votes
          </h2>
          <div className="block md:hidden">
            <VoteDialog>
              <Button variant="default" className="rounded-full h-7">
                Vote
              </Button>
            </VoteDialog>
          </div>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {DATE_TABS.map((tab) => (
            <button
              key={tab.offset}
              onClick={() => setDateOffset(tab.offset)}
              className={[
                "text-xs md:text-sm px-3 py-1 rounded-md font-medium transition-colors",
                dateOffset === tab.offset
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="hidden md:block">
          <VoteDialog>
            <Button variant="default" className="rounded-full h-7">
              Vote
            </Button>
          </VoteDialog>
        </div>
      </div>
      <VoteColor />

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <HomeFailToLoad message="Failed to load predictions" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm p-10 text-center">
          <p className="text-4xl mb-2">⚽</p>
          <p className="text-sm md:text-base font-medium text-foreground">
            No fixtures{" "}
            {DATE_TABS.find(
              (t) => t.offset === dateOffset,
            )?.label.toLowerCase()}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {dateOffset === -1
              ? "Tomorrow's fixtures are pre-loaded at 00:20 UTC."
              : dateOffset === 0
                ? "Check back later!"
                : "Yesterday's fixtures are available for review."}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm divide-y divide-border">
          {leagueGroups.map((group) => (
            <LeagueGroup
              key={group.leagueName}
              leagueName={group.leagueName}
              leagueLogo={group.leagueLogo}
              fixtures={group.fixtures}
            />
          ))}
        </div>
      )}
    </div>
  );
}
