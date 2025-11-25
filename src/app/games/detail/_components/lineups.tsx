"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Shirt } from "lucide-react";
import type { LineupsApiResponse, LineupResponseItem } from "@/type/lineups";
import { Skeleton } from "@/components/ui/skeleton";

// Fixed colors for home and away teams (mild/soft colors)
const HOME_TEAM_BASE = {
  primary: "#6b9bd4", // Mild blue background
  number: "#ffffff", // White text
  border: "#4a7fb8", // Darker mild blue border
};

const AWAY_TEAM_BASE = {
  primary: "#d97777", // Mild red background
  number: "#ffffff", // White text
  border: "#c45a5a", // Darker mild red border
};

// Function to get team colors with goalkeeper having darker shade
function getTeamColors(pos: string, isHome: boolean) {
  const base = isHome ? HOME_TEAM_BASE : AWAY_TEAM_BASE;
  const isGoalkeeper = pos === "G";

  if (isGoalkeeper) {
    // Goalkeeper gets a darker shade
    return {
      primary: isHome ? "#3b5f8f" : "#b91c1c", // Darker blue/red
      number: base.number,
      border: isHome ? "#2a4a6f" : "#991b1b", // Even darker border
    };
  }

  return base;
}

function getPositionLabel(pos: string): string {
  const positionMap: Record<string, string> = {
    G: "GK",
    D: "DEF",
    M: "MID",
    F: "FWD",
  };
  return positionMap[pos] || pos;
}

interface LineupsProps {
  fixtureId: number;
}

export default function Lineups({ fixtureId }: LineupsProps) {
  const [lineupsData, setLineupsData] = useState<LineupsApiResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLineups = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/lineups?fixture=${fixtureId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load lineups data (${response.status})`);
        }

        const data = (await response.json()) as LineupsApiResponse;

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }

        setLineupsData(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setLineupsData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchLineups();

    return () => {
      controller.abort();
    };
  }, [fixtureId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Combined Formation Field Skeleton */}
        <div className="px-2 pb-4 md:px-12 space-y-2">
          {/* Team Header Skeleton */}
          <div className="flex items-center justify-between mb-2 md:mb-4 gap-2">
            <div className="flex items-center gap-1.5 md:gap-3 flex-1 min-w-0">
              <Skeleton className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-md" />
              <div className="min-w-0 space-y-1">
                <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                <Skeleton className="h-2 md:h-3 w-16 md:w-20" />
              </div>
            </div>
            <Skeleton className="h-3 md:h-4 w-8 md:w-12" />
            <div className="flex items-center gap-1.5 md:gap-3 flex-1 min-w-0 justify-end">
              <div className="text-right min-w-0 space-y-1">
                <Skeleton className="h-3 md:h-4 w-24 md:w-32 ml-auto" />
                <Skeleton className="h-2 md:h-3 w-16 md:w-20 ml-auto" />
              </div>
              <Skeleton className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-md" />
            </div>
          </div>

          {/* Field Skeleton */}
          <Skeleton className="w-full aspect-[2/1] rounded-sm" />
        </div>

        {/* Team Cards Skeleton */}
        {Array.from({ length: 2 }).map((_, teamIdx) => (
          <div
            key={teamIdx}
            className="space-y-2 border-b border-border pb-4 md:pb-6 last:border-b-0"
          >
            {/* Team Header Skeleton */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-md" />
                <div className="min-w-0 space-y-1">
                  <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
                  <Skeleton className="h-3 md:h-4 w-24 md:w-32" />
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
                <div className="text-right space-y-1">
                  <Skeleton className="h-3 md:h-4 w-12 md:w-16 ml-auto" />
                  <Skeleton className="h-3 md:h-4 w-20 md:w-24 ml-auto" />
                </div>
              </div>
            </div>

            {/* Starting XI Skeleton */}
            <div className="bg-card/90 p-4 md:p-6 rounded-2xl space-y-2">
              <div className="space-y-4 md:space-y-5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 md:h-5 w-20 md:w-24" />
                  <Skeleton className="h-3 md:h-4 w-8" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 pb-2">
                  {/* Goalkeeper Skeleton */}
                  <div className="space-y-2 md:space-y-3">
                    <Skeleton className="h-3 md:h-4 w-24 md:w-28" />
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {Array.from({ length: 1 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50"
                        >
                          <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                            <Skeleton className="h-2 md:h-3 w-12 md:w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Defenders Skeleton */}
                  <div className="space-y-2 md:space-y-3">
                    <Skeleton className="h-3 md:h-4 w-28 md:w-32" />
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50"
                        >
                          <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                            <Skeleton className="h-2 md:h-3 w-12 md:w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Midfielders Skeleton */}
                  <div className="space-y-2 md:space-y-3">
                    <Skeleton className="h-3 md:h-4 w-28 md:w-32" />
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50"
                        >
                          <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                            <Skeleton className="h-2 md:h-3 w-12 md:w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Forwards Skeleton */}
                  <div className="space-y-2 md:space-y-3">
                    <Skeleton className="h-3 md:h-4 w-24 md:w-28" />
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50"
                        >
                          <Skeleton className="w-6 h-6 md:w-8 md:h-8 rounded-full" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                            <Skeleton className="h-2 md:h-3 w-12 md:w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Substitutes Skeleton */}
              <div className="space-y-3 md:space-y-4 mt-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 md:h-5 w-24 md:w-32" />
                  <Skeleton className="h-3 md:h-4 w-8" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
                  {Array.from({ length: 7 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 md:p-2.5 bg-muted/20 rounded-lg border border-border/30"
                    >
                      <Skeleton className="w-7 h-7 md:w-8 md:h-8 rounded-full" />
                      <div className="flex-1 min-w-0 space-y-1">
                        <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
                        <Skeleton className="h-2 md:h-3 w-12 md:w-14" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !lineupsData || !lineupsData.response) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No lineups data available"}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Lineups may not be available yet. They are typically available 20-40
          minutes before the match.
        </p>
      </div>
    );
  }

  const lineups = lineupsData.response;

  if (lineups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No lineups available.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Lineups may not be available yet. They are typically available 20-40
          minutes before the match.
        </p>
      </div>
    );
  }

  const homeLineup = lineups[0];
  const awayLineup = lineups[1] || null;

  return (
    <div className="space-y-6">
      {/* Combined Formation Visualization */}
      {homeLineup.formation && awayLineup?.formation && (
        <CombinedFormationField
          homeLineup={homeLineup}
          awayLineup={awayLineup}
        />
      )}

      {/* Individual Team Cards */}
      {lineups.map((lineup, index) => (
        <LineupCard key={lineup.team.id} lineup={lineup} isHome={index === 0} />
      ))}
    </div>
  );
}

interface LineupCardProps {
  lineup: LineupResponseItem;
  isHome: boolean;
}

function LineupCard({ lineup, isHome }: LineupCardProps) {
  // Group players by position
  const groupPlayersByPosition = (players: typeof lineup.startXI) => {
    const groups: Record<string, typeof lineup.startXI> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
    };

    players.forEach((item) => {
      const posLabel = getPositionLabel(item.player.pos);
      if (posLabel === "GK") {
        groups.GK.push(item);
      } else if (posLabel === "DEF") {
        groups.DEF.push(item);
      } else if (posLabel === "MID") {
        groups.MID.push(item);
      } else if (posLabel === "FWD") {
        groups.FWD.push(item);
      }
    });

    return groups;
  };

  const positionGroups = groupPlayersByPosition(lineup.startXI);

  return (
    <div className="space-y-2 border-b border-border pb-4  md:pb-6 last:border-b-0">
      {/* Team Header */}
      <div className="flex items-center justify-between   ">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          {lineup.team.logo && (
            <Image
              src={lineup.team.logo}
              alt={lineup.team.name}
              width={48}
              height={48}
              className="w-5 h-5 md:w-6 md:h-6  object-contain flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm md:text-base   font-bold truncate">
              {lineup.team.name}
            </h3>
            {lineup.formation && (
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Formation: {lineup.formation}
              </p>
            )}
          </div>
        </div>
        {lineup.coach && (
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {lineup.coach.photo && (
              <Image
                src={lineup.coach.photo}
                alt={lineup.coach.name}
                width={40}
                height={40}
                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0 border-2 border-border"
              />
            )}
            <div className="text-right ">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Coach
              </p>
              <p className="text-xs md:text-sm font-semibold truncate max-w-[140px] md:max-w-none">
                {lineup.coach.name}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="bg-card/90 shadow-inner p-3 md:p-4 rounded-2xl space-y-2">
        {/* Start XI - Grouped by Position */}
        <div className="space-y-4  md:space-y-5">
          <div className="flex items-center gap-2">
            <h4 className="text-sm md:text-base  font-bold text-foreground">
              Starting XI
            </h4>
            <span className="text-xs md:text-sm text-muted-foreground">
              ({lineup.startXI.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 pb-2">
            {/* Goalkeeper */}
            {positionGroups.GK.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h5 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Goalkeeper
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                  {positionGroups.GK.map((item) => {
                    const player = item.player;
                    const teamColors = getTeamColors(player.pos, isHome);
                    return (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold text-white flex-shrink-0 shadow-md"
                          style={{
                            backgroundColor: teamColors.primary,
                            color: teamColors.number,
                            border: `2px solid ${teamColors.border}`,
                          }}
                        >
                          {player.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-semibold truncate">
                            {player.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            #{player.number}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Defenders */}
            {positionGroups.DEF.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h5 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Defenders ({positionGroups.DEF.length})
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                  {positionGroups.DEF.map((item) => {
                    const player = item.player;
                    const teamColors = getTeamColors(player.pos, isHome);
                    return (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold text-white flex-shrink-0 shadow-md"
                          style={{
                            backgroundColor: teamColors.primary,
                            color: teamColors.number,
                            border: `2px solid ${teamColors.border}`,
                          }}
                        >
                          {player.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-semibold truncate">
                            {player.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            #{player.number}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Midfielders */}
            {positionGroups.MID.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h5 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Midfielders ({positionGroups.MID.length})
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                  {positionGroups.MID.map((item) => {
                    const player = item.player;
                    const teamColors = getTeamColors(player.pos, isHome);
                    return (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold text-white flex-shrink-0 shadow-md"
                          style={{
                            backgroundColor: teamColors.primary,
                            color: teamColors.number,
                            border: `2px solid ${teamColors.border}`,
                          }}
                        >
                          {player.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-semibold truncate">
                            {player.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            #{player.number}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Forwards */}
            {positionGroups.FWD.length > 0 && (
              <div className="space-y-2 md:space-y-3">
                <h5 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Forwards ({positionGroups.FWD.length})
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                  {positionGroups.FWD.map((item) => {
                    const player = item.player;
                    const teamColors = getTeamColors(player.pos, isHome);
                    return (
                      <div
                        key={player.id}
                        className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold text-white flex-shrink-0 shadow-md"
                          style={{
                            backgroundColor: teamColors.primary,
                            color: teamColors.number,
                            border: `2px solid ${teamColors.border}`,
                          }}
                        >
                          {player.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-semibold truncate">
                            {player.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-muted-foreground">
                            #{player.number}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Substitutes */}
        {lineup.substitutes && lineup.substitutes.length > 0 && (
          <div className="space-y-3 md:space-y-4 ">
            <div className="flex items-center gap-2">
              <h4 className="text-sm md:text-base lg:text-lg font-bold text-foreground">
                Substitutes
              </h4>
              <span className="text-xs md:text-sm text-muted-foreground">
                ({lineup.substitutes.length})
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {lineup.substitutes.map((item) => {
                const player = item.player;
                const teamColors = getTeamColors(player.pos, isHome);

                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 p-2 md:p-2.5 bg-muted/20 rounded-lg border border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-[10px] md:text-xs font-bold text-white flex-shrink-0 shadow-sm"
                      style={{
                        backgroundColor: teamColors.primary,
                        color: teamColors.number,
                        border: `2px solid ${teamColors.border}`,
                        opacity: 0.7,
                      }}
                    >
                      {player.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs lg:text-sm font-medium truncate">
                        {player.name}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-muted-foreground">
                        {getPositionLabel(player.pos)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CombinedFormationFieldProps {
  homeLineup: LineupResponseItem;
  awayLineup: LineupResponseItem;
}

function CombinedFormationField({
  homeLineup,
  awayLineup,
}: CombinedFormationFieldProps) {
  // Parse grid coordinates for both teams
  const parsePlayers = (lineup: LineupResponseItem) => {
    return lineup.startXI
      .filter((item) => item.player.grid !== null)
      .map((item) => {
        const grid = item.player.grid!.split(":").map(Number);
        return {
          ...item.player,
          row: grid[0],
          col: grid[1],
        };
      });
  };

  const homePlayers = parsePlayers(homeLineup);
  const awayPlayers = parsePlayers(awayLineup);

  if (homePlayers.length === 0 && awayPlayers.length === 0) {
    return null;
  }

  // Normalize positions based on formation pattern (horizontal layout)
  const normalizePlayer = (
    player: (typeof homePlayers)[0],
    lineup: LineupResponseItem,
    isHome: boolean
  ) => {
    const normalizedRow = Math.min(player.row - 1, 4);

    // Group players by row to position them according to formation
    const playersInRow = (isHome ? homePlayers : awayPlayers).filter(
      (p) => Math.min(p.row - 1, 4) === normalizedRow
    );

    // Sort players in row by column to maintain order
    const sortedPlayersInRow = [...playersInRow].sort((a, b) => a.col - b.col);
    const totalInRow = sortedPlayersInRow.length;

    // For horizontal formation layout:
    // - Row position determines left/right position (horizontal)
    // - Column position determines top/bottom position (vertical)

    // Horizontal position: row determines left-right position
    // Row 0 (GK) at left edge, Row 4 (ST) at right edge
    let leftPercent: number;
    if (isHome) {
      // Home team: left side, rows go from left (GK) to right (ST)
      leftPercent = 5 + (normalizedRow / 4) * 40; // 5% to 45%
    } else {
      // Away team: right side, rows go from right (GK) to left (ST), mirrored
      leftPercent = 55 + (1 - normalizedRow / 4) * 40; // 55% to 95%
    }

    // Vertical position: column determines top-bottom position
    // Distribute players vertically within their row based on column
    const verticalOffset = -3; // Offset to move all players lower
    let topPercent: number;
    if (totalInRow === 1) {
      // Single player - center vertically, then shift lower
      topPercent = 50 + verticalOffset;
    } else {
      // Multiple players - distribute vertically based on column position
      const minCol = Math.min(...sortedPlayersInRow.map((p) => p.col));
      const maxCol = Math.max(...sortedPlayersInRow.map((p) => p.col));
      const colRange = maxCol - minCol;
      const normalizedCol =
        colRange > 0 ? (player.col - minCol) / colRange : 0.5; // If all same col, center

      // Adjust range based on number of players
      // 2-3 players: wider spacing (25% to 75% = 50% range) for bigger margin
      // 4+ players: full range (15% to 85% = 70% range)
      if (totalInRow <= 3) {
        // 2-3 players: use wider range for bigger margin between players
        topPercent = 25 + normalizedCol * 50 + verticalOffset; // 25% to 75%, shifted lower
      } else {
        // 4+ players: use full range
        topPercent = 15 + normalizedCol * 70 + verticalOffset; // 15% to 85%, shifted lower
      }
    }

    return {
      ...player,
      normalizedRow,
      topPercent,
      leftPercent,
    };
  };

  const normalizedHomePlayers = homePlayers.map((p) =>
    normalizePlayer(p, homeLineup, true)
  );
  const normalizedAwayPlayers = awayPlayers.map((p) =>
    normalizePlayer(p, awayLineup, false)
  );

  return (
    <div className="px-2 pb-0 md:px-8 lg:px-16  space-y-2 ">
      <div className="flex items-center justify-between mb-2 md:mb-4 gap-2">
        <div className="flex items-center gap-1.5 md:gap-3 flex-1 min-w-0">
          {homeLineup.team.logo && (
            <Image
              src={homeLineup.team.logo}
              alt={homeLineup.team.name}
              width={32}
              height={32}
              className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 object-contain flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs lg:text-sm font-semibold truncate">
              {homeLineup.team.name}
            </p>
            <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground">
              {homeLineup.formation}
            </p>
          </div>
        </div>
        <div className="text-center px-1 flex-shrink-0">
          <p className="text-[10px] md:text-xs lg:text-sm font-semibold text-muted-foreground">
            VS
          </p>
        </div>
        <div className="flex items-center gap-1.5 md:gap-3 flex-1 min-w-0 justify-end">
          <div className="text-right min-w-0">
            <p className="text-[10px] md:text-xs lg:text-sm font-semibold truncate">
              {awayLineup.team.name}
            </p>
            <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground">
              {awayLineup.formation}
            </p>
          </div>
          {awayLineup.team.logo && (
            <Image
              src={awayLineup.team.logo}
              alt={awayLineup.team.name}
              width={32}
              height={32}
              className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 object-contain flex-shrink-0"
            />
          )}
        </div>
      </div>

      <div className="relative w-full  aspect-[2/1] bg-gradient-to-b from-green-700 to-green-800 rounded-sm overflow-hidden shadow-lg">
        {/* Realistic grass pattern - alternating dark and normal vertical stripes */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              rgba(15, 60, 30, 0.4) 0px,
              rgba(15, 60, 30, 0.4) 80px,
              rgba(20, 100, 50, 0.2) 80px,
              rgba(20, 100, 50, 0.2) 160px
            )`,
          }}
        />
        {/* Field markings */}
        {/* Center circle */}
        <div className="absolute  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/2 rounded-full border-2 border-white/30"></div>
        {/* Center line (vertical) */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30"></div>
        {/* Penalty boxes - left (home team) */}
        <div className="absolute  top-0 bottom-0 left-0 w-1/4 border-r-2 border-white/30">
          <div className="absolute top-1/4 bottom-1/4 right-0 w-1/2 border-2 border-white/30 rounded-r-lg"></div>
        </div>
        {/* Penalty boxes - right (away team) */}
        <div className="absolute top-0 bottom-0 right-0 w-1/4 border-l-2 border-white/30">
          <div className="absolute top-1/4 bottom-1/4 left-0 w-1/2 border-2 border-white/30 rounded-l-lg"></div>
        </div>
        {/* Goal areas - left */}
        <div className="absolute  top-[35%] bottom-[35%] left-0 w-1/6 border-r-2 border-white/30"></div>
        {/* Goal areas - right */}
        <div className="absolute  top-[35%] bottom-[35%] right-0 w-1/6 border-l-2 border-white/30"></div>

        {/* Home team players (left side) */}
        {normalizedHomePlayers.map((player) => {
          const teamColors = getTeamColors(player.pos, true);
          return (
            <div
              key={`home-${player.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${player.leftPercent}%`,
                top: `${100 - player.topPercent}%`, // Invert: row 0 at bottom, row 4 at top
              }}
            >
              <div className="flex flex-col items-center gap-0.5 group">
                <div className="relative transition-transform group-hover:scale-110">
                  <Shirt
                    className="w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11"
                    style={{
                      fill: teamColors.primary,
                      stroke: teamColors.border,
                      strokeWidth: 1,
                    }}
                  />
                  <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] md:text-xs lg:text-sm font-bold"
                    style={{
                      color: teamColors.number,
                    }}
                  >
                    {player.number}
                  </span>
                </div>
                <div className="bg-black/70 text-white text-xs md:text-sm px-1  rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {player.name.split(" ").pop()}
                </div>
              </div>
            </div>
          );
        })}

        {/* Away team players (right side, mirrored) */}
        {normalizedAwayPlayers.map((player) => {
          const teamColors = getTeamColors(player.pos, false);
          return (
            <div
              key={`away-${player.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${player.leftPercent}%`,
                top: `${100 - player.topPercent}%`, // Invert: row 0 at bottom, row 4 at top
              }}
            >
              <div className="flex flex-col items-center gap-0.5 group">
                <div className="relative transition-transform group-hover:scale-110">
                  <Shirt
                    className="w-7 h-7 md:w-9 md:h-9 lg:w-11 lg:h-11"
                    style={{
                      fill: teamColors.primary,
                      stroke: teamColors.border,
                      strokeWidth: 1,
                    }}
                  />
                  <span
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] md:text-xs lg:text-sm font-bold"
                    style={{
                      color: teamColors.number,
                    }}
                  >
                    {player.number}
                  </span>
                </div>
                <div className="bg-black/60 text-white text-xs  md:text-sm  px-1 md:px-1.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {player.name.split(" ").pop()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
