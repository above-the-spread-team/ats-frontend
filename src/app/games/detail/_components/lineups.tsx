"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Shirt } from "lucide-react";
import type { LineupsApiResponse, LineupResponseItem } from "@/type/lineups";
import Loading from "@/components/common/loading";

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
    <div className="bg-card rounded-lg border border-border/50 p-2 md:p-4 lg:p-6 space-y-2 md:space-y-4">
      {/* Team Header */}
      <div className="flex items-center justify-between pb-2 md:pb-3 border-b border-border/50 gap-2">
        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          {lineup.team.logo && (
            <Image
              src={lineup.team.logo}
              alt={lineup.team.name}
              width={40}
              height={40}
              className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <h3 className="text-sm md:text-base lg:text-lg font-bold truncate">
              {lineup.team.name}
            </h3>
          </div>
        </div>
        {lineup.coach && (
          <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
            {lineup.coach.photo && (
              <Image
                src={lineup.coach.photo}
                alt={lineup.coach.name}
                width={32}
                height={32}
                className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 rounded-full object-cover flex-shrink-0"
              />
            )}
            <div className="text-right hidden sm:block">
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Coach
              </p>
              <p className="text-[10px] md:text-xs lg:text-sm font-semibold truncate max-w-[80px] md:max-w-none">
                {lineup.coach.name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Start XI */}
      <div className="space-y-2 md:space-y-3">
        <h4 className="text-xs md:text-sm lg:text-base font-semibold text-foreground">
          Starting XI
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 md:gap-2 lg:gap-3">
          {lineup.startXI.map((item) => {
            const player = item.player;
            const teamColors = getTeamColors(player.pos, isHome);

            return (
              <div
                key={player.id}
                className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-muted/30 rounded-md border border-border/50"
              >
                <div
                  className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full text-[10px] md:text-xs font-bold text-white flex-shrink-0"
                  style={{
                    backgroundColor: teamColors.primary,
                    color: teamColors.number,
                    border: `2px solid ${teamColors.border}`,
                  }}
                >
                  {player.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs lg:text-sm font-semibold truncate">
                    {player.name}
                  </p>
                  <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground">
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
        <div className="space-y-2 md:space-y-3">
          <h4 className="text-xs md:text-sm lg:text-base font-semibold text-foreground">
            Substitutes ({lineup.substitutes.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 md:gap-2 lg:gap-3">
            {lineup.substitutes.map((item) => {
              const player = item.player;
              const teamColors = getTeamColors(player.pos, isHome);

              return (
                <div
                  key={player.id}
                  className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-muted/20 rounded-md border border-border/30"
                >
                  <div
                    className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full text-[10px] md:text-xs font-bold text-white flex-shrink-0"
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
                    <p className="text-[9px] md:text-[10px] lg:text-xs text-muted-foreground">
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
    <div className="bg-card rounded-xl p-2 md:p-4 lg:p-6 space-y-2 md:space-y-4">
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

      <div className="relative w-full  aspect-[2/1] bg-gradient-to-b from-green-600 to-green-700 rounded-sm overflow-hidden shadow-lg">
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
              <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
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
              <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
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
                <div className="bg-black/70 text-white text-xs  md:text-sm  px-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
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
