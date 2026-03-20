"use client";

import { useState } from "react";
import Image from "next/image";
import { useTodayVotes, useVote } from "@/services/fastapi/vote";
import type { FixtureVotesResult, VoteChoice } from "@/type/fastapi/vote";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

// ── Team logo ──────────────────────────────────────────────────────────────
function TeamLogo({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
        unoptimized
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ── Vote percentage bar ────────────────────────────────────────────────────
function VoteBar({
  homePercent,
  drawPercent,
  awayPercent,
}: {
  homePercent: number;
  drawPercent: number;
  awayPercent: number;
}) {
  return (
    <div className="w-full flex rounded-full overflow-hidden h-2.5">
      <div
        style={{ width: `${homePercent}%` }}
        className="bg-blue-500 transition-all duration-500"
        title={`Home ${homePercent.toFixed(1)}%`}
      />
      <div
        style={{ width: `${drawPercent}%` }}
        className="bg-amber-400 transition-all duration-500"
        title={`Draw ${drawPercent.toFixed(1)}%`}
      />
      <div
        style={{ width: `${awayPercent}%` }}
        className="bg-rose-500 transition-all duration-500"
        title={`Away ${awayPercent.toFixed(1)}%`}
      />
    </div>
  );
}

// ── Single fixture card ────────────────────────────────────────────────────
function FixtureVoteCard({ fixture }: { fixture: FixtureVotesResult }) {
  const { vote, isPending } = useVote();
  const [localError, setLocalError] = useState<string | null>(null);

  const votingOpen = fixture.status === "NS";
  const voted = fixture.user_vote;

  const handleVote = async (choice: VoteChoice) => {
    setLocalError(null);
    try {
      await vote(fixture.fixture_id, choice);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Failed to submit vote");
    }
  };

  const matchTime = new Date(fixture.match_date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const choices: { label: string; value: VoteChoice; color: string }[] = [
    { label: fixture.home_team, value: "home", color: "bg-blue-500 hover:bg-blue-600 text-white" },
    { label: "Draw",            value: "draw", color: "bg-amber-400 hover:bg-amber-500 text-white" },
    { label: fixture.away_team, value: "away", color: "bg-rose-500 hover:bg-rose-600 text-white" },
  ];

  return (
    <Card className="border border-border">
      <CardContent className="p-4 space-y-4">
        {/* League info */}
        {(fixture.league_name || fixture.league_logo) && (
          <div className="flex items-center gap-1.5">
            {fixture.league_logo && (
              <Image
                src={fixture.league_logo}
                alt={fixture.league_name ?? "League"}
                width={16}
                height={16}
                className="w-4 h-4 object-contain"
                unoptimized
              />
            )}
            <span className="text-xs text-muted-foreground">
              {fixture.league_name}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              {matchTime} · <span className={votingOpen ? "text-green-500" : "text-amber-500"}>{fixture.status}</span>
            </span>
          </div>
        )}

        {/* Teams row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TeamLogo src={fixture.home_team_logo} name={fixture.home_team} />
            <span className="text-sm font-semibold truncate">{fixture.home_team}</span>
          </div>
          <span className="text-xs font-bold text-muted-foreground flex-shrink-0 px-2">vs</span>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="text-sm font-semibold truncate text-right">{fixture.away_team}</span>
            <TeamLogo src={fixture.away_team_logo} name={fixture.away_team} />
          </div>
        </div>

        {/* Vote buttons */}
        <div className="grid grid-cols-3 gap-2">
          {choices.map(({ label, value, color }) => {
            const isVoted = voted === value;
            return (
              <button
                key={value}
                disabled={!votingOpen || isPending}
                onClick={() => handleVote(value)}
                className={[
                  "rounded-lg py-2 text-xs font-semibold transition-all border-2 truncate px-1",
                  votingOpen
                    ? isVoted
                      ? `${color} border-transparent ring-2 ring-offset-1 ring-current scale-105`
                      : `${color} border-transparent opacity-75 hover:opacity-100`
                    : "bg-muted text-muted-foreground border-transparent cursor-not-allowed opacity-50",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Vote bar + percentages */}
        {fixture.total_votes > 0 ? (
          <div className="space-y-1.5">
            <VoteBar
              homePercent={fixture.home_percentage}
              drawPercent={fixture.draw_percentage}
              awayPercent={fixture.away_percentage}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span className="text-blue-500 font-medium">{fixture.home_percentage.toFixed(1)}%</span>
              <span>{fixture.total_votes} votes · {fixture.draw_percentage.toFixed(1)}% draw</span>
              <span className="text-rose-500 font-medium">{fixture.away_percentage.toFixed(1)}%</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-center text-muted-foreground">No votes yet — be the first!</p>
        )}

        {localError && (
          <p className="text-xs text-destructive">{localError}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function VoteTestPage() {
  const { data, isLoading, error, refetch, isFetching } = useTodayVotes();
  const [showJson, setShowJson] = useState(false);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vote Test</h1>
            <p className="text-sm text-muted-foreground">
              GET /api/v1/votes/today · public endpoint
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12 ml-auto" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-4 w-6" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="w-8 h-8 rounded-full" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((j) => <Skeleton key={j} className="h-9 rounded-lg" />)}
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <p className="text-sm text-destructive font-semibold">Error</p>
              <p className="text-xs text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && !error && data?.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              No fixtures today.
            </CardContent>
          </Card>
        )}

        {/* Fixture cards */}
        {data && data.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {data.length} fixture{data.length !== 1 ? "s" : ""} today
            </p>
            {data.map((fixture) => (
              <FixtureVoteCard key={fixture.fixture_id} fixture={fixture} />
            ))}
          </div>
        )}

        {/* Raw JSON toggle */}
        {data && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJson((v) => !v)}
              className="gap-1 text-muted-foreground"
            >
              {showJson ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showJson ? "Hide" : "Show"} raw JSON
            </Button>
            {showJson && (
              <pre className="mt-2 p-4 rounded-xl bg-muted text-xs overflow-auto max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
