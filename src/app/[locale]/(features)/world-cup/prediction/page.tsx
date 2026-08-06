"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorldCupGroups,
  useWorldCupDeadline,
  useMyVote,
  useSubmitVote,
  useUpdateVote,
  useChampionPercentages,
} from "@/services/fastapi/world-cup-vote";
import type {
  WorldCupTeamWithPercentage,
  WorldCupGroupResponse,
} from "@/type/fastapi/world-cup-vote";
import { VotingModal, TeamLogo, CheckIcon } from "./components/world-cup-vote";

// ─── tiny inline icons ────────────────────────────────────────────────────────

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

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── TeamRow ─────────────────────────────────────────────────────────────────

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
  localPicks,
}: {
  group: WorldCupGroupResponse;
  /** Up to 2 picked team IDs for this group */
  localPicks: number[];
}) {
  const sorted = useMemo(
    () =>
      [...group.teams].sort(
        (a, b) => b.prediction_percentage - a.prediction_percentage,
      ),
    [group.teams],
  );

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
            isPicked={localPicks.includes(team.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── ChampionPanel ───────────────────────────────────────────────────────────

function PodiumSlot({
  team,
  place,
  isPicked,
}: {
  team: WorldCupTeamWithPercentage | undefined;
  place: 1 | 2 | 3;
  isPicked: boolean;
}) {
  const heights = { 1: "h-10", 2: "h-8", 3: "h-6" };
  const orderMd = { 1: "md:order-2", 2: "md:order-1", 3: "md:order-3" };

  if (!team) return <div className={`flex-1 ${orderMd[place]}`} />;

  return (
    <div className={`flex-1 flex flex-col items-center ${orderMd[place]}`}>
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
          className={`text-xs sm:text-md max-w-[92px] md:max-w-full font-bold text-center leading-tight w-full truncate ${
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
          className={`text-[11px] md:text-xs font-black ${
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
  const [showAllContenders, setShowAllContenders] = useState(false);
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
  const visibleRest = showAllContenders ? rest : rest.slice(0, 8);
  const hiddenRestCount = Math.max(rest.length - visibleRest.length, 0);
  const myChampion =
    currentChampionId != null
      ? sorted.find((t) => t.id === currentChampionId)
      : null;

  return (
    <section className="rounded-2xl border border-border/80 bg-card overflow-hidden">
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
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400  truncate">
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
          <div className="px-2 pt-2 ">
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

          {rest.length > 0 && (
            <div className="flex items-center gap-3 px-4 sm:px-5 pt-4 pb-2">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Contenders
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
          )}

          {rest.length > 0 && (
            <div className="px-2 pb-3 sm:px-3 sm:pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2">
                {visibleRest.map((team, i) => (
                  <TeamRow
                    key={team.id}
                    team={team}
                    rank={i + 4}
                    isPicked={team.id === currentChampionId}
                  />
                ))}
              </div>

              {rest.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllContenders((prev) => !prev)}
                  className="mt-3 w-full rounded-xl border border-border/70 bg-muted/40 px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {showAllContenders
                    ? "Show less"
                    : `Show all teams (${hiddenRestCount} more)`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── Skeletons ───────────────────────────────────────────────────────────────

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
  /** 2 qualifier IDs per group letter */
  const [groupPicks, setGroupPicks] = useState<Record<string, number[]>>({});
  const [championId, setChampionId] = useState<number | null>(null);
  const [totalGoals, setTotalGoals] = useState<number | null>(null);

  const { data: groups, isLoading: groupsLoading } = useWorldCupGroups();
  const { data: deadline, isLoading: deadlineLoading } = useWorldCupDeadline();
  const { data: existingVote, error: voteError } = useMyVote();
  const { data: champions, isLoading: championsLoading } =
    useChampionPercentages();

  const submitMutation = useSubmitVote();
  const updateMutation = useUpdateVote();
  const hasExistingVote = !!existingVote && !voteError;
  const votingClosed = !!deadline && !deadline.is_open;

  // Sync local display state from server vote
  useEffect(() => {
    if (!existingVote) {
      setGroupPicks({});
      setChampionId(null);
      setTotalGoals(null);
      return;
    }
    const picks: Record<string, number[]> = {};
    for (const [group, ids] of Object.entries(existingVote.selections)) {
      picks[group] = [...ids];
    }
    setGroupPicks(picks);
    setChampionId(existingVote.champion_team_id ?? null);
    setTotalGoals(existingVote.total_goals ?? null);
  }, [existingVote]);

  async function handleSave(
    picks: Record<string, number[]>,
    champTeamId: number,
    goals: number,
  ): Promise<void> {
    const payload = {
      selections: picks,
      champion_team_id: champTeamId,
      total_goals: goals,
    };

    if (hasExistingVote) {
      await updateMutation.mutateAsync(payload);
    } else {
      await submitMutation.mutateAsync(payload);
    }

    setGroupPicks(picks);
    setChampionId(champTeamId);
    setTotalGoals(goals);
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

  // Count groups with exactly 2 picks
  const groupPickCount = Object.values(groupPicks).filter(
    (v) => v.length === 2,
  ).length;
  const totalGroups = groups?.length ?? 12;
  const heroCtaLabel = votingClosed
    ? "Voting Closed"
    : hasExistingVote
      ? "Edit Prediction"
      : groupPickCount > 0 || championId !== null || totalGoals !== null
        ? "Continue Prediction"
        : "Start Prediction";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-5 sm:py-8 pb-20 space-y-4 sm:space-y-6">
      {/* Prize hero */}
      <header className="relative overflow-hidden rounded-3xl border border-amber-400/25 bg-zinc-950 text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(251,191,36,0.34),transparent_32%),radial-gradient(circle_at_88%_20%,rgba(16,185,129,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_18px)]"
        />
        <div className="relative grid gap-4 p-3 sm:grid-cols-[1fr_auto] sm:items-end md:p-4 ">
          <div className="min-w-0 space-y-3">
            <div className="flex justify-between items-center gap-2">
              {!votingClosed && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Open now
                </span>
              )}
              {deadline && (
                <span className=" text-sm md:text-md font-medium text-white ml-auto">
                  Closes {formatDeadline(deadline.deadline)}
                </span>
              )}
            </div>

            <div>
              <h1 className="max-w-2xl text-2xl font-black leading-[0.98] tracking-[-0.05em] sm:text-3xl lg:text-4xl">
                Predict the World Cup.
                <span className="block text-amber-300">Win 500 USD.</span>
              </h1>
              <div className=" flex   flex-col md:flex-row items-end justify-between gap-4">
                <p className="mt-3 max-w-xl text-xs font-medium leading-relaxed text-white/72 sm:text-sm">
                  Pick 2 qualifiers from each group, choose the champion, and
                  guess the tournament total goals. Your goals pick becomes the
                  tie-breaker if the bracket race is close.
                </p>
                <button
                  type="button"
                  onClick={() => setVotingModalOpen(true)}
                  disabled={votingClosed}
                  className={`w-full md:w-auto flex h-10 px-2 items-center justify-center gap-2 rounded-2xl text-xs font-black uppercase tracking-[0.14em] transition-all ${
                    votingClosed
                      ? "cursor-not-allowed border border-white/10 bg-white/10 text-white/45"
                      : "bg-amber-300 text-zinc-950 shadow-[0_18px_42px_rgba(251,191,36,0.28)] hover:bg-amber-200 active:scale-[0.99]"
                  }`}
                >
                  {votingClosed ? (
                    <LockIcon className="h-4 w-4" />
                  ) : (
                    <TrophyIcon className="h-4 w-4" />
                  )}
                  {heroCtaLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Champion podium */}
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

      {/* Groups section */}
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
              <span className="w-2 h-2 rounded-full bg-amber-400" /> your picks
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
                localPicks={groupPicks[group.group_letter] ?? []}
              />
            ))}
          </div>
        )}
      </section>

      {groups && (
        <VotingModal
          open={votingModalOpen}
          onClose={() => setVotingModalOpen(false)}
          groups={groups}
          initialPicks={groupPicks}
          initialChampionId={championId}
          initialTotalGoals={totalGoals ?? 100}
          hasExistingVote={hasExistingVote}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
