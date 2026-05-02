"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { WheelPicker, WheelPickerWrapper } from "@ncdai/react-wheel-picker";
import "@ncdai/react-wheel-picker/style.css";
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

function GoalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
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

// ─── VotingModal ──────────────────────────────────────────────────────────────

type AnimPhase = "idle" | "exit" | "enter";
type Direction = "forward" | "backward";

// Steps: 0..N-1 = groups, N = champion, N+1 = total goals
const CHAMPION_OFFSET = 0;
const GOALS_OFFSET = 1;

// Generate 0–200 goal options for the wheel picker
const GOALS_OPTIONS = Array.from({ length: 201 }, (_, i) => ({
  value: i,
  label: String(i),
}));

export interface VotingModalProps {
  open: boolean;
  onClose: () => void;
  groups: WorldCupGroupResponse[];
  /** Initial qualifier selections per group, 2 team IDs each */
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

  // TOTAL = groups + champion + goals
  const TOTAL = sortedGroups.length + 2;
  const CHAMPION_STEP = sortedGroups.length + CHAMPION_OFFSET;
  const GOALS_STEP = sortedGroups.length + GOALS_OFFSET;

  const [displayStep, setDisplayStep] = useState(0);
  const [targetStep, setTargetStep] = useState(0);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [direction, setDirection] = useState<Direction>("forward");

  /** 2 qualifier IDs per group letter */
  const [picks, setPicks] = useState<Record<string, number[]>>({});
  const [champId, setChampId] = useState<number | null>(null);
  const [totalGoals, setTotalGoals] = useState<number>(100);
  const [champSearch, setChampSearch] = useState("");
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
      const cloned: Record<string, number[]> = {};
      for (const [k, v] of Object.entries(initialPicks)) {
        cloned[k] = [...v];
      }
      setPicks(cloned);
      setChampId(initialChampionId);
      setTotalGoals(initialTotalGoals > 0 ? initialTotalGoals : 100);
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

  /** Toggle a team in/out of the 2-slot qualifier selection for the current group */
  function toggleQualifier(groupLetter: string, teamId: number) {
    setPicks((prev) => {
      const current = prev[groupLetter] ?? [];
      if (current.includes(teamId)) {
        // deselect
        return { ...prev, [groupLetter]: current.filter((id) => id !== teamId) };
      }
      if (current.length >= 2) return prev; // already full
      return { ...prev, [groupLetter]: [...current, teamId] };
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
  const currentGroup = isGroupStep ? sortedGroups[displayStep] : null;

  const groupPickCount = Object.values(picks).filter((v) => v.length === 2)
    .length;
  const missingGroups = sortedGroups.length - groupPickCount;
  const allGroupsDone = missingGroups === 0;
  const allPicksDone = allGroupsDone && champId != null;

  const currentGroupPicks = currentGroup
    ? (picks[currentGroup.group_letter] ?? [])
    : [];
  const currentGroupFull = currentGroupPicks.length === 2;

  let animClass = "";
  if (animPhase === "exit") {
    animClass =
      direction === "forward" ? "wc-flip-exit-fwd" : "wc-flip-exit-bwd";
  } else if (animPhase === "enter") {
    animClass =
      direction === "forward" ? "wc-flip-enter-fwd" : "wc-flip-enter-bwd";
  }

  const progressPct = Math.round(((displayStep + 1) / TOTAL) * 100);

  let stepTitle = "";
  if (isGroupStep && currentGroup) {
    stepTitle = `Group ${currentGroup.group_letter} — Pick 2 qualifiers`;
  } else if (isChampionStep) {
    stepTitle = "🏆 Who will win the World Cup?";
  } else {
    stepTitle = "⚽ Predict the total goals";
  }

  return createPortal(
    <>
      <div
        className="fixed z-[100] min-h-dvh w-full bg-black/60 backdrop-blur-sm pointer-events-auto top-0 right-0 bottom-0 left-0"
        aria-hidden
      />
      <div className="fixed inset-0 z-[100] flex min-h-dvh w-full items-end sm:items-center justify-center pointer-events-none">
        <div className="relative z-10 pointer-events-auto w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-2xl bg-card flex flex-col overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
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
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => goTo(displayStep + 1)}
                disabled={displayStep === TOTAL - 1 || animPhase !== "idle"}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 transition-colors text-muted-foreground"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mx-5 h-1 rounded-full bg-muted overflow-hidden flex-shrink-0">
            <div
              className="h-full rounded-full bg-primary-font transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Animated content */}
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
              {/* ── Group step: pick 2 qualifiers ── */}
              {isGroupStep && currentGroup && (
                <div className="px-5 pt-4 pb-2 space-y-2.5">
                  {/* Selection badge */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Select 2 teams that advance from this group
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums ${
                        currentGroupFull
                          ? "bg-primary-font/15 text-primary-font"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {currentGroupPicks.length}/2
                    </span>
                  </div>

                  {currentGroup.teams.map((team) => {
                    const isSelected = currentGroupPicks.includes(team.id);
                    const isDisabled = !isSelected && currentGroupFull;
                    const pct = team.prediction_percentage;
                    const selectionIndex = currentGroupPicks.indexOf(team.id);

                    return (
                      <button
                        key={team.id}
                        onClick={() =>
                          toggleQualifier(currentGroup.group_letter, team.id)
                        }
                        disabled={isDisabled}
                        className={`w-full flex flex-col gap-1.5 rounded-xl px-3 py-3 text-left transition-all duration-150 ${
                          isSelected
                            ? "bg-primary-font border border-primary-font"
                            : isDisabled
                              ? "border border-border/30 opacity-40 cursor-not-allowed"
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

                          {isSelected && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-white text-[10px] font-black flex-shrink-0">
                              {selectionIndex + 1}
                            </span>
                          )}

                          <span
                            className={`text-[11px] font-medium tabular-nums ${
                              isSelected
                                ? "text-white/80"
                                : "text-muted-foreground"
                            }`}
                          >
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isSelected ? "bg-primary-hero" : "bg-primary-font"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Champion step ── */}
              {isChampionStep && !isSubmissionSuccess && (
                <div className="px-5 pt-4 pb-2 space-y-3">
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

                  <input
                    type="text"
                    value={champSearch}
                    onChange={(e) => setChampSearch(e.target.value)}
                    placeholder="Search teams…"
                    className="w-full h-9 px-3 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary-font/60 transition-colors"
                  />

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
                            className={`text-[11px] ${
                              isSelected
                                ? "text-white"
                                : "text-foreground/80"
                            } flex-shrink-0`}
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

              {/* ── Total Goals step ── */}
              {isGoalsStep && (
                <div className="px-5 pt-4 pb-2 space-y-4">
                  {isSubmissionSuccess ? (
                    // Success state
                    <div className="flex flex-col items-center text-center px-2 pb-3 pt-2 gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary-font/15 border-2 border-primary-font/30 flex items-center justify-center">
                        <CheckIcon className="w-8 h-8 text-primary-font" />
                      </div>
                      <div>
                        <p className="text-lg sm:text-xl font-extrabold">
                          Prediction submitted!
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[28ch]">
                          Your World Cup bracket has been saved successfully.
                        </p>
                      </div>

                      {/* Summary chips */}
                      <div className="w-full max-w-sm space-y-2">
                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/60 border border-border/50">
                          <span className="text-xs text-muted-foreground font-medium">
                            Groups selected
                          </span>
                          <span className="text-xs font-bold text-foreground tabular-nums">
                            {groupPickCount} / {sortedGroups.length}
                          </span>
                        </div>

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
                                  <p className="text-xs font-bold text-white truncate">
                                    {team.name}
                                  </p>
                                  <p className="text-[11px] text-white/80">
                                    Champion pick
                                  </p>
                                </div>
                                <CheckIcon className="w-4 h-4 text-white flex-shrink-0" />
                              </div>
                            );
                          })()}

                        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-muted/60 border border-border/50">
                          <span className="text-xs text-muted-foreground font-medium">
                            Total goals guess
                          </span>
                          <span className="text-sm font-black text-foreground tabular-nums">
                            {totalGoals}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Goals picker
                    <>
                      <div className="text-center space-y-1">
                        <p className="text-xs text-muted-foreground">
                          How many goals will be scored in total across all
                          group stage &amp; knockout matches?
                        </p>
                        <p className="text-[11px] text-muted-foreground/70">
                          Tie-breaker — closer guess wins
                        </p>
                      </div>

                      {/* Big number display */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl sm:text-7xl font-black tabular-nums text-foreground leading-none">
                            {totalGoals}
                          </span>
                          <div className="flex flex-col items-start gap-0.5">
                            <GoalIcon className="w-5 h-5 text-primary-font" />
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                              goals
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground/70">
                          Scroll the wheel to adjust
                        </p>
                      </div>

                      {/* Wheel picker */}
                      <div className="flex justify-center">
                        <WheelPickerWrapper className="w-full max-w-[240px]">
                          <WheelPicker<number>
                            value={totalGoals}
                            onValueChange={(v) => setTotalGoals(v)}
                            options={GOALS_OPTIONS}
                            visibleCount={8}
                            infinite={false}
                            classNames={{
                              optionItem:
                                "text-sm font-semibold text-foreground",
                              highlightWrapper: "rounded-xl",
                              highlightItem:
                                "font-black text-primary-font text-base",
                            }}
                          />
                        </WheelPickerWrapper>
                      </div>

                      {/* Context hint */}
                      <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground/70">
                        <span>WC 2022: 172 goals</span>
                        <span className="w-px h-3 bg-border" />
                        <span>WC 2018: 169 goals</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pt-3 pb-5 border-t border-border/60 flex-shrink-0 space-y-2">
            {submitError && (
              <p className="text-xs text-red-500 text-center">{submitError}</p>
            )}

            {isGoalsStep ? (
              isSubmissionSuccess ? (
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
                    allPicksDone
                      ? "bg-primary-font text-white hover:opacity-90 active:scale-[0.98]"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  {isSubmitting
                    ? "Submitting…"
                    : !allGroupsDone
                      ? `${missingGroups} group${missingGroups > 1 ? "s" : ""} still missing`
                      : champId == null
                        ? "Select a champion first"
                        : hasExistingVote
                          ? "Update Prediction"
                          : "Submit Prediction"}
                </button>
              )
            ) : isChampionStep ? (
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
                  ? "Select your champion"
                  : "Next — Set total goals →"}
              </button>
            ) : (
              <button
                onClick={() => goTo(displayStep + 1)}
                disabled={!currentGroupFull || animPhase !== "idle"}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                  currentGroupFull
                    ? "bg-primary-font text-white hover:opacity-90 active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {!currentGroupFull
                  ? `Pick ${2 - currentGroupPicks.length} more team${2 - currentGroupPicks.length > 1 ? "s" : ""}`
                  : displayStep === CHAMPION_STEP - 1
                    ? "Next — Pick Champion →"
                    : "Next →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
