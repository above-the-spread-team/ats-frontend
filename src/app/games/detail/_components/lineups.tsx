"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { LineupsApiResponse, LineupResponseItem } from "@/type/lineups";
import Loading from "@/components/common/loading";

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
      <div className="flex justify-center items-center py-12">
        <Loading />
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
  return (
    <div className="bg-card rounded-lg border border-border/50 p-4 md:p-6 space-y-4">
      {/* Team Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          {lineup.team.logo && (
            <Image
              src={lineup.team.logo}
              alt={lineup.team.name}
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10 object-contain"
            />
          )}
          <div>
            <h3 className="text-base md:text-lg font-bold">
              {lineup.team.name}
            </h3>
          </div>
        </div>
        {lineup.coach && (
          <div className="flex items-center gap-2">
            {lineup.coach.photo && (
              <Image
                src={lineup.coach.photo}
                alt={lineup.coach.name}
                width={32}
                height={32}
                className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover"
              />
            )}
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Coach</p>
              <p className="text-xs md:text-sm font-semibold">
                {lineup.coach.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Start XI */}
      <div className="space-y-3">
        <h4 className="text-sm md:text-base font-semibold text-foreground">
          Starting XI
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {lineup.startXI.map((item) => {
            const player = item.player;
            const isGoalkeeper = player.pos === "G";

            return (
              <div
                key={player.id}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border border-border/50"
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
                  style={{
                    backgroundColor: isGoalkeeper
                      ? `#${lineup.team.colors.goalkeeper.primary}`
                      : `#${lineup.team.colors.player.primary}`,
                    color: isGoalkeeper
                      ? `#${lineup.team.colors.goalkeeper.number}`
                      : `#${lineup.team.colors.player.number}`,
                    border: `2px solid ${
                      isGoalkeeper
                        ? `#${lineup.team.colors.goalkeeper.border}`
                        : `#${lineup.team.colors.player.border}`
                    }`,
                  }}
                >
                  {player.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold truncate">
                    {player.name}
                  </p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">
                    {getPositionLabel(player.pos)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitutes */}
      {lineup.substitutes && lineup.substitutes.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm md:text-base font-semibold text-foreground">
            Substitutes ({lineup.substitutes.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
            {lineup.substitutes.map((item) => {
              const player = item.player;
              const isGoalkeeper = player.pos === "G";

              return (
                <div
                  key={player.id}
                  className="flex items-center gap-2 p-2 bg-muted/20 rounded-md border border-border/30"
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
                    style={{
                      backgroundColor: isGoalkeeper
                        ? `#${lineup.team.colors.goalkeeper.primary}`
                        : `#${lineup.team.colors.player.primary}`,
                      color: isGoalkeeper
                        ? `#${lineup.team.colors.goalkeeper.number}`
                        : `#${lineup.team.colors.player.number}`,
                      border: `2px solid ${
                        isGoalkeeper
                          ? `#${lineup.team.colors.goalkeeper.border}`
                          : `#${lineup.team.colors.player.border}`
                      }`,
                      opacity: 0.7,
                    }}
                  >
                    {player.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate">
                      {player.name}
                    </p>
                    <p className="text-[10px] md:text-xs text-muted-foreground">
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

  // Find max row and col for normalization
  const allPlayers = [...homePlayers, ...awayPlayers];
  const maxRow = Math.max(...allPlayers.map((p) => p.row));
  const maxCol = Math.max(...allPlayers.map((p) => p.col));

  // Parse formation string (e.g., "4-2-3-1" -> [4, 2, 3, 1])
  const parseFormation = (formation: string | null): number[] => {
    if (!formation) return [];
    return formation
      .split("-")
      .map(Number)
      .filter((n) => !isNaN(n));
  };

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
    const playerIndex = sortedPlayersInRow.findIndex((p) => p.id === player.id);
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
    let topPercent: number;
    if (totalInRow === 1) {
      // Single player - center vertically
      topPercent = 50;
    } else {
      // Multiple players - distribute vertically based on column position
      const minCol = Math.min(...sortedPlayersInRow.map((p) => p.col));
      const maxCol = Math.max(...sortedPlayersInRow.map((p) => p.col));
      const colRange = maxCol - minCol;
      const normalizedCol =
        colRange > 0 ? (player.col - minCol) / colRange : 0.5; // If all same col, center

      // Add padding: 15% to 85% range
      topPercent = 15 + normalizedCol * 70;
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

  const isGoalkeeper = (pos: string) => pos === "G";

  return (
    <div className="bg-card rounded-lg border border-border/50 p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {homeLineup.team.logo && (
            <Image
              src={homeLineup.team.logo}
              alt={homeLineup.team.name}
              width={32}
              height={32}
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
            />
          )}
          <div>
            <p className="text-xs md:text-sm font-semibold">
              {homeLineup.team.name}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              {homeLineup.formation}
            </p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs md:text-sm font-semibold text-muted-foreground">
            VS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs md:text-sm font-semibold">
              {awayLineup.team.name}
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              {awayLineup.formation}
            </p>
          </div>
          {awayLineup.team.logo && (
            <Image
              src={awayLineup.team.logo}
              alt={awayLineup.team.name}
              width={32}
              height={32}
              className="w-6 h-6 md:w-8 md:h-8 object-contain"
            />
          )}
        </div>
      </div>

      <div className="relative w-full  aspect-[2/1] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden border-2 border-green-800 shadow-lg">
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
        <div className="absolute top-[35%] bottom-[35%] right-0 w-1/6 border-l-2 border-white/30"></div>

        {/* Home team players (left side) */}
        {normalizedHomePlayers.map((player) => {
          const isGK = isGoalkeeper(player.pos);

          return (
            <div
              key={`home-${player.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${player.leftPercent}%`,
                top: `${100 - player.topPercent}%`, // Invert: row 0 at bottom, row 4 at top
              }}
            >
              <div
                className="flex flex-col items-center gap-0.5 cursor-pointer group"
                title={player.name}
              >
                <div
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white shadow-lg border-2 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: isGK
                      ? `#${homeLineup.team.colors.goalkeeper.primary}`
                      : `#${homeLineup.team.colors.player.primary}`,
                    color: isGK
                      ? `#${homeLineup.team.colors.goalkeeper.number}`
                      : `#${homeLineup.team.colors.player.number}`,
                    borderColor: isGK
                      ? `#${homeLineup.team.colors.goalkeeper.border}`
                      : `#${homeLineup.team.colors.player.border}`,
                  }}
                >
                  {player.number}
                </div>
                <div className="bg-black/70 text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                  {player.name.split(" ").pop()}
                </div>
              </div>
            </div>
          );
        })}

        {/* Away team players (right side, mirrored) */}
        {normalizedAwayPlayers.map((player) => {
          const isGK = isGoalkeeper(player.pos);

          return (
            <div
              key={`away-${player.id}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${player.leftPercent}%`,
                top: `${100 - player.topPercent}%`, // Invert: row 0 at bottom, row 4 at top
              }}
            >
              <div
                className="flex flex-col items-center gap-0.5 cursor-pointer group"
                title={player.name}
              >
                <div
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white shadow-lg border-2 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: isGK
                      ? `#${awayLineup.team.colors.goalkeeper.primary}`
                      : `#${awayLineup.team.colors.player.primary}`,
                    color: isGK
                      ? `#${awayLineup.team.colors.goalkeeper.number}`
                      : `#${awayLineup.team.colors.player.number}`,
                    borderColor: isGK
                      ? `#${awayLineup.team.colors.goalkeeper.border}`
                      : `#${awayLineup.team.colors.player.border}`,
                  }}
                >
                  {player.number}
                </div>
                <div className="bg-black/70 text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
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

interface FormationFieldProps {
  lineup: LineupResponseItem;
}

function FormationField({ lineup }: FormationFieldProps) {
  // Parse grid coordinates and create player positions
  const playersWithGrid = lineup.startXI
    .filter((item) => item.player.grid !== null)
    .map((item) => {
      const grid = item.player.grid!.split(":").map(Number);
      return {
        ...item.player,
        row: grid[0],
        col: grid[1],
      };
    });

  if (playersWithGrid.length === 0) {
    return null;
  }

  // Find max row and col to determine field dimensions
  const maxRow = Math.max(...playersWithGrid.map((p) => p.row));
  const maxCol = Math.max(...playersWithGrid.map((p) => p.col));

  // Normalize positions to fit in a 5-row field (GK, DEF, MID, FWD, ST)
  // Map rows: 1 -> 0 (GK), 2 -> 1 (DEF), 3 -> 2 (MID), 4 -> 3 (FWD), 5 -> 4 (ST)
  const normalizedPlayers = playersWithGrid.map((player) => {
    // Normalize row (1-5 scale to 0-4 for 5 rows)
    const normalizedRow = Math.min(player.row - 1, 4);
    // Normalize col (1-maxCol scale to 0-10 for 11 columns)
    const normalizedCol = Math.round(((player.col - 1) / (maxCol - 1)) * 10);
    return {
      ...player,
      normalizedRow,
      normalizedCol,
    };
  });

  const isGoalkeeper = (pos: string) => pos === "G";

  return (
    <div className="space-y-3">
      <h4 className="text-sm md:text-base font-semibold text-foreground">
        Formation: {lineup.formation}
      </h4>
      <div className="relative w-full aspect-[3/2] bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden border-2 border-green-800 shadow-lg">
        {/* Field markings */}
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full border-2 border-white/30"></div>
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30"></div>
        {/* Penalty boxes */}
        <div className="absolute top-0 left-0 right-0 h-1/4 border-b-2 border-white/30">
          <div className="absolute bottom-0 left-1/4 right-1/4 h-1/2 border-2 border-white/30 rounded-t-lg"></div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1/4 border-t-2 border-white/30">
          <div className="absolute top-0 left-1/4 right-1/4 h-1/2 border-2 border-white/30 rounded-b-lg"></div>
        </div>
        {/* Goal areas */}
        <div className="absolute top-0 left-[35%] right-[35%] h-1/6 border-b-2 border-white/30"></div>
        <div className="absolute bottom-0 left-[35%] right-[35%] h-1/6 border-t-2 border-white/30"></div>

        {/* Players positioned on field */}
        {normalizedPlayers.map((player) => {
          const isGK = isGoalkeeper(player.pos);
          // Position: left is 0%, right is 100%
          // For home team (isHome), we show from bottom to top
          // For away team, we show from top to bottom
          const leftPercent = (player.normalizedCol / 10) * 100;
          // Invert rows: row 0 (GK) at bottom, row 4 (ST) at top
          const bottomPercent = (player.normalizedRow / 4) * 100;

          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 translate-y-1/2"
              style={{
                left: `${leftPercent}%`,
                bottom: `${bottomPercent}%`,
              }}
            >
              <div
                className="flex flex-col items-center gap-0.5 cursor-pointer group"
                title={player.name}
              >
                <div
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold text-white shadow-lg border-2 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: isGK
                      ? `#${lineup.team.colors.goalkeeper.primary}`
                      : `#${lineup.team.colors.player.primary}`,
                    color: isGK
                      ? `#${lineup.team.colors.goalkeeper.number}`
                      : `#${lineup.team.colors.player.number}`,
                    borderColor: isGK
                      ? `#${lineup.team.colors.goalkeeper.border}`
                      : `#${lineup.team.colors.player.border}`,
                  }}
                >
                  {player.number}
                </div>
                <div className="bg-black/70 text-white text-[8px] md:text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
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
