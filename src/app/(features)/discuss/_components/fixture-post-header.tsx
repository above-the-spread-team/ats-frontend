"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle2, MessageCircle, Vote as VoteIcon } from "lucide-react";
import { useFixtureVotes, useVote } from "@/services/fastapi/vote";
import VoteColor from "@/components/common/vote-color";
import { VotingBar } from "@/components/common/voting-bar";
import type { GroupResponse } from "@/type/fastapi/groups";
import type { FixtureVotesResult, VoteChoice } from "@/type/fastapi/vote";
import { isFixtureNotStartedStatus } from "@/data/fixture-status";
const VOTE_SEGMENTS: VoteChoice[] = ["home", "draw", "away"];

const VOTE_BUTTONS: {
  key: VoteChoice;
  label: string;
  bg: string;
  ring: string;
}[] = [
  { key: "home", label: "1", bg: "bg-vote-blue", ring: "ring-vote-blue" },
  { key: "draw", label: "X", bg: "bg-vote-yellow", ring: "ring-vote-yellow" },
  { key: "away", label: "2", bg: "bg-vote-red", ring: "ring-vote-red" },
];

function pct(fixture: FixtureVotesResult, key: VoteChoice) {
  return key === "home"
    ? fixture.home_percentage
    : key === "draw"
      ? fixture.draw_percentage
      : fixture.away_percentage;
}

function voteFixtureIdFromGroup(group: GroupResponse): number | null {
  const fromMeta = group.fixture_meta?.api_fixture_id;
  if (typeof fromMeta === "number" && !Number.isNaN(fromMeta)) {
    return fromMeta;
  }
  const fid = group.fixture_id;
  if (typeof fid === "number" && !Number.isNaN(fid)) {
    return fid;
  }
  return null;
}

function FixtureVoteResultBlock({ voteFixtureId }: { voteFixtureId: number }) {
  const { data, isLoading, isError } = useFixtureVotes(voteFixtureId);

  if (isError) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-2 pt-1" aria-busy>
        <Skeleton className="h-2 w-full rounded-full bg-white/20" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-8 rounded-md bg-white/20" />
          <Skeleton className="h-3 w-8 rounded-md bg-white/20" />
          <Skeleton className="h-3 w-8 rounded-md bg-white/20" />
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasVotes = data.total_votes > 0;
  const yourVote = data.user_vote;

  return (
    <div className="space-y-1.5 pt-1 border-t border-white/20">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
          Fan vote
        </span>
        {hasVotes ? (
          <span className="text-[11px] text-white/75 tabular-nums">
            {data.total_votes.toLocaleString()}{" "}
            {data.total_votes === 1 ? "vote" : "votes"}
          </span>
        ) : null}
      </div>
      <VoteColor className="pb-0.5" textClassName="text-white/75" />

      <>
        <VotingBar
          fixture={data}
          trackClassName="bg-white/20"
          segmentStyle="emphasize-pick"
          userVote={yourVote}
        />
        <div className="flex justify-between gap-1 text-[11px] md:text-xs tabular-nums">
          {VOTE_SEGMENTS.map((key) => (
            <span
              key={key}
              className="font-medium text-white min-w-0 truncate"
            >
              {pct(data, key).toFixed(0)}%
            </span>
          ))}
        </div>
        {!hasVotes && (
          <p className="text-[11px] text-white/75">No votes yet</p>
        )}
        {yourVote ? (
          <p className="text-xs text-right text-white/75">
            Your pick:{" "}
            <span className="font-semibold text-white">
              {yourVote === "home"
                ? data.home_team
                : yourVote === "away"
                  ? data.away_team
                  : "Draw"}
            </span>
          </p>
        ) : null}
      </>
    </div>
  );
}

function FixtureVoteButton({
  voteFixtureId,
  teamLabels,
  fixtureStatusShort,
}: {
  voteFixtureId: number;
  teamLabels: { home: string; away: string };
  fixtureStatusShort: string | null;
}) {
  const { data } = useFixtureVotes(voteFixtureId);
  const { vote, isPending } = useVote();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yourVote = data?.user_vote ?? null;
  const votingOpen = isFixtureNotStartedStatus(fixtureStatusShort);
  const triggerDisabled = yourVote != null || !votingOpen;

  const subtitle = useMemo(() => {
    if (!data) return null;
    if (data.total_votes <= 0) return "No votes yet";
    return `${data.total_votes.toLocaleString()} ${
      data.total_votes === 1 ? "vote" : "votes"
    }`;
  }, [data]);

  async function handleVote(choice: VoteChoice) {
    setError(null);
    try {
      await vote(voteFixtureId, choice);
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit";
      if (msg.toLowerCase().includes("already voted")) {
        setOpen(false);
        return;
      }
      if (msg.toLowerCase().includes("rate limit")) {
        setError("Too many votes. Please wait a moment and try again.");
        return;
      }
      setError(msg);
    }
  }

  const triggerTitle =
    yourVote != null
      ? "You already voted"
      : !votingOpen
        ? "Voting is only available before kickoff"
        : "Vote on this fixture";

  const triggerLabel =
    yourVote != null ? "Voted" : !votingOpen ? "Voting closed" : "Vote";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-xl text-xs md:text-sm border-white/45 bg-white/10 text-white hover:bg-white/15 hover:text-white disabled:opacity-50"
          disabled={triggerDisabled}
          title={triggerTitle}
        >
          <VoteIcon className="w-4 h-4 " />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vote prediction</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold truncate min-w-0">
              {teamLabels.home} vs {teamLabels.away}
            </p>
            {subtitle ? (
              <p className="text-xs text-muted-foreground tabular-nums">
                {subtitle}
              </p>
            ) : null}
          </div>

          {yourVote ? (
            <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/40 border border-border">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground">
                  Your prediction (final)
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {yourVote === "home"
                    ? teamLabels.home
                    : yourVote === "away"
                      ? teamLabels.away
                      : "Draw"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {VOTE_BUTTONS.map((v) => (
                <button
                  key={v.key}
                  disabled={isPending}
                  onClick={() => handleVote(v.key)}
                  className={[
                    "rounded-lg py-2.5 text-sm font-extrabold text-white transition-all",
                    v.bg,
                    "hover:brightness-110 active:scale-95",
                    isPending ? "opacity-60 cursor-not-allowed" : "",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    v.ring,
                  ].join(" ")}
                >
                  {v.key === "home"
                    ? "Home"
                    : v.key === "away"
                      ? "Away"
                      : "Draw"}
                </button>
              ))}
            </div>
          )}

          {error ? (
            <p className="text-xs text-destructive text-center">{error}</p>
          ) : null}

          <p className="text-[11px] text-muted-foreground">
            Votes are final once submitted.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FixturePostHeaderProps {
  groupData: GroupResponse | null;
  isLoading: boolean;
}

function TeamCrest({
  logoUrl,
  teamName,
}: {
  logoUrl: string | null;
  teamName: string;
}) {
  const size =
    "relative w-11 h-11 sm:w-12 sm:h-12 md:h-14 md:h-14 flex-shrink-0 rounded-full ring-2 ring-white/35 bg-white/10 overflow-hidden";
  return (
    <div className={size} aria-hidden>
      {logoUrl ? (
        <div className="absolute inset-[3px] sm:inset-1.5 md:inset-2">
          <div className="relative h-full w-full">
            <Image
              src={logoUrl}
              alt=""
              fill
              className="object-contain object-center"
              sizes="(max-width: 640px) 40px, 48px"
            />
          </div>
        </div>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white/85">
          {teamName.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

/** [name] [logo] vs [logo] [name] — sides hug the center */
function NameLogoVsLogoName({
  homeLogo,
  awayLogo,
  homeName,
  awayName,
}: {
  homeLogo: string | null;
  awayLogo: string | null;
  homeName: string;
  awayName: string;
}) {
  return (
    <h1 className="m-0 font-normal w-full min-w-0">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
        <div className="flex flex-1 min-w-0 items-center justify-end gap-2 sm:gap-2.5">
          <span className="text-xs sm:text-base md:text-lg font-bold text-white leading-tight line-clamp-1 min-w-0 text-left">
            {homeName}
          </span>
          <TeamCrest logoUrl={homeLogo} teamName={homeName} />
        </div>
        <span className="text-white/80 font-semibold text-xs sm:text-sm shrink-0 px-0.5">
          vs
        </span>
        <div className="flex flex-1 min-w-0 items-center justify-start gap-2 sm:gap-2.5">
          <TeamCrest logoUrl={awayLogo} teamName={awayName} />
          <span className="text-xs sm:text-base md:text-lg font-bold text-white leading-tight line-clamp-1 min-w-0 text-left">
            {awayName}
          </span>
        </div>
      </div>
    </h1>
  );
}

export default function FixturePostHeader({
  groupData,
  isLoading,
}: FixturePostHeaderProps) {
  if (!groupData && !isLoading) {
    return null;
  }

  if (isLoading || !groupData) {
    return (
      <Card className="mb-3 hover:shadow-md transition-shadow overflow-hidden border-white/15 bg-gradient-to-br from-primary to-primary-active">
        <CardContent className="p-3 md:p-5">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <Skeleton className="h-5 flex-1 max-w-[40%] rounded-md bg-white/20" />
              <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shrink-0 bg-white/20" />
            </div>
            <Skeleton className="h-4 w-8 shrink-0 rounded-md bg-white/20" />
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-start">
              <Skeleton className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full shrink-0 bg-white/20" />
              <Skeleton className="h-5 flex-1 max-w-[40%] rounded-md bg-white/20" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-48 bg-white/20" />
            <Skeleton className="h-3 w-32 bg-white/20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const fx = groupData.fixture_meta;
  const homeName = fx?.home_team ?? "Home";
  const awayName = fx?.away_team ?? "Away";
  const homeLogo = fx?.home_team_logo ?? null;
  const awayLogo = fx?.away_team_logo ?? null;
  const leagueName = fx?.league_name?.trim() || null;
  const statusLabel = fx?.status?.trim() || null;
  const hasTeamLine = !!fx && (fx.home_team?.trim() || fx.away_team?.trim());
  const voteFixtureId = voteFixtureIdFromGroup(groupData);

  return (
    <Card className="mb-3 pr-2 hover:shadow-md transition-shadow overflow-hidden border-white/15 bg-gradient-to-br from-primary to-primary-active text-white shadow-md">
      <CardContent className="p-3 pr-2 md:p-5 md:pr-4">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 gap-y-1 min-w-0">
              {leagueName && (
                <div className="flex items-center gap-2 min-w-0">
                  {fx?.league_logo ? (
                    <div className="relative w-6 h-6 flex-shrink-0">
                      <Image
                        src={fx.league_logo}
                        alt=""
                        fill
                        className="object-contain object-center"
                        sizes="24px"
                      />
                    </div>
                  ) : null}
                  <span className="text-[11px] md:text-xs font-bold uppercase tracking-wide text-white/80 line-clamp-1">
                    {leagueName}
                  </span>
                </div>
              )}
              {statusLabel ? (
                <span className="text-[10px] md:text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/15 text-white">
                  {statusLabel}
                </span>
              ) : null}
            </div>

            {voteFixtureId != null && hasTeamLine ? (
              <div className="flex-shrink-0">
                <FixtureVoteButton
                  voteFixtureId={voteFixtureId}
                  teamLabels={{ home: homeName, away: awayName }}
                  fixtureStatusShort={fx?.status ?? null}
                />
              </div>
            ) : null}
          </div>

          {hasTeamLine ? (
            <NameLogoVsLogoName
              homeLogo={homeLogo}
              awayLogo={awayLogo}
              homeName={homeName}
              awayName={awayName}
            />
          ) : (
            <div className="flex items-center gap-3 md:gap-4">
              {groupData.icon_url ? (
                <div className="relative w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white/35">
                  <Image
                    src={groupData.icon_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 56px, 72px"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 md:w-[4.5rem] md:h-[4.5rem] rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                  MT
                </div>
              )}
              <h1 className="text-lg md:text-2xl font-bold text-white leading-tight min-w-0">
                {groupData.name}
              </h1>
            </div>
          )}

          {voteFixtureId != null ? (
            <FixtureVoteResultBlock voteFixtureId={voteFixtureId} />
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs text-white/75">
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              {groupData.post_count}{" "}
              {groupData.post_count === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
