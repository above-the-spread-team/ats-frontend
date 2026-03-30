import { cn } from "@/lib/utils";
import { barSegmentWidths } from "@/lib/vote-bar-segments";
import type { FixtureVotesResult, VoteChoice } from "@/type/fastapi/vote";

const SEGMENT_ORDER: VoteChoice[] = ["home", "draw", "away"];

const SEGMENT_BG: Record<VoteChoice, string> = {
  home: "bg-vote-blue",
  draw: "bg-vote-yellow",
  away: "bg-vote-red",
};

export type VotingBarSegmentStyle = "flat" | "emphasize-pick";

export interface VotingBarProps {
  fixture: FixtureVotesResult;
  /**
   * Bar height below the `md` breakpoint.
   * With `mdSize`, use `size` for mobile and `mdSize` from `md` up (e.g. `size="sm" mdSize="md"`).
   */
  size?: "sm" | "md";
  /** Optional height from `md` breakpoint upward. Omit for a single fixed `size`. */
  mdSize?: "sm" | "md";
  /** Classes for the track behind segments (e.g. `bg-muted/30`, `bg-white/20`). */
  trackClassName?: string;
  className?: string;
  /**
   * `flat` — full opacity on all segments (e.g. home vote list).
   * `emphasize-pick` — dim non-picked segments when the user voted; if `userVote` is null, all segments use reduced opacity.
   */
  segmentStyle?: VotingBarSegmentStyle;
  /** Used with `segmentStyle="emphasize-pick"` only. */
  userVote?: VoteChoice | null;
}

function segmentOpacityClass(
  segmentStyle: VotingBarSegmentStyle,
  userVote: VoteChoice | null,
  key: VoteChoice,
): string {
  if (segmentStyle === "flat") return "opacity-100";
  if (userVote == null) return "opacity-85";
  return userVote === key ? "opacity-100" : "opacity-85";
}

function sizeHeightClass(s: "sm" | "md"): string {
  return s === "sm" ? "h-1.5 min-h-1.5" : "h-2 min-h-2";
}

/** Literal classes only — keeps Tailwind from purging `md:*` height utilities. */
const RESPONSIVE_BAR_HEIGHT: Record<
  `${"sm" | "md"}-${"sm" | "md"}`,
  string
> = {
  "sm-sm": "h-1.5 min-h-1.5 md:h-1.5 md:min-h-1.5",
  "sm-md": "h-1.5 min-h-1.5 md:h-2 md:min-h-2",
  "md-sm": "h-2 min-h-2 md:h-1.5 md:min-h-1.5",
  "md-md": "h-2 min-h-2",
};

function barHeightClass(size: "sm" | "md", mdSize?: "sm" | "md"): string {
  if (mdSize === undefined) return sizeHeightClass(size);
  return RESPONSIVE_BAR_HEIGHT[`${size}-${mdSize}`];
}

export function VotingBar({
  fixture,
  size = "md",
  mdSize,
  trackClassName,
  className,
  segmentStyle = "flat",
  userVote = null,
}: VotingBarProps) {
  const heights = barHeightClass(size, mdSize);
  const widths = barSegmentWidths(fixture);

  return (
    <div
      className={cn(
        "flex w-full rounded-full overflow-hidden",
        heights,
        trackClassName,
        className,
      )}
    >
      {SEGMENT_ORDER.map((key, i) => (
        <div
          key={key}
          style={{ width: `${widths[i]}%` }}
          className={cn(
            SEGMENT_BG[key],
            "shrink-0 min-w-[3px] transition-all duration-500",
            segmentOpacityClass(segmentStyle, userVote ?? null, key),
          )}
        />
      ))}
    </div>
  );
}
