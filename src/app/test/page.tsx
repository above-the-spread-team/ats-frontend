"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FixturesApiResponse } from "@/type/footballapi/fixture";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

async function fetchFixtures(
  type: "next" | "last",
  count: number,
  leagueId?: number
): Promise<FixturesApiResponse> {
  const params = new URLSearchParams();
  params.append(type, count.toString());
  if (leagueId) {
    params.append("league", leagueId.toString());
  }
  const response = await fetch(`/api/fixtures-next?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch fixtures");
  }
  return response.json();
}

export default function TestPage() {
  const [type, setType] = useState<"next" | "last">("next");
  const [count, setCount] = useState<number>(15);
  const [leagueId, setLeagueId] = useState<number | undefined>(undefined);

  const { data, isLoading, error } = useQuery<FixturesApiResponse, Error>({
    queryKey: ["fixtures-next", type, count, leagueId],
    queryFn: () => fetchFixtures(type, count, leagueId),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });

  const title =
    type === "next" ? `Next ${count} Fixtures` : `Last ${count} Fixtures`;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex gap-2 mb-4">
          <Button
            variant={type === "next" ? "default" : "outline"}
            onClick={() => setType("next")}
            size="sm"
          >
            Next
          </Button>
          <Button
            variant={type === "last" ? "default" : "outline"}
            onClick={() => setType("last")}
            size="sm"
          >
            Last
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Count:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 15)}
              className="w-20 px-2 py-1 border border-border rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">League ID:</span>
            <input
              type="number"
              min="1"
              placeholder="Optional"
              value={leagueId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setLeagueId(value ? parseInt(value) || undefined : undefined);
              }}
              className="w-24 px-2 py-1 border border-border rounded text-sm"
            />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex gap-2 mb-4">
          <Button
            variant={type === "next" ? "default" : "outline"}
            onClick={() => setType("next")}
            size="sm"
          >
            Next
          </Button>
          <Button
            variant={type === "last" ? "default" : "outline"}
            onClick={() => setType("last")}
            size="sm"
          >
            Last
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Count:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 15)}
              className="w-20 px-2 py-1 border border-border rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">League ID:</span>
            <input
              type="number"
              min="1"
              placeholder="Optional"
              value={leagueId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setLeagueId(value ? parseInt(value) || undefined : undefined);
              }}
              className="w-24 px-2 py-1 border border-border rounded text-sm"
            />
          </div>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive font-semibold">Error:</p>
          <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!data || !data.response || data.response.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex gap-2 mb-4">
          <Button
            variant={type === "next" ? "default" : "outline"}
            onClick={() => setType("next")}
            size="sm"
          >
            Next
          </Button>
          <Button
            variant={type === "last" ? "default" : "outline"}
            onClick={() => setType("last")}
            size="sm"
          >
            Last
          </Button>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">Count:</span>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 15)}
              className="w-20 px-2 py-1 border border-border rounded text-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-muted-foreground">League ID:</span>
            <input
              type="number"
              min="1"
              placeholder="Optional"
              value={leagueId || ""}
              onChange={(e) => {
                const value = e.target.value;
                setLeagueId(value ? parseInt(value) || undefined : undefined);
              }}
              className="w-24 px-2 py-1 border border-border rounded text-sm"
            />
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground">No fixtures found</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <div className="flex gap-2 mb-4">
        <Button
          variant={type === "next" ? "default" : "outline"}
          onClick={() => setType("next")}
          size="sm"
        >
          Next
        </Button>
        <Button
          variant={type === "last" ? "default" : "outline"}
          onClick={() => setType("last")}
          size="sm"
        >
          Last
        </Button>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground">Count:</span>
          <input
            type="number"
            min="1"
            max="100"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 15)}
            className="w-20 px-2 py-1 border border-border rounded text-sm bg-background"
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-muted-foreground">League ID:</span>
          <input
            type="number"
            min="1"
            placeholder="Optional"
            value={leagueId || ""}
            onChange={(e) => {
              const value = e.target.value;
              setLeagueId(value ? parseInt(value) || undefined : undefined);
            }}
            className="w-24 px-2 py-1 border border-border rounded text-sm bg-background"
          />
        </div>
      </div>
      <div className="mb-4 text-sm text-muted-foreground">
        Total results: {data.results} | Parameters:{" "}
        {JSON.stringify(data.parameters)}
      </div>
      <div className="space-y-2">
        {data.response.map((fixture) => (
          <div
            key={fixture.fixture.id}
            className="bg-card border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded">
                    {fixture.league.name}
                  </span>
                  {fixture.league.round && (
                    <span className="text-xs text-muted-foreground">
                      {fixture.league.round}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {fixture.teams.home.logo && (
                      <img
                        src={fixture.teams.home.logo}
                        alt={fixture.teams.home.name}
                        className="w-6 h-6"
                      />
                    )}
                    <span className="font-medium">
                      {fixture.teams.home.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className="flex items-center gap-2">
                    {fixture.teams.away.logo && (
                      <img
                        src={fixture.teams.away.logo}
                        alt={fixture.teams.away.name}
                        className="w-6 h-6"
                      />
                    )}
                    <span className="font-medium">
                      {fixture.teams.away.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatDate(fixture.fixture.date)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Status: {fixture.fixture.status.long}
                </div>
                {fixture.fixture.venue.name && (
                  <div className="text-xs text-muted-foreground">
                    {fixture.fixture.venue.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
