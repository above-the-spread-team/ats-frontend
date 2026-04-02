"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useWorldCupDeadline,
  useWorldCupGroups,
  useMyPrediction,
  useSubmitPrediction,
  useUpdatePrediction,
} from "@/services/fastapi/world-caup-vote";
import { VotingModal } from "@/app/(features)/world-cup/prediction/components/world-cup-vote";

const DISMISSED_KEY = "wc_vote_popup_dismissed_at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 5_000;

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function WorldCupVotePopup() {
  const [teaserOpen, setTeaserOpen] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  const openDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedAtRef = useRef<number | null>(null);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    return () => {
      mountedAtRef.current = null;
    };
  }, []);

  const { data: deadline } = useWorldCupDeadline();
  const { data: groups } = useWorldCupGroups();
  const { data: existingPrediction, error: predictionError } =
    useMyPrediction(votingOpen);

  const submitMutation = useSubmitPrediction();
  const updateMutation = useUpdatePrediction();

  const hasExistingPrediction = !!existingPrediction && !predictionError;

  const initialPicks = useMemo(() => {
    if (!existingPrediction) return {};
    const picks: Record<string, number> = {};
    for (const gp of existingPrediction.group_predictions) {
      if (gp.winner_team_id != null) picks[gp.group_letter] = gp.winner_team_id;
    }
    return picks;
  }, [existingPrediction]);

  useEffect(() => {
    if (!deadline) return;
    if (!deadline.is_open) return;
    if (deadline.your_prediction_exists) return;
    const dismissedAt = localStorage.getItem(DISMISSED_KEY);
    if (dismissedAt && Date.now() - Number(dismissedAt) < COOLDOWN_MS) return;
    if (teaserOpen) return;

    if (openDelayTimerRef.current) clearTimeout(openDelayTimerRef.current);
    const mountedAt = mountedAtRef.current ?? Date.now();
    const remaining = OPEN_DELAY_MS - (Date.now() - mountedAt);
    const delayMs = Math.max(0, remaining);
    openDelayTimerRef.current = setTimeout(() => {
      setTeaserOpen(true);
      openDelayTimerRef.current = null;
    }, delayMs);

    return () => {
      if (openDelayTimerRef.current) clearTimeout(openDelayTimerRef.current);
      openDelayTimerRef.current = null;
    };
  }, [deadline, teaserOpen]);

  function dismiss() {
    if (openDelayTimerRef.current) clearTimeout(openDelayTimerRef.current);
    openDelayTimerRef.current = null;
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setTeaserOpen(false);
  }

  function handlePredictNow() {
    dismiss();
    setVotingOpen(true);
  }

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
  }

  return (
    <>
      <Dialog
        open={teaserOpen}
        onOpenChange={(v) => {
          if (!v) dismiss();
        }}
      >
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader className="items-center gap-2">
            <span className="text-5xl">🏆</span>
            <DialogTitle className="text-lg font-bold">
              Predict the World Cup!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Pick group winners and the champion before the deadline.
              {deadline?.deadline && (
                <span className="block mt-1 font-medium text-foreground/80">
                  Closes {formatDeadline(deadline.deadline)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 mt-2">
            <Button onClick={handlePredictNow}>Predict Now</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismiss}
              className="text-muted-foreground"
            >
              Not now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {groups && (
        <VotingModal
          open={votingOpen}
          onClose={() => setVotingOpen(false)}
          groups={groups}
          initialPicks={initialPicks}
          initialChampionId={existingPrediction?.champion_team_id ?? null}
          hasExistingPrediction={hasExistingPrediction}
          onSave={handleSave}
        />
      )}
    </>
  );
}
