"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeaderboard } from "@/services/fastapi/predictions";
import type { LeaderboardTimeRange } from "@/type/fastapi/predictions";
import {
  LeaderboardRow,
  LeaderboardSkeleton,
} from "@/components/common/leaderboard";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: { value: LeaderboardTimeRange; label: string }[] = [
  { value: "overall", label: "Overall" },
  { value: "monthly", label: "This Month" },
  { value: "last_month", label: "Last Month" },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ColumnHeaders() {
  return (
    <div className="hidden sm:flex items-center gap-3 px-3 pb-2.5 border-b border-border/40 mb-1">
      <div className="w-7 flex-shrink-0" />
      <p className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Player
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
        Score&nbsp;·&nbsp;Acc&nbsp;·&nbsp;W/G
      </p>
    </div>
  );
}

function LeaderboardTable({ timeRange }: { timeRange: LeaderboardTimeRange }) {
  const { data, isLoading, error } = useLeaderboard(timeRange);

  if (isLoading) return <LeaderboardSkeleton rows={8} />;

  if (error || !data) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Could not load leaderboard. Please try again.
      </p>
    );
  }

  if (data.top_10.length === 0) {
    return (
      <div className="py-12 text-center space-y-1">
        <Trophy className="w-8 h-8 mx-auto text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No qualified players yet.
        </p>
        <p className="text-xs text-muted-foreground/60">
          Players need at least 15 resolved games to appear.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ColumnHeaders />
      <div className="space-y-1 ">
        {data.top_10.map((entry) => (
          <LeaderboardRow key={entry.user_id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab switcher
// ---------------------------------------------------------------------------

function TabBar({
  active,
  onChange,
}: {
  active: LeaderboardTimeRange;
  onChange: (v: LeaderboardTimeRange) => void;
}) {
  return (
    <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            "px-3 py-1 rounded-2xl text-xs sm:text-sm font-medium transition-all",
            active === value
              ? "bg-primary-font text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState<LeaderboardTimeRange>("monthly");

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base md:text-lg font-bold leading-tight">
            Leaderboard
          </h2>
          <p className="text-[11px] md:text-sm text-muted-foreground leading-tight">
            Top 10 · min 15 resolved games
          </p>
        </div>
        <TabBar active={timeRange} onChange={setTimeRange} />
      </div>

      {/* Prize banner */}
      <div className="relative overflow-hidden rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-transparent px-4 py-3 flex items-center gap-3">
        {/* Decorative glow */}
        <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-yellow-400/20 blur-2xl pointer-events-none" />
        <span className="text-2xl leading-none select-none flex-shrink-0">
          🏆
        </span>
        <div className="min-w-0">
          <p className="text-sm md:text-basefont-semibold font-semibold text-foreground leading-snug">
            Monthly Champion Prize
          </p>
          <p className="text-xs md:text-sm text-muted-foreground leading-snug mt-0.5">
            The{" "}
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
              #1 player
            </span>{" "}
            at the end of each month wins{" "}
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
              $100 USD
            </span>
            . Keep predicting to climb the ranks!
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4">
          <LeaderboardTable timeRange={timeRange} />
        </div>
      </div>
    </section>
  );
}
