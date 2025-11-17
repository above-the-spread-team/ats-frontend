"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import FullPage from "@/components/common/full-page";
import Loading from "@/components/common/loading";
import type { PlayerStatisticsApiResponse } from "@/type/player-statistics";

export default function PlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const playerId = params["player-id"] as string;

  const seasonParam = searchParams.get("season");
  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : new Date().getFullYear();

  const [playerData, setPlayerData] = useState<
    PlayerStatisticsApiResponse["response"][0] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPlayerStatistics = async () => {
      if (!playerId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/player-statistics?id=${playerId}&season=${season}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load player statistics (${response.status})`
          );
        }

        const data = (await response.json()) as PlayerStatisticsApiResponse;

        if (data.response && data.response.length > 0) {
          setPlayerData(data.response[0]);
        } else {
          setPlayerData(null);
        }

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setPlayerData(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPlayerStatistics();

    return () => {
      controller.abort();
    };
  }, [playerId, season]);

  if (isLoading) {
    return (
      <FullPage>
        <Loading />
      </FullPage>
    );
  }

  if (error || !playerData) {
    return (
      <FullPage>
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">
            {error || "No player data available"}
          </p>
        </div>
      </FullPage>
    );
  }

  const { player, statistics } = playerData;

  return (
    <div className="container mx-auto space-y-6 px-4 md:px-6 py-4">
      {/* Player Header */}
      <div className="flex items-center gap-4">
        {player.photo && (
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <Image
              src={player.photo}
              alt={player.name}
              fill
              className="object-cover rounded-full"
              sizes="(max-width: 768px) 80px, 96px"
            />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {player.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">
              {player.nationality}
            </span>
            {player.age && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {player.age} years old
                </span>
              </>
            )}
            {statistics.length > 0 && statistics[0].games.position && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {statistics[0].games.position}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Statistics ({season})
          </h2>
          {statistics.map((stat, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-lg p-4 md:p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                {stat.team.logo && (
                  <div className="relative w-12 h-12">
                    <Image
                      src={stat.team.logo}
                      alt={stat.team.name}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">
                    {stat.team.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {stat.league.name} ({stat.league.country})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Appearances</p>
                  <p className="text-xl font-bold text-foreground">
                    {stat.games.appearences}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {stat.goals.total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assists</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {stat.goals.assists}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-xl font-bold text-foreground">
                    {parseFloat(stat.games.rating).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
