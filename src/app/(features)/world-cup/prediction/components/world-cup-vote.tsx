"use client";

import "@ncdai/react-wheel-picker/style.css";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@ncdai/react-wheel-picker";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { WorldCupGroupResponse } from "@/type/fastapi/world-cup-vote";

// ─── hooks ────────────────────────────────────────────────────────────────────

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── icons ────────────────────────────────────────────────────────────────────

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

// ─── TeamLogo ─────────────────────────────────────────────────────────────────

export function TeamLogo({
  src,
  name,
  size = 28,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const [error, setError] = useState(false);
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="rounded-full bg-muted flex items-center justify-center flex-shrink-0"
      >
        <span className="text-[9px] font-black text-muted-foreground">
          {initials}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className="object-contain flex-shrink-0"
      onError={() => setError(true)}
    />
  );
}

// ─── QualifierBadge ───────────────────────────────────────────────────────────

function QualifierBadge({ count, max = 2 }: { count: number; max?: number }) {
  const full = count === max;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
        full
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
          : count === 0
            ? "bg-muted text-muted-foreground border border-border"
            : "bg-amber-400/15 text-amber-700 dark:text-amber-400 border border-amber-400/30"
      }`}
    >
      {count}/{max}
      {full ? " ✓" : " picked"}
    </span>
  );
}

// ─── Goals wheel options (0–300) ─────────────────────────────────────────────

const GOALS_OPTIONS: WheelPickerOption<number>[] = Array.from(
  { length: 301 },
  (_, i) => ({ value: i, label: String(i) }),
);

// ─── VotingModal ──────────────────────────────────────────────────────────────

type AnimPhase = "idle" | "exit" | "enter";
type Direction = "forward" | "backward";

export interface VotingModalProps {
  open: boolean;
  onClose: () => void;
  groups: WorldCupGroupResponse[];
  /** Each group letter maps to an array of up to 2 selected team IDs */
  initialPicks: Record<string, number[]>;
  initialChampionId: number | null;
  initialTotalGoals: number;
  hasExistingVote: boolean;
  onSave: (
    picks: Record<string, number[]>,
    championId: number,
    totalGoals: number,
  ) => Promise<void>;
}

export function VotingModal({
  open,
  onClose,
  groups,
  initialPicks,
  initialChampionId,
  initialTotalGoals,
  hasExistingVote,
  onSave,
}: VotingModalProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const {
    data: currentUser,
    isFetched: hasCheckedAuth,
    isLoading: isAuthLoading,
  } = useCurrentUser({ enabled: open });
  const [portalMounted, setPortalMounted] = useState(false);
  const [submissionState, setSubmissionState] = useState<"idle" | "success">(
    "idle",
  );

  useEffect(() => {
    setPortalMounted(true);
  }, []);

  const sortedGroups = useMemo(
    () =>
      [...groups].sort((a, b) => a.group_letter.localeCompare(b.group_letter)),
    [groups],
  );

  // Steps: [0..N-1] groups · [N] champion · [N+1] goals
  const TOTAL = sortedGroups.length + 2;
  const CHAMPION_STEP = TOTAL - 2;
  const GOALS_STEP = TOTAL - 1;

  const [displayStep, setDisplayStep] = useState(0);
  const [targetStep, setTargetStep] = useState(0);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [direction, setDirection] = useState<Direction>("forward");

  /** Record<groupLetter, number[]> — max 2 IDs per group */
  const [picks, setPicks] = useState<Record<string, number[]>>({});
  const [champId, setChampId] = useState<number | null>(null);
  const [champSearch, setChampSearch] = useState("");

  // Goals wheel state
  const [totalGoals, setTotalGoals] = useState(160);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const allTeams = useMemo(
    () =>
      sortedGroups
        .flatMap((g) => g.teams)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [sortedGroups],
  );

  const filteredTeams = useMemo(() => {
    const q = champSearch.trim().toLowerCase();
    return q
      ? allTeams.filter((t) => t.name.toLowerCase().includes(q))
      : allTeams;
  }, [allTeams, champSearch]);

  // Init on open
  useEffect(() => {
    if (open) {
      setPicks(
        Object.fromEntries(
          Object.entries(initialPicks).map(([k, v]) => [k, [...v]]),
        ),
      );
      setChampId(initialChampionId);

      const clamped = Math.min(300, Math.max(0, initialTotalGoals));
      setTotalGoals(clamped);

      setDisplayStep(0);
      setTargetStep(0);
      setAnimPhase("idle");
      setSubmissionState("idle");
      setSubmitError(null);
      setChampSearch("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Body scroll lock
  useEffect(() => {
    if (open && portalMounted) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, portalMounted]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  function goTo(next: number) {
    if (next < 0 || next >= TOTAL) return;
    if (animPhase !== "idle") return;
    if (prefersReducedMotion) {
      setDisplayStep(next);
      setTargetStep(next);
      return;
    }
    const dir: Direction = next > displayStep ? "forward" : "backward";
    setDirection(dir);
    setTargetStep(next);
    setAnimPhase("exit");
  }

  function handleAnimEnd() {
    if (animPhase === "exit") {
      setDisplayStep(targetStep);
      setAnimPhase("enter");
    } else if (animPhase === "enter") {
      setAnimPhase("idle");
    }
  }

  /** Toggle a qualifier pick — max 2; 3rd tap replaces earliest */
  function togglePick(groupLetter: string, teamId: number) {
    setPicks((prev) => {
      const current = prev[groupLetter] ?? [];
      if (current.includes(teamId)) {
        return {
          ...prev,
          [groupLetter]: current.filter((id) => id !== teamId),
        };
      }
      if (current.length < 2) {
        return { ...prev, [groupLetter]: [...current, teamId] };
      }
      return { ...prev, [groupLetter]: [current[1], teamId] };
    });
  }

  async function handleSubmit() {
    if (champId == null) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSave(picks, champId, totalGoals);
      setSubmissionState("success");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open || !portalMounted) return null;

  const isChampionStep = displayStep === CHAMPION_STEP;
  const isGoalsStep = displayStep === GOALS_STEP;
  const isGroupStep = !isChampionStep && !isGoalsStep;
  const isSubmissionSuccess = isGoalsStep && submissionState === "success";
  const showAnonymousPrizeNote =
    hasCheckedAuth && !isAuthLoading && !currentUser;
  const currentGroup = isGroupStep ? sortedGroups[displayStep] : null;

  const groupsWithTwoPicks = sortedGroups.filter(
    (g) => (picks[g.group_letter]?.length ?? 0) === 2,
  ).length;
  const missingGroups = sortedGroups.length - groupsWithTwoPicks;
  const allPicksDone = missingGroups === 0 && champId != null;

  const currentGroupPicks = currentGroup
    ? (picks[currentGroup.group_letter] ?? [])
    : [];
  const currentGroupComplete = currentGroupPicks.length === 2;

  let animClass = "";
  if (animPhase === "exit") {
    animClass =
      direction === "forward" ? "wc-flip-exit-fwd" : "wc-flip-exit-bwd";
  } else if (animPhase === "enter") {
    animClass =
      direction === "forward" ? "wc-flip-enter-fwd" : "wc-flip-enter-bwd";
  }

  const progressPct = Math.round(((displayStep + 1) / TOTAL) * 100);

  // Step title
  let stepTitle = "";
  if (isGoalsStep) stepTitle = "⚽ Predict total goals";
  else if (isChampionStep) stepTitle = "🏆 Who will win the World Cup?";
  else stepTitle = `Group ${currentGroup?.group_letter} — Pick 2 qualifiers`;

  return createPortal(
    <>
      <div
        className="fixed z-[100] min-h-dvh w-full bg-black/60 backdrop-blur-sm pointer-events-auto top-0 right-0 bottom-0 left-0"
        aria-hidden
      />
      <div className="fixed inset-0 z-[100] flex min-h-dvh w-full items-end sm:items-center justify-center pointer-events-none">
        <div className="relative z-10 pointer-events-auto w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-2xl bg-card flex flex-col overflow-hidden shadow-2xl">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
              aria-label="Close"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">
                Step {displayStep + 1} of {TOTAL}
              </p>
              <p className="text-sm md:text-lg font-bold truncate">
                {stepTitle}
              </p>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                onClick={() => goTo(displayStep - 1)}
                disabled={displayStep === 0 || animPhase !== "idle"}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 transition-colors text-muted-foreground"
                aria-label="Previous step"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => goTo(displayStep + 1)}
                disabled={displayStep === TOTAL - 1 || animPhase !== "idle"}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 transition-colors text-muted-foreground"
                aria-label="Next step"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="mx-5 h-1 rounded-full bg-muted overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-full bg-primary-font transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* ── Animated content ── */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
          >
            <div
              className={animClass || undefined}
              onAnimationEnd={handleAnimEnd}
              style={{
                transformOrigin: "center",
                backfaceVisibility: "hidden",
              }}
            >
              {/* ── Group step ──────────────────────────────────────────── */}
              {isGroupStep && currentGroup && (
                <div className="px-5 pt-4 pb-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Select the{" "}
                      <span className="font-semibold text-foreground">
                        2 teams
                      </span>{" "}
                      that advance from this group
                    </p>
                    <QualifierBadge count={currentGroupPicks.length} max={2} />
                  </div>

                  <div className="space-y-2">
                    {currentGroup.teams.map((team) => {
                      const isSelected = currentGroupPicks.includes(team.id);
                      const pct = team.prediction_percentage;
                      return (
                        <button
                          key={team.id}
                          onClick={() =>
                            togglePick(currentGroup.group_letter, team.id)
                          }
                          className={`w-full flex flex-col gap-1.5 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                            isSelected
                              ? "bg-primary-font border border-primary-font"
                              : "border border-border/60 hover:bg-muted/50 hover:border-border"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <TeamLogo
                              src={team.logo_url}
                              name={team.name}
                              size={28}
                            />
                            <span
                              className={`text-sm font-semibold flex-1 truncate ${
                                isSelected ? "text-white" : "text-foreground"
                              }`}
                            >
                              {team.name}
                            </span>
                            {isSelected ? (
                              <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
                            ) : (
                              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                                {pct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="h-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isSelected
                                  ? "bg-primary-hero"
                                  : "bg-primary-font/60"
                              }`}
                              style={{ width: `${Math.max(pct, 1)}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Champion step ────────────────────────────────────────── */}
              {isChampionStep && (
                <div className="px-5 pt-4 pb-2 space-y-3">
                  {/* Current champion pick preview */}
                  {champId != null &&
                    (() => {
                      const team = allTeams.find((t) => t.id === champId);
                      if (!team) return null;
                      return (
                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-font border border-primary-font/30">
                          <TeamLogo
                            src={team.logo_url}
                            name={team.name}
                            size={32}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-bold text-white truncate">
                              {team.name}
                            </p>
                            <p className="text-xs text-white/80">
                              Your champion pick
                            </p>
                          </div>
                          <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
                        </div>
                      );
                    })()}

                  {/* Champion search */}
                  <input
                    type="text"
                    value={champSearch}
                    onChange={(e) => setChampSearch(e.target.value)}
                    placeholder="Search teams…"
                    className="w-full h-9 px-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary-font/60 transition-colors"
                  />

                  {/* Team list */}
                  <div className="space-y-0.5">
                    {filteredTeams.map((team) => {
                      const isSelected = champId === team.id;
                      return (
                        <button
                          key={team.id}
                          onClick={() => setChampId(team.id)}
                          className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 ${
                            isSelected
                              ? "bg-primary-font border border-primary-font"
                              : "border border-transparent hover:bg-muted/50 hover:border-border/50"
                          }`}
                        >
                          <TeamLogo
                            src={team.logo_url}
                            name={team.name}
                            size={22}
                          />
                          <span
                            className={`text-xs font-semibold flex-1 truncate ${
                              isSelected ? "text-white" : "text-foreground"
                            }`}
                          >
                            {team.name}
                          </span>
                          <span
                            className={`text-[11px] flex-shrink-0 ${
                              isSelected ? "text-white" : "text-foreground/80"
                            }`}
                          >
                            Grp {team.group_letter}
                          </span>
                        </button>
                      );
                    })}
                    {filteredTeams.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No teams match &ldquo;{champSearch}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Goals step ───────────────────────────────────────────── */}
              {isGoalsStep && (
                <div className="px-5 pt-4 pb-4 space-y-5">
                  {isSubmissionSuccess ? (
                    /* ── Success state ── */
                    <div className="flex flex-col items-center text-center px-2 pb-2 gap-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                        <CheckIcon className="w-7 h-7 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-xl font-extrabold">
                          Prediction submitted!
                        </p>

                        {showAnonymousPrizeNote && (
                          <p className="text-md sm:text-base font-medium text-muted-foreground mt-2 max-w-[42ch] mx-auto">
                            Prediction saved!{" "}
                            <strong className="font-bold text-foreground">
                              Log in now
                            </strong>{" "}
                            to qualify for the prize—anonymous entries are not
                            eligible to win.
                          </p>
                        )}
                      </div>

                      {champId != null &&
                        (() => {
                          const team = allTeams.find((t) => t.id === champId);
                          if (!team) return null;
                          return (
                            <div className="px-3 py-2.5 rounded-xl bg-primary-font border border-primary-font/30 w-full max-w-[340px]">
                              <div className="flex items-center gap-3">
                                <TeamLogo
                                  src={team.logo_url}
                                  name={team.name}
                                  size={36}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-white truncate">
                                    {team.name}
                                  </p>
                                  <p className="text-[11px] text-white/80">
                                    Your champion pick
                                  </p>
                                </div>
                                <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
                              </div>
                            </div>
                          );
                        })()}

                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border w-full max-w-[340px]">
                        <span className="text-2xl">⚽</span>
                        <div>
                          <p className="text-[11px] text-muted-foreground text-left">
                            Total goals prediction
                          </p>
                          <p className="text-2xl font-black tabular-nums text-foreground leading-tight">
                            {totalGoals}
                            <span className="text-base font-medium text-muted-foreground ml-1">
                              goals
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Goals wheel ── */
                    <>
                      <div className="text-center space-y-1">
                        <p className="text-xs md:text-sm text-muted-foreground">
                          Predict the total goals scored in the entire
                          tournament. Closest guess wins tiebreaks.
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground/60">
                          2022 Qatar: 172 · 2018 Russia: 169 · 2014 Brazil: 171
                        </p>
                      </div>

                      {/* Big number display */}
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-foreground transition-all duration-150">
                          {totalGoals}
                        </span>
                        <span className="text-base font-semibold text-muted-foreground self-end pb-1.5">
                          goals
                        </span>
                      </div>

                      {/* Single wheel picker */}
                      <div className="relative rounded-2xl border border-border overflow-hidden bg-muted/30">
                        <WheelPickerWrapper className="h-[200px]  px-4">
                          <WheelPicker<number>
                            options={GOALS_OPTIONS}
                            value={totalGoals}
                            onValueChange={setTotalGoals}
                            visibleCount={16}
                            optionItemHeight={36}
                            classNames={{
                              optionItem:
                                "text-lg font-semibold text-muted-foreground",
                              highlightWrapper:
                                "rounded-xl  bg-card border border-border shadow-sm",
                              highlightItem:
                                "text-2xl font-black text-foreground",
                            }}
                          />
                        </WheelPickerWrapper>

                        {/* Bottom hint */}
                        <p className="text-center text-xs md:text-sm text-muted-foreground/60 py-2">
                          Scroll or drag · typical range 130–200
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-5 pt-3 pb-5 border-t border-border/60 flex-shrink-0 space-y-2">
            {submitError && (
              <p className="text-xs text-red-500 text-center">{submitError}</p>
            )}

            {/* Goals step footer */}
            {isGoalsStep &&
              (isSubmissionSuccess ? (
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 bg-primary-font text-white hover:opacity-90 active:scale-[0.98]"
                >
                  Done
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allPicksDone || isSubmitting}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                    allPicksDone && !isSubmitting
                      ? "bg-primary-font text-white hover:opacity-90 active:scale-[0.98]"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isSubmitting
                    ? "Submitting…"
                    : champId == null
                      ? "Select a champion first"
                      : missingGroups > 0
                        ? `${missingGroups} group${missingGroups > 1 ? "s" : ""} incomplete`
                        : hasExistingVote
                          ? "Update Prediction"
                          : "Submit Prediction"}
                </button>
              ))}

            {/* Champion step footer */}
            {isChampionStep && (
              <button
                onClick={() => goTo(GOALS_STEP)}
                disabled={champId == null || animPhase !== "idle"}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                  champId != null
                    ? "bg-primary-font text-white hover:opacity-90 active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {champId == null
                  ? "Select a champion to continue"
                  : "Next — Predict Goals →"}
              </button>
            )}

            {/* Group step footer */}
            {isGroupStep && (
              <button
                onClick={() => goTo(displayStep + 1)}
                disabled={!currentGroupComplete || animPhase !== "idle"}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                  currentGroupComplete
                    ? "bg-primary-font text-white hover:opacity-90 active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {currentGroupComplete
                  ? displayStep === CHAMPION_STEP - 1
                    ? "Next — Pick Champion →"
                    : "Next →"
                  : `Pick ${2 - currentGroupPicks.length} more team${2 - currentGroupPicks.length > 1 ? "s" : ""} to continue`}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
