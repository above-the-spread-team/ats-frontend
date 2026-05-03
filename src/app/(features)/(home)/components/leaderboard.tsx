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
import HomeFailToLoad from "./home-fail-to-load";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TABS: { value: LeaderboardTimeRange; label: string; wc?: boolean }[] = [
  { value: "world_cup_2026", label: "World Cup 2026", wc: true },
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
  const [showAll, setShowAll] = useState(false);

  if (isLoading) return <LeaderboardSkeleton rows={3} />;

  if (error || !data) {
    return <HomeFailToLoad message="Could not load leaderboard" />;
  }

  if (data.top_10.length === 0) {
    if (timeRange === "world_cup_2026") {
      return (
        <div className="py-6 flex flex-col items-center gap-4 text-center">
          {/* Icon + prize callout */}
          <div className="w-10 h-10 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>

          <div className="space-y-1 max-w-xs md:max-w-md">
            <p className="text-sm md:text-base font-semibold text-foreground">
              Be the first on the board — win{" "}
              <span className="text-amber-500 dark:text-amber-400">
                $500 USD
              </span>
            </p>
            <p className="text-xs md:text-sm font-medium text-muted-foreground leading-relaxed">
              No one has qualified yet. The #1 predictor across the FIFA World
              Cup 2026 (Jun 11 – Jul 20) takes the prize.
            </p>
          </div>

          {/* How-to steps */}
          <div className="w-full max-w-xs md:max-w-md rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 space-y-2 text-left">
            {[
              { step: "1", text: "Vote on today's matches every day" },
              { step: "2", text: "Hit at least 15 resolved games to qualify" },
              { step: "3", text: "Stay #1 on this board to claim $1,000 USD" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-2.5">
                <span className="mt-px flex-shrink-0 w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-500 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center leading-none">
                  {step}
                </span>
                <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    }

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

  const visible = showAll ? data.top_10 : data.top_10.slice(0, 3);
  const remaining = data.top_10.length - 3;
  const currentUserId = data.user_entry?.user_id ?? null;
  // True when the authenticated user is already visible in the top-10 list
  // const currentUserInTop10 =
  //   currentUserId !== null &&
  //   data.top_10.some((e) => e.user_id === currentUserId);

  return (
    <div>
      <ColumnHeaders />
      <div className="space-y-1">
        {visible.map((entry) => (
          <LeaderboardRow
            key={entry.user_id}
            entry={entry}
            isCurrentUser={entry.user_id === currentUserId}
          />
        ))}
      </div>
      {data.top_10.length > 3 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-2 w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
        >
          {showAll ? (
            <>
              Show less
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 15.75l7.5-7.5 7.5 7.5"
                />
              </svg>
            </>
          ) : (
            <>
              Show {remaining} more
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </>
          )}
        </button>
      )}

      {/* Authenticated user's rank — always shown, even when already in top 10 */}
      {data.user_entry && (
        <div className="border-t pt-2 border-border/80">
          <LeaderboardRow entry={data.user_entry} isCurrentUser />
        </div>
      )}
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
    <div className="-mx-4 md:mx-0 px-1 overflow-x-auto scrollbar-hide">
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-max">
        {TABS.map(({ value, label, wc }) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              className={cn(
                "px-3 py-1 rounded-2xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1 whitespace-nowrap",
                wc
                  ? isActive
                    ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-zinc-950 shadow-sm shadow-amber-500/30"
                    : "text-amber-600 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300"
                  : isActive
                    ? "bg-primary-font text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {wc && <span className="text-[11px] leading-none">⚽</span>}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState<LeaderboardTimeRange>("overall");

  return (
    <section className="space-y-4">
      <div className="flex flex-col  lg:flex-row lg:items-center lg:justify-between gap-3">
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

      <div className="relative overflow-hidden rounded-xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/8 to-transparent px-4 py-3 flex items-center gap-3">
        <div className="absolute -left-4 -top-4 h-16 w-16 rounded-full bg-amber-400/25 blur-2xl pointer-events-none" />
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-amber-300/5 to-transparent pointer-events-none" />
        <span className="text-2xl leading-none select-none flex-shrink-0">
          🏆
        </span>
        <div className="min-w-0">
          <p className="text-sm md:text-base font-semibold text-foreground leading-snug">
            FIFA World Cup 2026 Challenge
          </p>
          <p className="text-xs md:text-sm text-muted-foreground leading-snug mt-0.5">
            The{" "}
            <span className="font-bold text-amber-600 dark:text-amber-400">
              #1 predictor
            </span>{" "}
            across the tournament (Jun 11 – Jul 20) wins{" "}
            <span className="font-bold text-sm md:text-base text-amber-600 dark:text-amber-400">
              $1000 USD
            </span>
            . Min 15 resolved games to qualify.
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-xl shadow-sm overflow-hidden">
        <div className="py-2 md:py-3 px-2 md:px-3">
          <LeaderboardTable timeRange={timeRange} />
        </div>
      </div>
    </section>
  );
}
