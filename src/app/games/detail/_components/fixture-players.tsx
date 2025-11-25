"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type {
  FixturePlayersApiResponse,
  FixturePlayersResponseItem,
  FixturePlayersPlayerItem,
} from "@/type/fixture-players";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Crown } from "lucide-react";

function getInitials(text: string | null | undefined, fallback = "??") {
  if (!text) return fallback;
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined) {
    return "–";
  }
  if (typeof value === "string") {
    return value;
  }
  return value.toString();
}

interface FixturePlayersProps {
  fixtureId: number;
  homeTeamId?: number;
  awayTeamId?: number;
}

export default function FixturePlayers({
  fixtureId,
  homeTeamId,
  awayTeamId,
}: FixturePlayersProps) {
  const router = useRouter();
  const [playersData, setPlayersData] =
    useState<FixturePlayersApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPlayers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          fixture: fixtureId.toString(),
        });

        const response = await fetch(
          `/api/fixture-players?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load fixture players (${response.status})`
          );
        }

        const data = (await response.json()) as FixturePlayersApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        setPlayersData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setPlayersData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlayers();

    return () => {
      controller.abort();
    };
  }, [fixtureId]);

  if (isLoading) {
    return (
      <>
        {/* Teams Skeleton */}
        <div className="space-y-8">
          {/* Home Team Skeleton */}
          <div className="space-y-0">
            {/* Team Header Skeleton */}
            <div className="flex items-center px-2 pb-2 gap-3 border-b border-border">
              <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
              <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
              <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
            </div>

            {/* Players Table Skeleton */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Player</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Min</TableHead>
                    <TableHead className="text-center">G</TableHead>
                    <TableHead className="text-center">A</TableHead>
                    <TableHead className="text-center">Shots</TableHead>
                    <TableHead className="text-center">Passes</TableHead>
                    <TableHead className="text-center">Pass%</TableHead>
                    <TableHead className="text-center">KP</TableHead>
                    <TableHead className="text-center">Tkl</TableHead>
                    <TableHead className="text-center">Duels</TableHead>
                    <TableHead className="text-center">Drib</TableHead>
                    <TableHead className="text-center">Fouls</TableHead>
                    <TableHead className="text-center">Cards</TableHead>
                    <TableHead className="text-center">GC</TableHead>
                    <TableHead className="text-center">Saves</TableHead>
                    <TableHead className="text-center">Pen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 11 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {/* Player */}
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-2 pl-1">
                          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                              {idx % 3 === 0 && (
                                <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <Skeleton className="h-3 w-20 md:w-28 mt-1" />
                          </div>
                        </div>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className="text-center">
                        <Skeleton className="h-5 w-10 mx-auto" />
                      </TableCell>

                      {/* Minutes */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-8 mx-auto" />
                      </TableCell>

                      {/* Goals */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Assists */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Shots */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-8 mx-auto" />
                      </TableCell>

                      {/* Passes */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>

                      {/* Pass Accuracy */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>

                      {/* Key Passes */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Tackles */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Duels Won */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-12 mx-auto" />
                      </TableCell>

                      {/* Dribbles */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-12 mx-auto" />
                      </TableCell>

                      {/* Fouls */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-12 mx-auto" />
                      </TableCell>

                      {/* Cards */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>

                      {/* Goalkeeper Stats */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-8 mx-auto" />
                      </TableCell>

                      {/* Penalties */}
                      <TableCell className="text-center pr-1">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Away Team Skeleton */}
          <div className="space-y-0">
            {/* Team Header Skeleton */}
            <div className="flex items-center px-2 pb-2 gap-3 border-b border-border">
              <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
              <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
              <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
            </div>

            {/* Players Table Skeleton */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Player</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Min</TableHead>
                    <TableHead className="text-center">G</TableHead>
                    <TableHead className="text-center">A</TableHead>
                    <TableHead className="text-center">Shots</TableHead>
                    <TableHead className="text-center">Passes</TableHead>
                    <TableHead className="text-center">Pass%</TableHead>
                    <TableHead className="text-center">KP</TableHead>
                    <TableHead className="text-center">Tkl</TableHead>
                    <TableHead className="text-center">Duels</TableHead>
                    <TableHead className="text-center">Drib</TableHead>
                    <TableHead className="text-center">Fouls</TableHead>
                    <TableHead className="text-center">Cards</TableHead>
                    <TableHead className="text-center">GC</TableHead>
                    <TableHead className="text-center">Saves</TableHead>
                    <TableHead className="text-center">Pen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {/* Player */}
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-2 pl-1">
                          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                              {idx % 4 === 0 && (
                                <Skeleton className="w-3 h-3 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <Skeleton className="h-3 w-20 md:w-28 mt-1" />
                          </div>
                        </div>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className="text-center">
                        <Skeleton className="h-5 w-10 mx-auto" />
                      </TableCell>

                      {/* Minutes */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-8 mx-auto" />
                      </TableCell>

                      {/* Goals */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Assists */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Shots */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-8 mx-auto" />
                      </TableCell>

                      {/* Passes */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>

                      {/* Pass Accuracy */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>

                      {/* Key Passes */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Tackles */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>

                      {/* Duels Won */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-12 mx-auto" />
                      </TableCell>

                      {/* Dribbles */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-12 mx-auto" />
                      </TableCell>

                      {/* Fouls */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-12 mx-auto" />
                      </TableCell>

                      {/* Cards */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>

                      {/* Goalkeeper Stats */}
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-6 mx-auto" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Skeleton className="h-3 md:h-4 w-8 mx-auto" />
                      </TableCell>

                      {/* Penalties */}
                      <TableCell className="text-center pr-1">
                        <Skeleton className="h-3 md:h-4 w-10 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !playersData || !playersData.response) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No players data available"}
        </p>
      </div>
    );
  }

  const teams = playersData.response;

  if (teams.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No players data available for this fixture.
        </p>
      </div>
    );
  }

  // Determine home and away teams
  let homeTeam: FixturePlayersResponseItem | null = null;
  let awayTeam: FixturePlayersResponseItem | null = null;

  if (homeTeamId && awayTeamId) {
    homeTeam = teams.find((team) => team.team.id === homeTeamId) || null;
    awayTeam = teams.find((team) => team.team.id === awayTeamId) || null;
  } else {
    // Fallback: assume first is home, second is away
    homeTeam = teams[0] || null;
    awayTeam = teams[1] || null;
  }

  function renderPlayerRow(
    playerItem: FixturePlayersPlayerItem,
    team: FixturePlayersResponseItem
  ) {
    const stat = playerItem.statistics[0]; // Usually one statistics object per player
    if (!stat) return null;

    const handlePlayerClick = () => {
      router.push(`/stats/player/${playerItem.player.id}`);
    };

    return (
      <TableRow
        key={playerItem.player.id}
        onClick={handlePlayerClick}
        className="group cursor-pointer dark:hover:bg-mygray/10 hover:bg-mygray/50 transition-colors"
      >
        {/* Player */}
        <TableCell className="min-w-[200px] ">
          <div className="flex items-center gap-2 pl-1">
            {playerItem.player.photo ? (
              <Image
                src={playerItem.player.photo}
                alt={playerItem.player.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/40 text-xs font-semibold uppercase text-muted-foreground flex-shrink-0">
                {getInitials(playerItem.player.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs md:text-sm font-medium text-foreground truncate group-hover:underline group-hover:text-primary-font">
                  {playerItem.player.name}
                </span>
                {stat.games.captain && (
                  <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>#{formatValue(stat.games.number)}</span>
                <span>•</span>
                <span>{stat.games.position}</span>
                {stat.games.substitute && (
                  <>
                    <span>•</span>
                    <span className="text-blue-500">Sub</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </TableCell>

        {/* Rating */}
        <TableCell className="text-center">
          {stat.games.rating && stat.games.rating !== "0" ? (
            <span className="inline-block bg-primary-font/10 text-primary-font rounded px-2 py-0.5 text-xs font-bold">
              {parseFloat(stat.games.rating).toFixed(1)}
            </span>
          ) : (
            <span className="text-muted-foreground">–</span>
          )}
        </TableCell>

        {/* Minutes */}
        <TableCell className="text-center text-xs md:text-sm">
          {formatValue(stat.games.minutes)}
        </TableCell>

        {/* Goals */}
        <TableCell className="text-center text-xs md:text-sm font-semibold text-green-600 dark:text-green-400">
          {formatValue(stat.goals.total)}
        </TableCell>

        {/* Assists */}
        <TableCell className="text-center text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400">
          {formatValue(stat.goals.assists)}
        </TableCell>

        {/* Shots */}
        <TableCell className="text-center text-xs md:text-sm">
          {formatValue(stat.shots.total)}
          {stat.shots.on !== null && stat.shots.on > 0 && (
            <span className="text-muted-foreground text-[10px] block">
              ({formatValue(stat.shots.on)} on)
            </span>
          )}
        </TableCell>

        {/* Passes */}
        <TableCell className="text-center text-xs md:text-sm">
          {formatValue(stat.passes.total)}
        </TableCell>

        {/* Pass Accuracy */}
        <TableCell className="text-center text-xs md:text-sm">
          {formatValue(stat.passes.accuracy)}
        </TableCell>

        {/* Key Passes */}
        <TableCell className="text-center text-xs md:text-sm">
          {formatValue(stat.passes.key)}
        </TableCell>

        {/* Tackles */}
        <TableCell className="text-center text-xs md:text-sm">
          {stat.tackles.total !== null ? formatValue(stat.tackles.total) : "–"}
        </TableCell>

        {/* Duels Won */}
        <TableCell className="text-center text-xs md:text-sm">
          {stat.duels.total !== null && stat.duels.won !== null
            ? `${formatValue(stat.duels.won)}/${formatValue(stat.duels.total)}`
            : "–"}
        </TableCell>

        {/* Dribbles */}
        <TableCell className="text-center text-xs md:text-sm">
          {stat.dribbles.attempts > 0
            ? `${formatValue(stat.dribbles.success)}/${formatValue(
                stat.dribbles.attempts
              )}`
            : "–"}
        </TableCell>

        {/* Fouls */}
        <TableCell className="text-center text-xs md:text-sm">
          {stat.fouls.committed > 0 || stat.fouls.drawn > 0
            ? `${formatValue(stat.fouls.committed)}/${formatValue(
                stat.fouls.drawn
              )}`
            : "–"}
        </TableCell>

        {/* Cards */}
        <TableCell className="text-center text-xs md:text-sm">
          {stat.cards.yellow > 0 || stat.cards.red > 0 ? (
            <div className="flex items-center justify-center gap-1">
              {stat.cards.yellow > 0 && (
                <span className="text-yellow-500">
                  🟨 {formatValue(stat.cards.yellow)}
                </span>
              )}
              {stat.cards.red > 0 && (
                <span className="text-red-500">
                  🟥 {formatValue(stat.cards.red)}
                </span>
              )}
            </div>
          ) : (
            "–"
          )}
        </TableCell>

        {/* Goalkeeper Stats - always render, show "–" if not GK */}
        <TableCell className="text-center text-xs md:text-sm">
          {stat.games.position === "G" && stat.goals.conceded !== null
            ? formatValue(stat.goals.conceded)
            : "–"}
        </TableCell>
        <TableCell className="text-center text-xs md:text-sm">
          {stat.games.position === "G" ? formatValue(stat.goals.saves) : "–"}
        </TableCell>

        {/* Penalties - always render, show "–" if no penalties */}
        <TableCell className="text-center text-xs md:text-sm pr-1">
          {stat.penalty.scored > 0 ||
          stat.penalty.missed > 0 ||
          stat.penalty.saved > 0
            ? `${formatValue(stat.penalty.scored)}/${formatValue(
                stat.penalty.missed
              )}${
                stat.penalty.saved > 0
                  ? `/${formatValue(stat.penalty.saved)}`
                  : ""
              }`
            : "–"}
        </TableCell>
      </TableRow>
    );
  }

  function renderTeamTable(
    team: FixturePlayersResponseItem | null,
    title: string
  ) {
    if (!team || !team.players || team.players.length === 0) {
      return null;
    }

    // Sort players: starters first (by number), then substitutes
    const sortedPlayers = [...team.players]
      .filter((player) => {
        const stat = player.statistics[0];
        // Filter out players with 0 minutes or no minutes data
        return (
          stat &&
          stat.games.minutes !== null &&
          stat.games.minutes !== undefined &&
          stat.games.minutes > 0
        );
      })
      .sort((a, b) => {
        const statA = a.statistics[0];
        const statB = b.statistics[0];
        if (!statA || !statB) return 0;

        // Starters first
        if (statA.games.substitute !== statB.games.substitute) {
          return statA.games.substitute ? 1 : -1;
        }

        // Then by number
        return (statA.games.number || 0) - (statB.games.number || 0);
      });

    return (
      <div className="space-y-0 ">
        {/* Team Header */}
        <div className="flex items-center px-2 pb-2 gap-3  border-b border-border">
          {team.team.logo ? (
            <Image
              src={team.team.logo}
              alt={team.team.name}
              width={40}
              height={40}
              className="w-5 h-5 md:w-6 md:h-6 object-contain"
            />
          ) : (
            <div className="flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-secondary/40 text-[8px] font-semibold uppercase text-muted-foreground">
              {getInitials(team.team.name)}
            </div>
          )}
          <h2 className="text-sm md:text-base font-bold">{team.team.name}</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            {sortedPlayers.length} player
            {sortedPlayers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Players Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Player</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Min</TableHead>
                <TableHead className="text-center">G</TableHead>
                <TableHead className="text-center">A</TableHead>
                <TableHead className="text-center">Shots</TableHead>
                <TableHead className="text-center">Passes</TableHead>
                <TableHead className="text-center">Pass%</TableHead>
                <TableHead className="text-center">KP</TableHead>
                <TableHead className="text-center">Tkl</TableHead>
                <TableHead className="text-center">Duels</TableHead>
                <TableHead className="text-center">Drib</TableHead>
                <TableHead className="text-center">Fouls</TableHead>
                <TableHead className="text-center">Cards</TableHead>
                <TableHead className="text-center">GC</TableHead>
                <TableHead className="text-center">Saves</TableHead>
                <TableHead className="text-center">Pen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((playerItem) =>
                renderPlayerRow(playerItem, team)
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Teams */}
      <div className="space-y-8">
        {homeTeam && renderTeamTable(homeTeam, "Home Team")}
        {awayTeam && renderTeamTable(awayTeam, "Away Team")}
      </div>
    </>
  );
}
