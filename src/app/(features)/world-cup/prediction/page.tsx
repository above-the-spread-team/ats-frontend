"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDeadline(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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

function CheckIcon({ className }: { className?: string }) {
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

function TeamLogo({
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

// ─── GroupCard (display only) ─────────────────────────────────────────────────

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

// ─── ChampionPercentages (display only) ──────────────────────────────────────

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

// ─── VotingModal ──────────────────────────────────────────────────────────────

type AnimPhase = "idle" | "exit" | "enter";
type Direction = "forward" | "backward";

function VotingModal({
  open,
  onClose,
  groups,
  initialPicks,
  initialChampionId,
  hasExistingPrediction,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  groups: WorldCupGroupResponse[];
  initialPicks: Record<string, number>;
  initialChampionId: number | null;
  hasExistingPrediction: boolean;
  onSave: (picks: Record<string, number>, championId: number) => Promise<void>;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [portalMounted, setPortalMounted] = useState(false);

  useEffect(() => {
    setPortalMounted(true);
  }, []);

  const sortedGroups = useMemo(
    () =>
      [...groups].sort((a, b) => a.group_letter.localeCompare(b.group_letter)),
    [groups],
  );
  const TOTAL = sortedGroups.length + 1; // 12 groups + 1 champion

  // Animation state: displayStep = what's rendered, targetStep = destination
  const [displayStep, setDisplayStep] = useState(0);
  const [targetStep, setTargetStep] = useState(0);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [direction, setDirection] = useState<Direction>("forward");

  // Pick state (local to modal, committed only on submit)
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
      setSubmitError(null);
      setChampSearch("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Body scroll lock (only after mount so portal and lock stay in sync)
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
      onClose();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open || !portalMounted) return null;

  const isChampionStep = displayStep === TOTAL - 1;
  const currentGroup = isChampionStep ? null : sortedGroups[displayStep];

  // Count missing picks (for submit button label)
  const groupPickCount = Object.keys(picks).length;
  const missingGroups = sortedGroups.length - groupPickCount;
  const allPicksDone = missingGroups === 0 && champId != null;

  // CSS animation class for content wrapper
  let animClass = "";
  if (animPhase === "exit") {
    animClass =
      direction === "forward" ? "wc-flip-exit-fwd" : "wc-flip-exit-bwd";
  } else if (animPhase === "enter") {
    animClass =
      direction === "forward" ? "wc-flip-enter-fwd" : "wc-flip-enter-bwd";
  }

  const progressPct = Math.round(((displayStep + 1) / TOTAL) * 100);

  /**
   * Portaled to document.body so `fixed` is always viewport-relative (no ancestor
   * transform/filter). Separate fixed backdrop + min-h-dvh avoids mobile top sliver;
   * z-[100] sits above site mobile nav (z-50).
   */
  return createPortal(
    <>
      <div
        className="fixed z-[100] min-h-dvh w-full bg-black/60 backdrop-blur-sm pointer-events-auto top-0 right-0 bottom-0 left-0"
        aria-hidden
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[100] flex min-h-dvh w-full items-end sm:items-center justify-center pointer-events-none">
        {/* Modal panel */}
        <div className="relative z-10 pointer-events-auto w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-[560px] sm:rounded-2xl bg-card flex flex-col overflow-hidden shadow-2xl">
          {/* ── Header ── */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground flex-shrink-0"
            >
              <XIcon className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm  text-muted-foreground font-medium uppercase tracking-wide">
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
                  {/* Selected champion preview */}
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

                  {/* Search */}
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
                            className={`text-[11px] ${isSelected ? "text-white" : "text-foreground/80"} flex-shrink-0`}
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
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="px-5 pt-3 pb-5 border-t border-border/60 flex-shrink-0 space-y-2">
            {submitError && (
              <p className="text-xs text-red-500 text-center">{submitError}</p>
            )}

            {isChampionStep ? (
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorldCupPredictionPage() {
  const [isClient, setIsClient] = useState(false);
  const [votingModalOpen, setVotingModalOpen] = useState(false);

  // Display picks (synced from existing prediction after load / after submit)
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

  // Sync local display picks from existing prediction
  useEffect(() => {
    if (!existingPrediction) return;
    const picks: Record<string, number> = {};
    for (const gp of existingPrediction.group_predictions) {
      if (gp.winner_team_id != null) picks[gp.group_letter] = gp.winner_team_id;
    }
    setGroupPicks(picks);
    if (existingPrediction.champion_team_id != null)
      setChampionId(existingPrediction.champion_team_id);
  }, [existingPrediction]);

  // Called by VotingModal on submit
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

    // Update local display picks optimistically
    setGroupPicks(picks);
    setChampionId(champTeamId);
  }

  if (!isClient) return null;

  const isLoading =
    groupsLoading || deadlineLoading || predictionLoading;

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
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-black">
          Group Stage Prediction
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
          Pick the winner of each group and your overall World Cup champion.
        </p>
      </div>

      {/* Deadline banner */}
      {deadline && (
        <DeadlineBanner
          deadline={deadline.deadline}
          isOpen={deadline.is_open}
        />
      )}

      {/* Vote / status button */}
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

      {/* Group cards */}
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

      {/* Champion percentages */}
      <ChampionPercentages
        teams={champions}
        isLoading={championsLoading}
        currentChampionId={championId}
      />

      {/* Voting modal */}
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
