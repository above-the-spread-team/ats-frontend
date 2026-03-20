"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailableFixtures, useVote } from "@/services/fastapi/vote";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { FixtureSummary, VoteChoice } from "@/type/fastapi/vote";
import { CheckCircle2, Vote as VoteIcon } from "lucide-react";

// ── vote meta ──────────────────────────────────────────────────────────────

const VOTE_META: {
  key: VoteChoice;
  label: string;
  bg: string;
  activeBorder: string;
}[] = [
  {
    key: "home",
    label: "1",
    bg: "bg-vote-blue",
    activeBorder: "ring-vote-blue",
  },
  {
    key: "draw",
    label: "X",
    bg: "bg-vote-yellow",
    activeBorder: "ring-vote-yellow",
  },
  { key: "away", label: "2", bg: "bg-vote-red", activeBorder: "ring-vote-red" },
];

// ── team logo ──────────────────────────────────────────────────────────────

function TeamLogo({
  src,
  name,
  size = 28,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        quality={50}
        className="object-contain flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

// ── fixture vote row ───────────────────────────────────────────────────────

function FixtureVoteRow({
  fixture,
  canVote,
  voted,
  onVoted,
}: {
  fixture: FixtureSummary;
  canVote: boolean;
  voted: VoteChoice | null;
  onVoted: (choice: VoteChoice) => void;
}) {
  const { vote, isPending } = useVote();
  const [error, setError] = useState<string | null>(null);

  const matchTime = new Date(fixture.match_date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleVote = async (choice: VoteChoice) => {
    setError(null);
    try {
      await vote(fixture.fixture_id, choice);
      onVoted(choice);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    }
  };

  return (
    <div className="px-4 py-3 space-y-3 hover:bg-muted/20 transition-colors">
      {/* Teams + time */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Home */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TeamLogo
            src={fixture.home_team_logo}
            name={fixture.home_team}
            size={26}
          />
          <span className="text-sm font-semibold truncate">
            {fixture.home_team}
          </span>
        </div>
        {/* Centre */}
        <div className="flex-shrink-0 text-center">
          <span className="text-xs text-muted-foreground tabular-nums font-medium">
            {matchTime}
          </span>
        </div>
        {/* Away */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-semibold truncate text-right">
            {fixture.away_team}
          </span>
          <TeamLogo
            src={fixture.away_team_logo}
            name={fixture.away_team}
            size={26}
          />
        </div>
      </div>

      {/* Voted confirmation */}
      {voted ? (
        <div className="flex items-center justify-center gap-2 py-1">
          <CheckCircle2 className="w-4 h-4 text-primary-font flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            Voted{" "}
            <span className={"font-semibold text-primary-font"}>
              {voted === "home"
                ? fixture.home_team
                : voted === "away"
                  ? fixture.away_team
                  : "Draw"}
            </span>
          </span>
        </div>
      ) : (
        /* Vote buttons */
        <div className="grid grid-cols-3 gap-2">
          {VOTE_META.map((v) => (
            <button
              key={v.key}
              disabled={!canVote || isPending}
              onClick={() => handleVote(v.key)}
              className={[
                "rounded-lg py-2 text-xs sm:text-sm font-bold text-white transition-all truncate px-1",
                v.bg,
                !canVote || isPending
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:brightness-110 active:scale-95",
              ].join(" ")}
            >
              {v.key === "home" ? "Home" : v.key === "away" ? "Away" : "Draw"}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}

// ── league group ───────────────────────────────────────────────────────────

function LeagueGroup({
  leagueName,
  leagueLogo,
  fixtures,
  canVote,
  votedMap,
  onVoted,
}: {
  leagueName: string;
  leagueLogo: string | null;
  fixtures: FixtureSummary[];
  canVote: boolean;
  votedMap: Record<number, VoteChoice>;
  onVoted: (fixtureId: number, choice: VoteChoice) => void;
}) {
  return (
    <div>
      {/* League header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/80 border-y border-border sticky top-0 z-10">
        {leagueLogo && (
          <Image
            src={leagueLogo}
            alt={leagueName}
            width={18}
            height={18}
            quality={50}
            className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0"
          />
        )}
        <span className="text-xs sm:text-sm font-semibold text-foreground flex-1 truncate">
          {leagueName}
        </span>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {fixtures.length} match{fixtures.length !== 1 ? "es" : ""}
        </span>
      </div>

      <div className="divide-y divide-border">
        {fixtures.map((f) => (
          <FixtureVoteRow
            key={f.fixture_id}
            fixture={f}
            canVote={canVote}
            voted={votedMap[f.fixture_id] ?? null}
            onVoted={(choice) => onVoted(f.fixture_id, choice)}
          />
        ))}
      </div>
    </div>
  );
}

// ── popup content ──────────────────────────────────────────────────────────

const DAY_TABS: { label: string; day: "today" | "tomorrow" }[] = [
  { label: "Today", day: "today" },
  { label: "Tomorrow", day: "tomorrow" },
];

function VotePopupContent({ onClose }: { onClose: () => void }) {
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow">("today");
  const { data, isLoading, error } = useAvailableFixtures(selectedDay);
  const { data: currentUser } = useCurrentUser();
  const isLoggedIn = !!currentUser;
  const [votedMap, setVotedMap] = useState<Record<number, VoteChoice>>({});

  const handleVoted = (fixtureId: number, choice: VoteChoice) => {
    setVotedMap((prev) => ({ ...prev, [fixtureId]: choice }));
  };

  const leagueGroups = useMemo(() => {
    if (!data) return [];
    const map = new Map<
      string,
      {
        leagueName: string;
        leagueLogo: string | null;
        fixtures: FixtureSummary[];
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

  const totalVoted = Object.keys(votedMap).length;
  const totalAvailable = data?.length ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-1 py-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 py-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 flex-1 max-w-[100px]" />
              </div>
              <Skeleton className="h-3 w-10 flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1 justify-end">
                <Skeleton className="h-4 flex-1 max-w-[100px]" />
                <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].map((j) => (
                <Skeleton key={j} className="h-9 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
        <p className="text-sm">Failed to load fixtures</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <VoteIcon className="w-7 h-7 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-base">Sign in to vote</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create a free account to predict match outcomes
          </p>
        </div>
        <Link href="/login" onClick={onClose}>
          <Button className="mt-1">Sign in</Button>
        </Link>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground text-center px-6">
        {/* Day tabs still visible even in empty state */}
        <div className="w-full flex justify-center mb-2">
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {DAY_TABS.map((tab) => (
              <button
                key={tab.day}
                onClick={() => setSelectedDay(tab.day)}
                className={[
                  "text-xs px-4 py-1 rounded-md font-medium transition-colors",
                  selectedDay === tab.day
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <span className="text-4xl">⚽</span>
        <p className="text-sm font-medium text-foreground">
          No matches available {selectedDay === "tomorrow" ? "tomorrow" : "today"}
        </p>
        <p className="text-xs">
          {selectedDay === "tomorrow"
            ? "Tomorrow's fixtures are pre-loaded at 12:20 UTC"
            : "Check back later for upcoming fixtures"}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Day tabs + progress bar */}
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 space-y-2.5">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {DAY_TABS.map((tab) => (
            <button
              key={tab.day}
              onClick={() => setSelectedDay(tab.day)}
              className={[
                "text-xs px-4 py-1 rounded-md font-medium transition-colors",
                selectedDay === tab.day
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        {totalAvailable > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Your predictions</span>
              <span className="font-medium text-foreground">
                {totalVoted} / {totalAvailable}
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-font rounded-full transition-all duration-500"
                style={{ width: `${(totalVoted / totalAvailable) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Fixture list */}
      <div className="divide-y divide-border">
        {leagueGroups.map((group) => (
          <LeagueGroup
            key={group.leagueName}
            leagueName={group.leagueName}
            leagueLogo={group.leagueLogo}
            fixtures={group.fixtures}
            canVote={isLoggedIn}
            votedMap={votedMap}
            onVoted={handleVoted}
          />
        ))}
      </div>
    </>
  );
}

// ── reusable dialog wrapper ────────────────────────────────────────────────

/** Wrap any element with this to open the voting popup on click. */
export function VoteDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="p-0 gap-0 w-full max-w-[95%] md:max-w-lg sm:max-w-xl flex flex-col max-h-[90vh] sm:max-h-[80vh]">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-border flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <VoteIcon className="w-5 h-5 text-primary-font flex-shrink-0" />
            Cast Your Vote
          </DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pick the winner for today&apos;s matches
          </p>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 min-h-0">
          <VotePopupContent onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
