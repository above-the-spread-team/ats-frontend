"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAvailableFixtures,
  useVote,
  useVoteTodayPopup,
  useDismissVoteTodayPopup,
  RateLimitError,
} from "@/services/fastapi/vote";
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

function formatCooldown(seconds: number): string {
  if (seconds <= 0) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function FixtureVoteRow({
  fixture,
  canVote,
  voted,
  onVoted,
}: {
  fixture: FixtureSummary;
  canVote: boolean;
  voted: VoteChoice | null;
  onVoted: (choice: VoteChoice | null) => void;
}) {
  const { vote } = useVote();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0); // seconds remaining
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const matchTime = new Date(fixture.match_date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleVote = async (choice: VoteChoice) => {
    if (cooldown > 0) return;
    setError(null);
    onVoted(choice); // optimistic — show locked state immediately
    try {
      await vote(fixture.fixture_id, choice);
    } catch (e) {
      onVoted(null); // revert on failure
      if (e instanceof RateLimitError) {
        setError(`Rate limit reached — next slot opens in`);
        startCooldown(e.retryAfter);
        return;
      }
      const msg = e instanceof Error ? e.message : "Failed to submit";
      if (msg.toLowerCase().includes("already voted")) return;
      setError(msg);
    }
  };

  const votedMeta = voted ? VOTE_META.find((v) => v.key === voted) : null;

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

      <div className="rounded-lg border border-border bg-muted/30 px-2 py-1.5">
        {voted && votedMeta ? (
          <div className="flex w-full justify-center items-center min-h-8 sm:min-h-9">
            <div className="flex items-center gap-2 min-w-0 max-w-full">
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full ${votedMeta.bg} flex items-center justify-center flex-shrink-0`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </span>
              <div className="min-w-0 flex flex-col justify-center leading-tight">
                <p className="text-[10px] text-muted-foreground">
                  Your prediction
                </p>
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate max-w-[40vw] sm:max-w-[14rem]">
                  {voted === "home"
                    ? fixture.home_team
                    : voted === "away"
                      ? fixture.away_team
                      : "Draw"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid w-full min-h-8 sm:min-h-9 grid-cols-3 gap-1.5 items-stretch">
            {VOTE_META.map((v) => (
              <button
                key={v.key}
                disabled={!canVote || cooldown > 0}
                onClick={() => handleVote(v.key)}
                className={[
                  "flex h-full min-h-0 items-center justify-center rounded-md py-1 text-[11px] sm:text-xs font-bold text-white transition-all truncate px-0.5",
                  v.bg,
                  !canVote || cooldown > 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:brightness-110 active:scale-95",
                ].join(" ")}
              >
                {v.key === "home" ? "Home" : v.key === "away" ? "Away" : "Draw"}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-1.5 rounded-md bg-destructive/10 px-3 py-1.5">
          <p className="text-xs text-destructive text-center">
            {error}
            {cooldown > 0 && (
              <span className="font-semibold tabular-nums ml-1">
                {formatCooldown(cooldown)}
              </span>
            )}
          </p>
        </div>
      )}
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
  onVoted: (fixtureId: number, choice: VoteChoice | null) => void;
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

function VotePopupContent() {
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow">("today");
  const { data, isLoading, error } = useAvailableFixtures(selectedDay);

  // In-session votes (immediate UI feedback before next refetch)
  const [localVotedMap, setLocalVotedMap] = useState<
    Record<number, VoteChoice>
  >({});

  // Server-side votes from user_vote field (populated via X-Voter-Id)
  const serverVotedMap = useMemo<Record<number, VoteChoice>>(() => {
    if (!data) return {};
    return Object.fromEntries(
      data
        .filter((f) => f.user_vote !== null)
        .map((f) => [f.fixture_id, f.user_vote as VoteChoice]),
    );
  }, [data]);

  // Merged: local in-session overrides server (for instant feedback)
  const votedMap = useMemo(
    () => ({ ...serverVotedMap, ...localVotedMap }),
    [serverVotedMap, localVotedMap],
  );

  const handleVoted = (fixtureId: number, choice: VoteChoice | null) => {
    setLocalVotedMap((prev) => {
      if (choice === null) {
        const next = { ...prev };
        delete next[fixtureId];
        return next;
      }
      return { ...prev, [fixtureId]: choice };
    });
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

  if (!data || data.length === 0) {
    return (
      <div className=" flex-col items-center justify-center pt-3 pb-12 gap-2 text-muted-foreground text-center px-6">
        {/* Day tabs still visible even in empty state */}
        <div className="w-full flex justify-start mb-10">
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
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-4xl">⚽</span>
          <p className="text-md font-medium text-foreground">
            {selectedDay === "tomorrow"
              ? "No fixtures scheduled for tomorrow"
              : "No fixtures available today"}
          </p>
          <p className="text-sm text-muted-foreground">
            🕐 All fixture times are displayed in UTC
          </p>
          <p className="text-xs">
            {selectedDay === "tomorrow"
              ? "Tomorrow's fixtures are pre-loaded at 00:20 UTC"
              : "All matches have finished or none were scheduled — check back tomorrow"}
          </p>
        </div>
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
            canVote={true}
            votedMap={votedMap}
            onVoted={handleVoted}
          />
        ))}
      </div>
    </>
  );
}

// ── shared dialog shell ────────────────────────────────────────────────────

/**
 * Internal shell: renders the Dialog frame + VotePopupContent.
 * Pass `trigger` to render a DialogTrigger (manual mode).
 * Omit `trigger` for controlled/auto mode.
 */
function VotePopupShell({
  open,
  onOpenChange,
  trigger,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
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
          <VotePopupContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── auto mode (layout.tsx) ─────────────────────────────────────────────────

/** ms until the next 00:30 UTC reset — used to schedule a query invalidation. */
function msUntilNextCutoff(): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 30),
  );
  if (now >= next) next.setUTCDate(next.getUTCDate() + 1);
  return next.getTime() - now.getTime();
}

/**
 * Mounts invisibly in the layout and opens the popup once per day.
 * All show/dismiss logic lives on the backend (GET + POST /api/v1/popup/vote-today).
 * Dismiss is called on open so multi-tab users only see it once.
 * Automatically re-checks at the next 00:30 UTC reset without a page refresh.
 */
export function VoteTodayAutoPopup() {
  const queryClient = useQueryClient();
  const { data } = useVoteTodayPopup();
  const { mutate: dismiss } = useDismissVoteTodayPopup();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (data?.show) {
      dismiss();
      setOpen(true);
    }
  }, [data?.show, dismiss]);

  useEffect(() => {
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["popup", "vote-today"] });
    }, msUntilNextCutoff());
    return () => clearTimeout(timer);
  }, [queryClient]);

  return <VotePopupShell open={open} onOpenChange={setOpen} />;
}

// ── manual mode (vote-result.tsx) ──────────────────────────────────────────

/**
 * Wrap any element to open the voting popup on click.
 * No auto-show or dismiss API calls — purely user-triggered.
 */
export function VoteDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <VotePopupShell open={open} onOpenChange={setOpen} trigger={children} />
  );
}
