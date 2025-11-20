"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type {
  FixturePlayersApiResponse,
  FixturePlayersResponseItem,
  FixturePlayersPlayerItem,
} from "@/type/fixture-players";
import Loading from "@/components/common/loading";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
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
      <div className="flex justify-center items-center py-12">
        <Loading />
      </div>
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

  function renderPlayerCard(
    playerItem: FixturePlayersPlayerItem,
    team: FixturePlayersResponseItem
  ) {
    const stat = playerItem.statistics[0]; // Usually one statistics object per player
    if (!stat) return null;

    return (
      <div
        key={playerItem.player.id}
        className="bg-card border border-border rounded-lg p-3 md:p-4 space-y-3"
      >
        {/* Player Header */}
        <div className="flex items-center gap-3">
          {playerItem.player.photo ? (
            <Image
              src={playerItem.player.photo}
              alt={playerItem.player.name}
              width={48}
              height={48}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-secondary/40 text-sm font-semibold uppercase text-muted-foreground">
              {getInitials(playerItem.player.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-bold text-foreground truncate">
                {playerItem.player.name}
              </h3>
              {stat.games.captain && (
                <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs md:text-sm text-muted-foreground">
                #{formatValue(stat.games.number)}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs md:text-sm text-muted-foreground">
                {stat.games.position}
              </span>
              {stat.games.substitute && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs md:text-sm text-blue-500">Sub</span>
                </>
              )}
            </div>
          </div>
          {stat.games.rating && stat.games.rating !== "0" && (
            <div className="text-right">
              <div className="bg-primary/10 text-primary rounded-full px-2 py-1">
                <span className="text-xs md:text-sm font-bold">
                  {parseFloat(stat.games.rating).toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-muted/30 rounded-md">
            <p className="text-[9px] md:text-[10px] text-muted-foreground mb-0.5">
              Minutes
            </p>
            <p className="text-xs md:text-sm font-bold text-foreground">
              {formatValue(stat.games.minutes)}
            </p>
          </div>
          <div className="text-center p-2 bg-green-500/10 rounded-md">
            <p className="text-[9px] md:text-[10px] text-muted-foreground mb-0.5">
              Goals
            </p>
            <p className="text-xs md:text-sm font-bold text-green-600 dark:text-green-400">
              {formatValue(stat.goals.total)}
            </p>
          </div>
          <div className="text-center p-2 bg-blue-500/10 rounded-md">
            <p className="text-[9px] md:text-[10px] text-muted-foreground mb-0.5">
              Assists
            </p>
            <p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400">
              {formatValue(stat.goals.assists)}
            </p>
          </div>
          <div className="text-center p-2 bg-purple-500/10 rounded-md">
            <p className="text-[9px] md:text-[10px] text-muted-foreground mb-0.5">
              Passes
            </p>
            <p className="text-xs md:text-sm font-bold text-purple-600 dark:text-purple-400">
              {formatValue(stat.passes.total)}
            </p>
          </div>
        </div>

        {/* Detailed Statistics Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableBody>
              {/* Shots */}
              <TableRow>
                <TableCell className="text-[10px] md:text-xs text-muted-foreground w-1/3">
                  Shots
                </TableCell>
                <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                  {formatValue(stat.shots.total)} ({formatValue(stat.shots.on)}{" "}
                  on target)
                </TableCell>
                <TableCell className="text-[10px] md:text-xs text-muted-foreground w-1/3">
                  Pass Accuracy
                </TableCell>
                <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                  {formatValue(stat.passes.accuracy)}
                </TableCell>
              </TableRow>

              {/* Tackles */}
              {stat.tackles.total !== null && (
                <TableRow>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Tackles
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    {formatValue(stat.tackles.total)} (Blocks:{" "}
                    {formatValue(stat.tackles.blocks)}, Int:{" "}
                    {formatValue(stat.tackles.interceptions)})
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Duels Won
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    {stat.duels.total !== null && stat.duels.won !== null
                      ? `${formatValue(stat.duels.won)}/${formatValue(
                          stat.duels.total
                        )}`
                      : "–"}
                  </TableCell>
                </TableRow>
              )}

              {/* Dribbles */}
              {stat.dribbles.attempts > 0 && (
                <TableRow>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Dribbles
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    {formatValue(stat.dribbles.success)}/
                    {formatValue(stat.dribbles.attempts)}
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Key Passes
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    {formatValue(stat.passes.key)}
                  </TableCell>
                </TableRow>
              )}

              {/* Fouls */}
              {(stat.fouls.committed > 0 || stat.fouls.drawn > 0) && (
                <TableRow>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Fouls
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    Committed: {formatValue(stat.fouls.committed)}, Drawn:{" "}
                    {formatValue(stat.fouls.drawn)}
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Cards
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    {stat.cards.yellow > 0 && (
                      <span className="text-yellow-500">
                        🟨 {formatValue(stat.cards.yellow)}
                      </span>
                    )}
                    {stat.cards.yellow > 0 && stat.cards.red > 0 && " "}
                    {stat.cards.red > 0 && (
                      <span className="text-red-500">
                        🟥 {formatValue(stat.cards.red)}
                      </span>
                    )}
                    {stat.cards.yellow === 0 && stat.cards.red === 0 && "–"}
                  </TableCell>
                </TableRow>
              )}

              {/* Goals for Goalkeepers */}
              {stat.games.position === "G" && (
                <>
                  {stat.goals.conceded !== null && (
                    <TableRow>
                      <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                        Goals Conceded
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                        {formatValue(stat.goals.conceded)}
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                        Saves
                      </TableCell>
                      <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                        {formatValue(stat.goals.saves)}
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}

              {/* Penalties */}
              {(stat.penalty.scored > 0 ||
                stat.penalty.missed > 0 ||
                stat.penalty.saved > 0) && (
                <TableRow>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Penalties
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    Scored: {formatValue(stat.penalty.scored)}, Missed:{" "}
                    {formatValue(stat.penalty.missed)}
                    {stat.penalty.saved > 0 &&
                      `, Saved: ${formatValue(stat.penalty.saved)}`}
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs text-muted-foreground">
                    Offsides
                  </TableCell>
                  <TableCell className="text-[10px] md:text-xs font-semibold text-foreground">
                    {formatValue(stat.offsides)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  function renderTeamSection(
    team: FixturePlayersResponseItem | null,
    title: string
  ) {
    if (!team || !team.players || team.players.length === 0) {
      return null;
    }

    // Sort players: starters first (by number), then substitutes
    const sortedPlayers = [...team.players].sort((a, b) => {
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
      <div className="space-y-4">
        {/* Team Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-border">
          {team.team.logo ? (
            <Image
              src={team.team.logo}
              alt={team.team.name}
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
          ) : (
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-secondary/40 text-xs font-semibold uppercase text-muted-foreground">
              {getInitials(team.team.name)}
            </div>
          )}
          <div>
            <h2 className="text-lg md:text-xl font-bold">{team.team.name}</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {sortedPlayers.length} player
              {sortedPlayers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {sortedPlayers.map((playerItem) =>
            renderPlayerCard(playerItem, team)
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold">Player Statistics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {playersData.results} team{playersData.results !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Teams */}
      <div className="space-y-8">
        {homeTeam && renderTeamSection(homeTeam, "Home Team")}
        {awayTeam && renderTeamSection(awayTeam, "Away Team")}
      </div>
    </div>
  );
}
