"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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
} from "@/services/fastapi/world-cup-vote";
import { VotingModal } from "@/app/(features)/world-cup/prediction/components/world-cup-vote";

const DISMISSED_KEY = "wc_vote_popup_dismissed_at";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const OPEN_DELAY_MS = 1_000;

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
        winner_team_id: picks[g.group_letter],
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
        <DialogContent className="max-w-[95%] sm:max-w-lg overflow-hidden bg-black border-0 p-0">
          <div className="relative">
            <Image
              src="/images/world-cup-popup.jpg"
              alt="World Cup trophy"
              width={1200}
              height={700}
              priority
              className="h-[420px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 text-left text-white">
              <DialogHeader className="items-start gap-2">
                <span className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider backdrop-blur">
                  World Cup 2026
                </span>
                <DialogTitle className="text-2xl sm:text-3xl font-black leading-tight text-white">
                  Predict the World Cup.
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base text-white/85">
                  Pick group winners and the champion before kickoff.
                  {deadline?.deadline && (
                    <span className="mt-1 block text-white font-semibold">
                      Closes {formatDeadline(deadline.deadline)}
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button onClick={handlePredictNow} className="sm:min-w-36 ">
                  Predict Now
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismiss}
                  className="text-white/90 hover:text-white hover:bg-white/15"
                >
                  Not now
                </Button>
              </div>
            </div>
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
