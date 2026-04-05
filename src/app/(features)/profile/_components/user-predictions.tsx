"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Target,
  Users,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMyStats,
  useMyHistory,
  useLeaderboard,
} from "@/services/fastapi/predictions";
import type {
  LeaderboardEntry,
  PredictionHistoryItem,
} from "@/type/fastapi/predictions";

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

function TeamLogo({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={20}
        height={20}
        quality={50}
        className="w-5 h-5 object-contain flex-shrink-0"
      />
    );
  }
  return (
    <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground flex-shrink-0">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function formatMatchDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Card 1 — Stats
// ---------------------------------------------------------------------------

function StatCell({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex flex-col   items-center gap-1.5 py-4 px-2">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          accent ?? "bg-muted/60",
        )}
      >
        <Icon className="h-4 w-4 text-foreground" />
      </div>
      <p className="text-xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground text-center leading-tight">
        {label}
      </p>
    </div>
  );
}

function StatsCard() {
  const { data, isLoading, error } = useMyStats();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/50">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 py-4 px-2"
              >
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-7 w-14" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Could not load prediction stats.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          My Stats
        </p>
        <p className="text-[11px] text-muted-foreground/70 mb-4">
          {data.correct_predictions} correct out of {data.total_predictions}{" "}
          resolved predictions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-y sm:divide-y-0 divide-border/50 border border-border/50 rounded-xl overflow-hidden">
          <StatCell
            icon={Target}
            label="My Accuracy"
            value={`${data.user_accuracy.toFixed(1)}%`}
            accent="bg-primary/15"
          />
          <StatCell
            icon={Users}
            label="Community Avg"
            value={`${data.community_accuracy.toFixed(1)}%`}
            accent="bg-blue-500/10"
          />
          <StatCell
            icon={Flame}
            label="Win Streak"
            value={data.current_win_streak}
            accent={
              data.current_win_streak > 0 ? "bg-orange-500/15" : "bg-muted/60"
            }
          />
          <StatCell
            icon={Trophy}
            label="Best Streak"
            value={data.max_win_streak}
            accent="bg-yellow-500/10"
          />
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-3">
          Community: {data.total_players.toLocaleString()} player
          {data.total_players !== 1 ? "s" : ""} with resolved predictions
        </p>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Card 2 — History
// ---------------------------------------------------------------------------

function voteChoiceLabel(choice: PredictionHistoryItem["vote_choice"]) {
  switch (choice) {
    case "home":
      return "Home";
    case "away":
      return "Away";
    case "draw":
      return "Draw";
    default:
      return choice;
  }
}

function HistoryRow({ item }: { item: PredictionHistoryItem }) {
  const choiceLabel =
    item.vote_choice === "home"
      ? item.home_team
      : item.vote_choice === "away"
        ? item.away_team
        : "Draw";

  return (
    <Link
      href={`/games/detail?id=${item.fixture_id}`}
      className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 -mx-1 px-1 rounded-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      aria-label={`View match: ${item.home_team} vs ${item.away_team}, pick ${voteChoiceLabel(item.vote_choice)}`}
    >
      {/* Result icon */}
      {item.is_correct ? (
        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
      )}

      {/* Teams */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <TeamLogo src={item.home_team_logo} name={item.home_team} />
        <span className="text-sm truncate font-medium hidden md:block">
          {item.home_team}
        </span>
        <span className="text-xs text-muted-foreground flex-shrink-0">vs</span>
        <TeamLogo src={item.away_team_logo} name={item.away_team} />
        <span className="text-sm truncate font-medium hidden md:block">
          {item.away_team}
        </span>
      </div>

      {/* Right: vote_choice + pick label + date */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 text-right">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {voteChoiceLabel(item.vote_choice)}
        </span>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full max-w-[10rem] sm:max-w-[14rem] truncate",
            item.is_correct
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-red-500/10 text-red-700 dark:text-red-400",
          )}
          title={choiceLabel}
        >
          {choiceLabel}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {formatMatchDate(item.match_date)}
        </span>
      </div>
    </Link>
  );
}

function HistoryCard() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyHistory(page, PAGE_SIZE);

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Could not load prediction history.
        </CardContent>
      </Card>
    );
  }

  if (data.items.length === 0 && page === 1) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="py-10 text-center">
          <Target className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            No resolved predictions yet.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Your results will appear here once matches finish.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card shadow-sm ">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prediction History
          </p>
          <span className="text-xs text-muted-foreground">
            {data.total} total
          </span>
        </div>
        <div className="divide-y divide-border/50">
          {data.items.map((item) => (
            <HistoryRow
              key={`${item.fixture_id}-${item.vote_choice}`}
              item={item}
            />
          ))}
        </div>
        {data.total_pages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage((p) => p - 1);
                    }}
                    className={
                      page <= 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-sm text-muted-foreground">
                    Page {page} of {data.total_pages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < data.total_pages) setPage((p) => p + 1);
                    }}
                    className={
                      page >= data.total_pages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Card 3 — Leaderboard
// ---------------------------------------------------------------------------

function LeaderboardRow({
  entry,
  isCurrentUser,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
}) {
  const rankColors: Record<number, string> = {
    1: "text-yellow-500",
    2: "text-slate-400",
    3: "text-amber-600",
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 first:pt-0 last:pb-0",
        isCurrentUser && "rounded-lg bg-primary/5 px-2 -mx-2",
      )}
    >
      {/* Rank */}
      <span
        className={cn(
          "w-6 text-center text-sm font-bold flex-shrink-0",
          rankColors[entry.rank] ?? "text-muted-foreground",
        )}
      >
        {entry.rank <= 3 ? <Crown className="h-4 w-4 mx-auto" /> : entry.rank}
      </span>

      {/* Avatar placeholder + username */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {entry.avatar_url ? (
          <Image
            src={entry.avatar_url}
            alt={entry.username}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
            {entry.username.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span
          className={cn(
            "text-sm font-medium truncate",
            isCurrentUser && "text-primary-font font-semibold",
          )}
        >
          {entry.username}
          {isCurrentUser && (
            <span className="ml-1 text-[10px] text-primary-font/70">(you)</span>
          )}
        </span>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <span className="text-sm font-bold tabular-nums">
          {entry.accuracy.toFixed(1)}%
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {entry.correct_predictions}/{entry.total_games}
        </span>
      </div>
    </div>
  );
}

function LeaderboardCard() {
  const { data: stats } = useMyStats();
  const { data, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-36" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-6 flex-shrink-0" />
              <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Could not load leaderboard.
        </CardContent>
      </Card>
    );
  }

  // Figure out the current user's user_id by matching rank from stats
  // Backend returns user_rank but not user_id in LeaderboardResponse directly,
  // so we highlight via user_rank matching entry.rank.
  const myRank = data.user_rank;
  const myTotalPredictions = stats?.total_predictions ?? 0;

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Leaderboard
          </p>
          <span className="text-xs text-muted-foreground">
            Top 10 · min 15 games
          </span>
        </div>

        {data.top_10.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No qualified players yet.
          </p>
        ) : (
          <div className="divide-y divide-border/50">
            {data.top_10.map((entry) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.rank === myRank}
              />
            ))}
          </div>
        )}

        {/* Current user rank footer */}
        {myRank !== null && myRank !== undefined ? (
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>Your rank</span>
            <span className="font-bold text-foreground tabular-nums">
              #{myRank}
            </span>
          </div>
        ) : myTotalPredictions < 15 ? (
          <p className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground text-center">
            You need {15 - myTotalPredictions} more resolved prediction
            {15 - myTotalPredictions !== 1 ? "s" : ""} to appear on the
            leaderboard.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

export default function UserPredictions() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-1">
        <StatsCard />
      </div>
      <div className="md:col-span-1">
        <LeaderboardCard />
      </div>
      <div className="md:col-span-2">
        <HistoryCard />
      </div>
    </div>
  );
}
