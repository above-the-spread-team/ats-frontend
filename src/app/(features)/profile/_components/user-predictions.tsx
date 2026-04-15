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
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useMyStats,
  useMyHistory,
  useLeaderboard,
  useUserStats,
} from "@/services/fastapi/predictions";
import type { PredictionHistoryItem } from "@/type/fastapi/predictions";
import {
  LeaderboardRow,
  LeaderboardSkeleton,
} from "@/components/common/leaderboard";

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
  hero,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  accent?: string;
  hero?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3",
        hero ? "flex-row justify-between" : "flex-col justify-center py-4",
        accent ?? "bg-muted/40",
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-background/50",
          )}
        >
          <Icon className="h-4 w-4 text-foreground/80" />
        </div>
        {hero && (
          <p className="text-sm font-semibold text-foreground">{label}</p>
        )}
      </div>
      <div
        className={cn(
          "flex flex-col",
          hero ? "items-end" : "items-center gap-1",
        )}
      >
        <p
          className={cn(
            "font-bold tabular-nums text-foreground",
            hero ? "text-2xl" : "text-xl",
          )}
        >
          {value}
        </p>
        {!hero && (
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground text-center leading-tight">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

function StatsCard() {
  const { data, isLoading, error } = useMyStats();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
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
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            My Stats
          </p>
          <span className="text-[11px] text-muted-foreground/70">
            {data.correct_predictions}/{data.total_predictions} correct
          </span>
        </div>
        <div className="space-y-2">
          {/* Hero: Score */}
          <StatCell
            icon={Star}
            label="Score"
            value={data.score.toFixed(1)}
            accent="bg-violet-500/10 border border-violet-500/20"
            hero
          />
          {/* 2-col grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCell
              icon={Target}
              label="My Accuracy"
              value={`${data.user_accuracy.toFixed(1)}%`}
              accent="bg-primary/10"
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
                data.current_win_streak > 0 ? "bg-orange-500/10" : "bg-muted/40"
              }
            />
            <StatCell
              icon={Trophy}
              label="Best Streak"
              value={data.max_win_streak}
              accent="bg-yellow-500/10"
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground/60 mt-3">
          {data.total_players.toLocaleString()} player
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

function LeaderboardCard() {
  const { data: stats } = useMyStats();
  const { data, isLoading, error } = useLeaderboard();

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4">
          <LeaderboardSkeleton rows={5} />
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

  const myEntry = data.user_entry;
  const myTotalPredictions = stats?.total_predictions ?? 0;

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Leaderboard
          </p>
          <span className="text-xs text-muted-foreground">
            Score · min 15 games
          </span>
        </div>

        {data.top_10.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No qualified players yet.
          </p>
        ) : (
          <div className="space-y-0.5">
            {data.top_10.map((entry) => (
              <LeaderboardRow
                key={entry.user_id}
                entry={entry}
                isCurrentUser={entry.user_id === myEntry?.user_id}
              />
            ))}
          </div>
        )}

        {/* Current user rank footer */}
        {myEntry !== null && myEntry !== undefined ? (
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span>Your rank</span>
            <span className="font-bold text-foreground tabular-nums">
              #{myEntry.rank}
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
// Card — Public stats for another user
// ---------------------------------------------------------------------------

function PublicStatsCard({ userId }: { userId: number }) {
  const { data, isLoading, error } = useUserStats(userId);

  if (isLoading) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
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
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prediction Stats
          </p>
          <span className="text-[11px] text-muted-foreground/70">
            {data.correct_predictions}/{data.total_predictions} correct
          </span>
        </div>
        <div className="space-y-2">
          {/* Hero: Score */}
          <StatCell
            icon={Star}
            label="Score"
            value={data.score.toFixed(1)}
            accent="bg-primary-hero/10 border border-violet-500/20"
            hero
          />
          {/* 2-col grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCell
              icon={Target}
              label="Accuracy"
              value={`${data.user_accuracy.toFixed(1)}%`}
              accent="bg-primary/10"
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
                data.current_win_streak > 0 ? "bg-orange-500/10" : "bg-muted/40"
              }
            />
            <StatCell
              icon={Trophy}
              label="Best Streak"
              value={data.max_win_streak}
              accent="bg-yellow-500/10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Exported component
// ---------------------------------------------------------------------------

export default function UserPredictions({ userId }: { userId?: number }) {
  // Viewing another user: show their stats + overall leaderboard
  if (userId !== undefined) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-1">
          <PublicStatsCard userId={userId} />
        </div>
        <div className="md:col-span-1">
          <LeaderboardCard />
        </div>
      </div>
    );
  }

  // Viewing own profile: show my stats, leaderboard, and history
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
