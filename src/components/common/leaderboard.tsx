import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/type/fastapi/predictions";

// ---------------------------------------------------------------------------
// Top-3 medal styles (shared across leaderboard surfaces)
// ---------------------------------------------------------------------------

export const TOP3: Record<
  number,
  { emoji: string; rowCls: string; rankCls: string; glow: string }
> = {
  1: {
    emoji: "🥇",
    rowCls: "bg-yellow-500/5 border border-yellow-500/20",
    rankCls: "text-yellow-500",
    glow: "shadow-[0_0_12px_rgba(234,179,8,0.15)]",
  },
  2: {
    emoji: "🥈",
    rowCls: "bg-slate-400/5 border border-slate-400/20",
    rankCls: "text-slate-400",
    glow: "",
  },
  3: {
    emoji: "🥉",
    rowCls: "bg-amber-700/5 border border-amber-700/20",
    rankCls: "text-amber-700",
    glow: "",
  },
};

// ---------------------------------------------------------------------------
// UserAvatar
// ---------------------------------------------------------------------------

export function UserAvatar({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={32}
        height={32}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-border/40"
      />
    );
  }
  return (
    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground flex-shrink-0 ring-1 ring-border/40">
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

// ---------------------------------------------------------------------------
// LeaderboardRow
// ---------------------------------------------------------------------------

export function LeaderboardRow({
  entry,
  isCurrentUser = false,
}: {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
}) {
  const top = TOP3[entry.rank];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-1.5 md:py-2 rounded-lg transition-colors",
        top
          ? `${top.rowCls} ${top.glow}`
          : isCurrentUser
            ? "bg-primary/5 border border-primary/20"
            : "hover:bg-muted/40",
      )}
    >
      {/* Rank */}
      <div className="w-7 flex-shrink-0 text-center">
        {top ? (
          <span className="text-lg leading-none select-none">{top.emoji}</span>
        ) : (
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar + username */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <UserAvatar src={entry.avatar_url} name={entry.username} />
        <span
          className={cn(
            "text-sm truncate",
            top || isCurrentUser ? "font-semibold" : "font-medium",
          )}
        >
          {entry.username}
          {isCurrentUser && (
            <span className="ml-1 text-[10px] text-primary-font">(you)</span>
          )}
        </span>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <div className="flex items-center gap-1">
          <p className="text-[11px] text-muted-foreground">score:</p>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              top ? top.rankCls : "text-foreground",
            )}
          >
            {entry.score.toFixed(1)}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {entry.accuracy.toFixed(1)}%&nbsp;·&nbsp;{entry.correct_predictions}/
          {entry.total_games}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LeaderboardSkeleton
// ---------------------------------------------------------------------------

export function LeaderboardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <Skeleton className="w-7 h-4 rounded flex-shrink-0" />
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
