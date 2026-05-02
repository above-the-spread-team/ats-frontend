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
  useMyVote,
  useSubmitVote,
  useUpdateVote,
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
  const { data: existingVote, error: voteError } = useMyVote(votingOpen);

  const submitMutation = useSubmitVote();
  const updateMutation = useUpdateVote();

  const hasExistingVote = !!existingVote && !voteError;

  const initialPicks = useMemo((): Record<string, number[]> => {
    if (!existingVote) return {};
    const picks: Record<string, number[]> = {};
    for (const [group, ids] of Object.entries(existingVote.selections)) {
      picks[group] = [...ids];
    }
    return picks;
  }, [existingVote]);

  useEffect(() => {
    if (!deadline) return;
    if (!deadline.is_open) return;
    if (deadline.your_vote_exists) return;
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
    picks: Record<string, number[]>,
    champTeamId: number,
    totalGoals: number,
  ): Promise<void> {
    const payload = {
      selections: picks,
      champion_team_id: champTeamId,
      total_goals: totalGoals,
    };

    if (hasExistingVote) {
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
        <DialogContent
          className="max-w-[90vw] overflow-hidden border-0 bg-zinc-950 p-0 shadow-[0_28px_90px_rgba(0,0,0,0.55)] sm:max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="relative overflow-hidden ">
            <Image
              src="/images/world-cup-popup.jpg"
              alt="World Cup trophy"
              width={800}
              height={600}
              priority
              className="absolute inset-0 h-full w-full object-cover "
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(250,204,21,0.36),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(9,9,11,0.78)_52%,rgba(9,9,11,0.98)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0_1px,transparent_1px_18px)] opacity-20" />

            <div className="relative flex min-h-[440px] flex-col justify-between p-4 text-white  sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] md:text-[11px] font-black uppercase tracking-[0.18em] text-amber-200 shadow-lg shadow-black/25 backdrop-blur-md">
                  World Cup 2026 Challenge
                </div>
              </div>

              <div className="space-y-3">
                <DialogHeader className="items-start gap-2 text-left">
                  <DialogTitle className="max-w-[13ch] text-3xl font-black leading-[0.96] tracking-[-0.05em] text-white sm:text-4xl">
                    Predict the World Cup.
                    <span className="mt-2 block text-amber-300">
                      Win 500 USD.
                    </span>
                  </DialogTitle>
                  <DialogDescription className="max-w-xs text-xs md:text-sm font-medium leading-relaxed text-white/82 sm:text-xs">
                    Pick 2 qualifiers from each group, choose the champion, and
                    guess the total goals. The closest bracket takes the prize.
                    {deadline?.deadline && (
                      <span className="mt-2 inline-flex rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-xs md:text-sm font-bold text-white backdrop-blur">
                        Closes {formatDeadline(deadline.deadline)}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur">
                    <p className="text-sm font-black leading-none">12</p>
                    <p className="mt-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Groups
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/10 p-2 backdrop-blur">
                    <p className="text-sm font-black leading-none">1</p>
                    <p className="mt-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Champion
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-300/25 bg-amber-300/15 p-2 backdrop-blur">
                    <p className="text-sm font-black leading-none text-amber-200">
                      Goals
                    </p>
                    <p className="mt-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-amber-100/70">
                      Tie-break
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={handlePredictNow}
                    className="py-3 flex-1 rounded-xl bg-amber-300 text-xs font-black uppercase tracking-[0.1em] text-zinc-950 shadow-[0_16px_36px_rgba(251,191,36,0.3)] hover:bg-amber-200"
                  >
                    Start Prediction
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismiss}
                    className="h-9 rounded-xl border border-white/10 bg-white/5 px-4 text-xs text-white/85 hover:bg-white/12 hover:text-white"
                  >
                    Not now
                  </Button>
                </div>
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
          initialChampionId={existingVote?.champion_team_id ?? null}
          initialTotalGoals={existingVote?.total_goals ?? 100}
          hasExistingVote={hasExistingVote}
          onSave={handleSave}
        />
      )}
    </>
  );
}
