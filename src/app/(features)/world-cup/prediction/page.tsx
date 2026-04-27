"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorldCupGroups,
  useWorldCupDeadline,
  useMyPrediction,
  useSubmitPrediction,
  useUpdatePrediction,
  useChampionPercentages,
} from "@/services/fastapi/world-cup-vote";
import type {
  WorldCupTeamWithPercentage,
  WorldCupGroupResponse,
} from "@/type/fastapi/world-cup-vote";
import { VotingModal, TeamLogo, CheckIcon } from "./components/world-cup-vote";

// ─── tiny inline icons (kept here so the file stays self-contained) ──────────

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4V2h10v2h3v3a5 5 0 0 1-4 4.9V13a4 4 0 0 1-3 3.87V19h3v2H8v-2h3v-2.13A4 4 0 0 1 8 13v-1.1A5 5 0 0 1 4 7V4h3zm0 2H6v1a3 3 0 0 0 1.5 2.6A5 5 0 0 1 7 8V6zm10 0v2a5 5 0 0 1-.5 1.6A3 3 0 0 0 18 7V6h-1z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a5 5 0 0 1 5 5v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function useCountdown(iso: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!iso) return null;
  const target = new Date(iso).getTime();
  const diff = target - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { d, h, m, s, urgent: d === 0 && h < 24 };
}

// ─── TeamRow (shared between group card and champion list) ───────────────────

function TeamRow({
  team,
  rank,
  isPicked,
  size = "sm",
}: {
  team: WorldCupTeamWithPercentage;
  rank: number;
  isPicked: boolean;
  size?: "sm" | "md";
}) {
  const pct = team.prediction_percentage;
  return (
    <div
      className={`relative flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
        isPicked
          ? "bg-amber-400/10 dark:bg-amber-400/[0.08]"
          : "hover:bg-muted/40"
      }`}
    >
      {isPicked && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[3px] rounded-r bg-amber-400"
        />
      )}

      <span
        className={`w-4 text-xs md:text-sm font-bold tabular-nums ${
          rank === 1 ? "text-amber-500" : "text-muted-foreground/60"
        }`}
      >
        {rank}
      </span>

      <TeamLogo
        src={team.logo_url}
        name={team.name}
        size={size === "md" ? 22 : 18}
      />

      <span
        className={`flex-1 min-w-0 truncate ${
          size === "md" ? "text-xs" : "text-sm"
        } ${
          isPicked
            ? "font-bold text-foreground"
            : "font-medium text-foreground/85"
        }`}
      >
        {team.name}
      </span>

      {isPicked && (
        <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-950 shadow-sm">
          <CheckIcon className="w-2.5 h-2.5" aria-hidden />
          Pick
        </span>
      )}

      <span
        className={`w-10 text-right text-xs md:text-sm tabular-nums ${
          isPicked ? "font-semibold text-foreground" : "text-muted-foreground"
        }`}
      >
        {pct.toFixed(1)}%
      </span>

      {/* Thin underline bar — one pixel, cleaner than a full progress row */}
      <span
        aria-hidden
        className="absolute bottom-0 left-2 right-2 h-[2px] md:h-[2.5px] rounded-full bg-muted overflow-hidden"
      >
        <span
          className={`block h-full rounded-full transition-all duration-500 ${
            isPicked ? "bg-amber-400" : "bg-primary-font/60"
          }`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </span>
    </div>
  );
}

// ─── GroupCard ───────────────────────────────────────────────────────────────

function GroupCard({
  group,
  localPick,
}: {
  group: WorldCupGroupResponse;
  localPick: number | null;
}) {
  const sorted = useMemo(
    () =>
      [...group.teams].sort(
        (a, b) => b.prediction_percentage - a.prediction_percentage,
      ),
    [group.teams],
  );
  const pickedTeam =
    localPick != null ? sorted.find((t) => t.id === localPick) : null;

  return (
    <div className="group relative rounded-2xl bg-card border border-border/80 p-3.5 pt-3 transition-colors hover:border-border">
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-border/60">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-primary-font text-white font-black text-md tracking-tight">
          {group.group_letter}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 leading-none">
            Group {group.group_letter}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((team, i) => (
          <TeamRow
            key={team.id}
            team={team}
            rank={i + 1}
            isPicked={localPick === team.id}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ChampionPanel (podium + full list) ──────────────────────────────────────

function PodiumSlot({
  team,
  place,
  isPicked,
}: {
  team: WorldCupTeamWithPercentage | undefined;
  place: 1 | 2 | 3;
  isPicked: boolean;
}) {
  const heights = { 1: "h-20 sm:h-24", 2: "h-14 sm:h-16", 3: "h-10 sm:h-12" };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const orderMd = { 1: "md:order-2", 2: "md:order-1", 3: "md:order-3" };

  if (!team) return <div className={`flex-1 ${orderMd[place]}`} />;

  return (
    <div className={`flex-1 flex flex-col items-center ${orderMd[place]}`}>
      <span className="text-lg sm:text-xl mb-1" aria-hidden>
        {medals[place]}
      </span>
      <div
        className={`relative flex flex-col items-center gap-1.5 px-2 pt-2 pb-1.5 rounded-t-xl w-full min-w-0 ${
          place === 1
            ? "bg-gradient-to-b from-amber-400/25 to-amber-400/5 border-x border-t border-amber-400/40"
            : "bg-muted/40 border-x border-t border-border/60"
        } ${isPicked ? "ring-2 ring-amber-400" : ""}`}
      >
        <TeamLogo
          src={team.logo_url}
          name={team.name}
          size={place === 1 ? 40 : 28}
        />
        <p
          className={`text-xs sm:text-md font-bold text-center leading-tight w-full truncate ${
            place === 1 ? "text-foreground" : "text-foreground/85"
          }`}
        >
          {team.name}
        </p>
        <p
          className={`text-xs tabular-nums font-semibold ${
            place === 1
              ? "text-amber-500 dark:text-amber-400"
              : "text-muted-foreground"
          }`}
        >
          {team.prediction_percentage.toFixed(1)}%
        </p>
      </div>
      <div
        className={`${heights[place]} w-full rounded-b-md flex items-start justify-center pt-1 ${
          place === 1
            ? "bg-gradient-to-b from-amber-400/30 to-amber-400/10 border-x border-b border-amber-400/30"
            : "bg-muted/30 border-x border-b border-border/60"
        }`}
      >
        <span
          className={`text-[10px] font-black ${
            place === 1
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground/70"
          }`}
        >
          #{place}
        </span>
      </div>
    </div>
  );
}

function ChampionPanel({
  teams,
  isLoading,
  currentChampionId,
}: {
  teams: WorldCupTeamWithPercentage[] | undefined;
  isLoading: boolean;
  currentChampionId: number | null;
}) {
  const sorted = useMemo(
    () =>
      teams
        ? [...teams].sort(
            (a, b) => b.prediction_percentage - a.prediction_percentage,
          )
        : [],
    [teams],
  );
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const myChampion =
    currentChampionId != null
      ? sorted.find((t) => t.id === currentChampionId)
      : null;

  return (
    <section className="rounded-2xl border border-border/80 bg-card overflow-hidden">
      {/* Header strip */}
      <div className="relative px-4 py-3.5 sm:px-5 sm:py-4 border-b border-border/60 bg-gradient-to-r from-amber-400/10 via-transparent to-transparent">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
            <TrophyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
              Who lifts the trophy?
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
              Live community picks · updated in real time
            </p>
          </div>
          {myChampion && (
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-1.5">
              <TeamLogo
                src={myChampion.logo_url}
                name={myChampion.name}
                size={18}
              />
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 max-w-[10ch] truncate">
                {myChampion.name}
              </span>
            </div>
          )}
        </div>

        {myChampion && (
          <div className="sm:hidden flex items-center gap-2 mt-3 rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-1.5 w-fit max-w-full">
            <TeamLogo
              src={myChampion.logo_url}
              name={myChampion.name}
              size={16}
            />
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 truncate">
              Your pick · {myChampion.name}
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="h-3 flex-1 rounded" />
              <Skeleton className="h-3 w-10 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && sorted.length > 0 && (
        <>
          {/* Podium */}
          <div className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
            <div className="flex items-end gap-2 sm:gap-3 md:max-w-md md:mx-auto">
              <PodiumSlot
                team={top3[1]}
                place={2}
                isPicked={top3[1]?.id === currentChampionId}
              />
              <PodiumSlot
                team={top3[0]}
                place={1}
                isPicked={top3[0]?.id === currentChampionId}
              />
              <PodiumSlot
                team={top3[2]}
                place={3}
                isPicked={top3[2]?.id === currentChampionId}
              />
            </div>
          </div>

          {/* Divider */}
          {rest.length > 0 && (
            <div className="flex items-center gap-3 px-4 sm:px-5 pt-4 pb-2">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Contenders
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
          )}

          {/* Rest list — 2 columns on md+, stacked on mobile */}
          {rest.length > 0 && (
            <div className="px-2 pb-3 sm:px-3 sm:pb-4 grid grid-cols-1 md:grid-cols-2 gap-x-2">
              {rest.map((team, i) => (
                <TeamRow
                  key={team.id}
                  team={team}
                  rank={i + 4}
                  isPicked={team.id === currentChampionId}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── ActionBar (progress + CTA + deadline) ───────────────────────────────────

function ActionBar({
  deadline,
  countdown,
  votingClosed,
  hasExistingPrediction,
  groupPickCount,
  totalGroups,
  championPicked,
  onOpen,
}: {
  deadline: { deadline: string; is_open: boolean } | undefined;
  countdown: ReturnType<typeof useCountdown>;
  votingClosed: boolean;
  hasExistingPrediction: boolean;
  groupPickCount: number;
  totalGroups: number;
  championPicked: boolean;
  onOpen: () => void;
}) {
  const totalPicks = totalGroups + 1;
  const donePicks = groupPickCount + (championPicked ? 1 : 0);
  const progressPct = Math.round((donePicks / totalPicks) * 100);
  const allDone = donePicks === totalPicks;

  const ctaLabel = votingClosed
    ? "Voting closed"
    : allDone
      ? hasExistingPrediction
        ? "Review & edit bracket"
        : "Review & submit"
      : hasExistingPrediction
        ? "Update your bracket"
        : donePicks === 0
          ? "Start your bracket"
          : "Continue bracket";

  return (
    <div className="relative rounded-2xl border border-border/80 bg-card overflow-hidden">
      {/* Decorative gold stripe */}
      <div
        aria-hidden
        className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80"
      />

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Row 1: status chip + countdown */}
        <div className="flex items-center gap-2 flex-wrap">
          {votingClosed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <LockIcon className="w-3 h-3" />
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              Voting open
            </span>
          )}

          {deadline && !votingClosed && countdown && (
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold tabular-nums ${
                countdown.urgent
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              <ClockIcon className="w-3.5 h-3.5" />
              {countdown.d > 0
                ? `${countdown.d}d ${countdown.h}h left`
                : countdown.h > 0
                  ? `${countdown.h}h ${countdown.m}m left`
                  : `${countdown.m}m ${String(countdown.s).padStart(2, "0")}s left`}
            </span>
          )}

          {deadline && (
            <span className="hidden md:block text-[11px] md:text-xs text-muted-foreground/80 ml-auto">
              Closes {formatDeadline(deadline.deadline)}
            </span>
          )}
        </div>

        {/* Row 2: progress ring-ish + counter */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-xl font-black tabular-nums leading-none">
                {donePicks}
                <span className="text-muted-foreground/50 font-bold">
                  /{totalPicks}
                </span>
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                picks locked in
              </span>
            </div>

            <div className="mt-2 h-1 md:h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  allDone
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : "bg-primary-font"
                }`}
                style={{
                  width: `${Math.max(progressPct, donePicks > 0 ? 4 : 0)}%`,
                }}
              />
            </div>

            {/* Tiny per-group dots */}
            <div className="mt-2 flex flex-wrap gap-1">
              {Array.from({ length: totalGroups }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
                    i < groupPickCount
                      ? "bg-primary-font"
                      : "bg-muted border border-border"
                  }`}
                />
              ))}
              <span
                className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ml-0.5 ${
                  championPicked
                    ? "bg-amber-400 ring-2 ring-amber-400/30"
                    : "bg-muted border border-amber-400/40"
                }`}
                title="Champion pick"
              />
            </div>
          </div>
        </div>

        {/* Row 3: CTA */}
        <button
          onClick={onOpen}
          disabled={votingClosed}
          className={`group/btn w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl text-sm sm:text-[15px] font-bold transition-all duration-150 ${
            votingClosed
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary-font text-white hover:opacity-95 active:scale-[0.99] shadow-sm shadow-primary-font/20"
          }`}
        >
          {votingClosed ? (
            <LockIcon className="w-4 h-4" />
          ) : (
            <TrophyIcon className="w-4 h-4" />
          )}
          {ctaLabel}
          {!votingClosed && (
            <ChevronRightIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── skeletons ───────────────────────────────────────────────────────────────

function GroupCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-border/60">
        <Skeleton className="w-7 h-7 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-16 rounded" />
          <Skeleton className="h-2.5 w-24 rounded" />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1">
          <Skeleton className="w-4 h-3 rounded" />
          <Skeleton className="w-[18px] h-[18px] rounded-full" />
          <Skeleton className="h-3 flex-1 rounded" />
          <Skeleton className="h-3 w-10 rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WorldCupPredictionPage() {
  const [votingModalOpen, setVotingModalOpen] = useState(false);
  const [groupPicks, setGroupPicks] = useState<Record<string, number>>({});
  const [championId, setChampionId] = useState<number | null>(null);

  const { data: groups, isLoading: groupsLoading } = useWorldCupGroups();
  const { data: deadline, isLoading: deadlineLoading } = useWorldCupDeadline();
  const {
    data: existingPrediction,
    isLoading: predictionLoading,
    error: predictionError,
  } = useMyPrediction();
  const { data: champions, isLoading: championsLoading } =
    useChampionPercentages();

  const submitMutation = useSubmitPrediction();
  const updateMutation = useUpdatePrediction();
  const countdown = useCountdown(deadline?.deadline);

  const hasExistingPrediction = !!existingPrediction && !predictionError;
  const votingClosed =
    !!existingPrediction?.is_locked || (!!deadline && !deadline.is_open);

  useEffect(() => {
    if (!existingPrediction) {
      setGroupPicks({});
      setChampionId(null);
      return;
    }
    const picks: Record<string, number> = {};
    for (const gp of existingPrediction.group_predictions) {
      if (gp.winner_team_id != null) picks[gp.group_letter] = gp.winner_team_id;
    }
    setGroupPicks(picks);
    if (existingPrediction.champion_team_id != null) {
      setChampionId(existingPrediction.champion_team_id);
    }
  }, [existingPrediction]);

  async function handleSave(
    picks: Record<string, number>,
    champTeamId: number,
  ): Promise<void> {
    if (!groups) throw new Error("Groups not loaded.");

    const payload = {
      group_predictions: groups.map((g) => ({
        group_letter: g.group_letter,
        winner_team_id: picks[g.group_letter],
      })),
      champion_team_id: champTeamId,
    };

    if (hasExistingPrediction) {
      await updateMutation.mutateAsync(payload);
    } else {
      await submitMutation.mutateAsync(payload);
    }

    setGroupPicks(picks);
    setChampionId(champTeamId);
  }

  const isLoading = groupsLoading || deadlineLoading;

  const sortedGroups = useMemo(
    () =>
      groups
        ? [...groups].sort((a, b) =>
            a.group_letter.localeCompare(b.group_letter),
          )
        : [],
    [groups],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8 pb-20 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 sm:h-9 w-2/3 max-w-sm rounded" />
          <Skeleton className="h-3.5 w-1/2 max-w-[18rem] rounded" />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const groupPickCount = Object.keys(groupPicks).length;
  const totalGroups = groups?.length ?? 12;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8 pb-20 space-y-4 sm:space-y-6">
      {/* ── Title ── */}
      <header className="flex ">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-amber-400" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
              Predictions · World Cup 2026
            </span>
          </div>
          <h1 className="text-md sm:text-lg lg:text-xl font-black tracking-tight leading-[1.05]">
            Build your bracket.
            <span className="text-muted-foreground/70">
              {" "}
              Call the champion.
            </span>
          </h1>
        </div>
      </header>

      {/* ── Action bar (sticky on mobile for quick access) ── */}
      <div className="sticky top-2 z-20 sm:static">
        <ActionBar
          deadline={deadline}
          countdown={countdown}
          votingClosed={votingClosed}
          hasExistingPrediction={hasExistingPrediction}
          groupPickCount={groupPickCount}
          totalGroups={totalGroups}
          championPicked={championId != null}
          onOpen={() => setVotingModalOpen(true)}
        />
      </div>

      {/* ── Groups section ── */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-[0.14em] leading-none">
              Group stage
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
              {groupPickCount} of {totalGroups} groups decided
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> your pick
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-font/60" />{" "}
              community
            </span>
          </div>
        </div>

        {groups && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {sortedGroups.map((group) => (
              <GroupCard
                key={group.group_letter}
                group={group}
                localPick={groupPicks[group.group_letter] ?? null}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Champion podium ── */}
      <section className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-sm sm:text-base font-black uppercase tracking-[0.14em] leading-none">
            Championship
          </h2>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
            The one team to rule them all
          </p>
        </div>

        <ChampionPanel
          teams={champions}
          isLoading={championsLoading}
          currentChampionId={championId}
        />
      </section>

      {groups && (
        <VotingModal
          open={votingModalOpen}
          onClose={() => setVotingModalOpen(false)}
          groups={groups}
          initialPicks={groupPicks}
          initialChampionId={championId}
          hasExistingPrediction={hasExistingPrediction}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
