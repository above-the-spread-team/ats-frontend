"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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

// ─── VotingModal ──────────────────────────────────────────────────────────────

type AnimPhase = "idle" | "exit" | "enter";
type Direction = "forward" | "backward";

export interface VotingModalProps {
  open: boolean;
  onClose: () => void;
  groups: WorldCupGroupResponse[];
  initialPicks: Record<string, number>;
  initialChampionId: number | null;
  hasExistingPrediction: boolean;
  onSave: (picks: Record<string, number>, championId: number) => Promise<void>;
}

export function VotingModal({
  open,
  onClose,
  groups,
  initialPicks,
  initialChampionId,
  hasExistingPrediction,
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
  const TOTAL = sortedGroups.length + 1; // groups + 1 champion step

  const [displayStep, setDisplayStep] = useState(0);
  const [targetStep, setTargetStep] = useState(0);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [direction, setDirection] = useState<Direction>("forward");

  const [picks, setPicks] = useState<Record<string, number>>({});
  const [champId, setChampId] = useState<number | null>(null);
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
      setPicks({ ...initialPicks });
      setChampId(initialChampionId);
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

  async function handleSubmit() {
    if (champId == null) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSave(picks, champId);
      setSubmissionState("success");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open || !portalMounted) return null;

  const isChampionStep = displayStep === TOTAL - 1;
  const isSubmissionSuccess = isChampionStep && submissionState === "success";
  const currentGroup = isChampionStep ? null : sortedGroups[displayStep];

  const groupPickCount = Object.keys(picks).length;
  const missingGroups = sortedGroups.length - groupPickCount;
  const allPicksDone = missingGroups === 0 && champId != null;

  let animClass = "";
  if (animPhase === "exit") {
    animClass =
      direction === "forward" ? "wc-flip-exit-fwd" : "wc-flip-exit-bwd";
  } else if (animPhase === "enter") {
    animClass =
      direction === "forward" ? "wc-flip-enter-fwd" : "wc-flip-enter-bwd";
  }

  const progressPct = Math.round(((displayStep + 1) / TOTAL) * 100);

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
                {isChampionStep
                  ? "🏆 Who will win the World Cup?"
                  : `Group ${currentGroup?.group_letter} — Pick the winner`}
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
              {/* Group step */}
              {!isChampionStep && currentGroup && (
                <div className="px-5 pt-4 pb-2 space-y-2.5">
                  {currentGroup.teams.map((team) => {
                    const isSelected =
                      picks[currentGroup.group_letter] === team.id;
                    const pct = team.prediction_percentage;
                    return (
                      <button
                        key={team.id}
                        onClick={() =>
                          setPicks((prev) => ({
                            ...prev,
                            [currentGroup.group_letter]: team.id,
                          }))
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

              {/* Champion step */}
              {isChampionStep && (
                <div className="px-5 pt-4 pb-2 space-y-3">
                  {isSubmissionSuccess ? (
                    <div className="flex flex-col items-center text-center px-2 pb-3">
                      <p className="text-lg sm:text-xl font-extrabold">
                        Thank you for your voting!
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-[28ch]">
                        Your World Cup prediction has been submitted
                        successfully.
                      </p>

                      {champId != null && (
                        <div className="mt-5 px-3 py-2.5 rounded-xl bg-primary-font border border-primary-font/30 w-full max-w-[340px]">
                          {(() => {
                            const team = allTeams.find((t) => t.id === champId);
                            if (!team) return null;
                            return (
                              <div className="flex items-center gap-3">
                                <TeamLogo
                                  src={team.logo_url}
                                  name={team.name}
                                  size={40}
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
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
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

            {isChampionStep ? (
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
                    : !allPicksDone
                      ? missingGroups > 0
                        ? `${missingGroups} group${missingGroups > 1 ? "s" : ""} still missing`
                        : "Select a champion to submit"
                      : hasExistingPrediction
                        ? "Update Prediction"
                        : "Submit Prediction"}
                </button>
              )
            ) : (
              <button
                onClick={() => goTo(displayStep + 1)}
                disabled={
                  !picks[sortedGroups[displayStep]?.group_letter ?? ""] ||
                  animPhase !== "idle"
                }
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                  picks[sortedGroups[displayStep]?.group_letter ?? ""]
                    ? "bg-primary-font text-white hover:opacity-90 active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                {displayStep === TOTAL - 2
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
