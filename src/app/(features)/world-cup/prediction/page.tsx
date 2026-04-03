"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useWorldCupGroups,
  useWorldCupDeadline,
  useMyPrediction,
  useSubmitPrediction,
  useUpdatePrediction,
  useChampionPercentages,
} from "@/services/fastapi/world-caup-vote";
import type {
  WorldCupTeamWithPercentage,
  WorldCupGroupResponse,
} from "@/type/fastapi/world-cap-vote";
import { VotingModal, TeamLogo, CheckIcon } from "./components/world-cup-vote";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ─── GroupCardSkeleton ────────────────────────────────────────────────────────

function GroupCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <Skeleton className="h-4 w-24 rounded" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-3 flex-1 rounded" />
            <Skeleton className="h-3 w-8 rounded" />
          </div>
          <Skeleton className="h-1 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── DeadlineBanner ───────────────────────────────────────────────────────────

function DeadlineBanner({
  deadline,
  isOpen,
}: {
  deadline: string;
  isOpen: boolean;
}) {
  if (!isOpen) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
        <span className="text-base">🔒</span>
        <div>
          <p className="text-xs font-semibold text-red-500 dark:text-red-400">
            Voting closed
          </p>
          <p className="text-[10px] text-muted-foreground">
            Deadline passed · {formatDeadline(deadline)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
      <span className="text-base">✅</span>
      <div>
        <p className="text-xs font-semibold text-green-600 dark:text-green-400">
          Voting open
        </p>
        <p className="text-[10px] text-muted-foreground">
          Submit before · {formatDeadline(deadline)}
        </p>
      </div>
    </div>
  );
}

// ─── GroupCard ────────────────────────────────────────────────────────────────

function GroupCard({
  group,
  localPick,
}: {
  group: WorldCupGroupResponse;
  localPick: number | null;
}) {
  const pickedTeam =
    localPick != null ? group.teams.find((t) => t.id === localPick) : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 lg:p-5 space-y-2.5 lg:space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-border/60 flex-wrap">
        <span className="w-1 h-4 rounded-full bg-primary-font flex-shrink-0" />
        <h3 className="text-sm lg:text-base font-bold">
          Group {group.group_letter}
        </h3>
        {pickedTeam && (
          <span className="ml-auto inline-flex items-center gap-1 max-w-full min-w-0 text-[10px] lg:text-[11px] font-semibold text-primary-font">
            <CheckIcon className="w-3 h-3 flex-shrink-0" aria-hidden />
            <span className="truncate">Your pick · {pickedTeam.name}</span>
          </span>
        )}
      </div>

      {group.teams.map((team) => {
        const isSelected = localPick === team.id;
        const pct = team.prediction_percentage;
        return (
          <div
            key={team.id}
            className={`space-y-1 rounded-md px-1.5 py-1 transition-colors ${
              isSelected
                ? "ring-2 ring-primary-font/35 bg-primary-font/[0.07]"
                : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <TeamLogo src={team.logo_url} name={team.name} size={20} />
              <span
                className={`text-xs lg:text-sm truncate flex-1 min-w-0 ${
                  isSelected
                    ? "font-bold text-foreground"
                    : "font-medium text-foreground/80"
                }`}
              >
                {team.name}
              </span>
              {isSelected && (
                <CheckIcon
                  className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary-font flex-shrink-0"
                  aria-hidden
                />
              )}
              <span className="text-[10px] lg:text-xs tabular-nums flex-shrink-0 text-muted-foreground">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-font transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ChampionPercentages ──────────────────────────────────────────────────────

function ChampionPercentages({
  teams,
  isLoading,
  currentChampionId,
}: {
  teams: WorldCupTeamWithPercentage[] | undefined;
  isLoading: boolean;
  currentChampionId: number | null;
}) {
  const myChampion =
    currentChampionId != null && teams
      ? teams.find((t) => t.id === currentChampionId)
      : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3 lg:space-y-3.5">
      <div className="flex items-center gap-2 pb-1 border-b border-border/60 flex-wrap">
        <span className="text-base lg:text-lg">🏆</span>
        <h3 className="text-sm sm:text-base lg:text-lg font-bold">
          Champion Predictions
        </h3>
        <span className="text-[10px] lg:text-xs text-muted-foreground ml-0.5">
          community picks
        </span>
        {myChampion && (
          <span className="ml-auto inline-flex items-center gap-1 max-w-full min-w-0 text-[10px] lg:text-[11px] font-semibold text-primary-font">
            <CheckIcon className="w-3 h-3 flex-shrink-0" aria-hidden />
            <span className="truncate">Your pick · {myChampion.name}</span>
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded-full" />
                <Skeleton className="h-3 flex-1 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && teams && (
        <div className="space-y-2.5">
          {teams.map((team) => {
            const isCurrent = team.id === currentChampionId;
            const pct = team.prediction_percentage;
            return (
              <div
                key={team.id}
                className={`space-y-1 rounded-md px-1.5 py-1 transition-colors ${
                  isCurrent
                    ? "ring-2 ring-primary-font/35 bg-primary-font/[0.07]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <TeamLogo src={team.logo_url} name={team.name} size={20} />
                  <span
                    className={`text-xs lg:text-sm truncate flex-1 min-w-0 ${
                      isCurrent
                        ? "font-bold text-foreground"
                        : "font-medium text-foreground/80"
                    }`}
                  >
                    {team.name}
                  </span>
                  {isCurrent && (
                    <CheckIcon
                      className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-primary-font flex-shrink-0"
                      aria-hidden
                    />
                  )}
                  <span className="text-[10px] lg:text-xs tabular-nums flex-shrink-0 text-muted-foreground">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-font transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorldCupPredictionPage() {
  const [isClient, setIsClient] = useState(false);
  const [votingModalOpen, setVotingModalOpen] = useState(false);

  const [groupPicks, setGroupPicks] = useState<Record<string, number>>({});
  const [championId, setChampionId] = useState<number | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

  const hasExistingPrediction = !!existingPrediction && !predictionError;
  const votingClosed =
    existingPrediction?.is_locked || (!!deadline && !deadline.is_open);

  // Sync display picks from existing prediction
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
    if (existingPrediction.champion_team_id != null)
      setChampionId(existingPrediction.champion_team_id);
  }, [existingPrediction]);

  async function handleSave(
    picks: Record<string, number>,
    champTeamId: number,
  ): Promise<void> {
    if (!groups) throw new Error("Groups not loaded.");

    const payload = {
      group_predictions: groups.map((g) => ({
        group_letter: g.group_letter,
        winner_team_id: picks[g.group_letter] ?? 0,
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

  if (!isClient) return null;

  const isLoading = groupsLoading || deadlineLoading || predictionLoading;

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:py-8 pb-16 space-y-5">
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const groupPickCount = Object.keys(groupPicks).length;
  const totalGroups = groups?.length ?? 12;
  const picksComplete = groupPickCount === totalGroups && championId != null;

  return (
    <div className="px-4 py-6 sm:py-8 pb-16 space-y-5">
      <div className="space-y-1">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-black">
          Group Stage Prediction
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
          Pick the winner of each group and your overall World Cup champion.
        </p>
      </div>

      {deadline && (
        <DeadlineBanner
          deadline={deadline.deadline}
          isOpen={deadline.is_open}
        />
      )}

      <div>
        {votingClosed ? (
          <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-3">
            <span>🔒</span>
            <p className="text-xs text-muted-foreground font-medium">
              Voting is closed — your picks are locked in.
            </p>
          </div>
        ) : (
          <button
            onClick={() => setVotingModalOpen(true)}
            className="w-full py-3.5 rounded-xl text-sm lg:text-base font-bold bg-primary-font text-white hover:opacity-90 active:scale-[0.99] transition-all duration-150 shadow-sm"
          >
            {picksComplete
              ? "✏️ Edit your prediction"
              : hasExistingPrediction
                ? "✏️ Update prediction"
                : groupPickCount === 0
                  ? "🗳️ Vote now"
                  : `🗳️ Continue voting (${groupPickCount + (championId != null ? 1 : 0)}/${totalGroups + 1} done)`}
          </button>
        )}
      </div>

      {groups && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups
            .slice()
            .sort((a, b) => a.group_letter.localeCompare(b.group_letter))
            .map((group) => (
              <GroupCard
                key={group.group_letter}
                group={group}
                localPick={groupPicks[group.group_letter] ?? null}
              />
            ))}
        </div>
      )}

      <ChampionPercentages
        teams={champions}
        isLoading={championsLoading}
        currentChampionId={championId}
      />

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
