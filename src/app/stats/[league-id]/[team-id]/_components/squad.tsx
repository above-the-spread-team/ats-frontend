"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";
import type { SquadsApiResponse, SquadPlayer } from "@/type/squads";

interface SquadProps {
  teamId: string;
}

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

export default function Squad({ teamId }: SquadProps) {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");
  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : new Date().getFullYear();

  const [squad, setSquad] = useState<SquadsApiResponse["response"][0] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchSquad = async () => {
      if (!teamId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/squads?team=${teamId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load squad (${response.status})`);
        }

        const data = (await response.json()) as SquadsApiResponse;

        if (data.response && data.response.length > 0) {
          setSquad(data.response[0]);
        } else {
          setSquad(null);
        }

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setSquad(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchSquad();

    return () => {
      controller.abort();
    };
  }, [teamId]);

  const playersByPosition = useMemo(() => {
    if (!squad?.players) return {};

    const grouped: Record<string, SquadPlayer[]> = {};

    squad.players.forEach((player) => {
      const position = player.position || "Other";
      if (!grouped[position]) {
        grouped[position] = [];
      }
      grouped[position].push(player);
    });

    // Sort positions by predefined order
    const sorted: Record<string, SquadPlayer[]> = {};
    POSITION_ORDER.forEach((pos) => {
      if (grouped[pos]) {
        sorted[pos] = grouped[pos].sort((a, b) => {
          // Sort by number if available, otherwise by name
          if (a.number !== null && b.number !== null) {
            return a.number - b.number;
          }
          if (a.number !== null) return -1;
          if (b.number !== null) return 1;
          return a.name.localeCompare(b.name);
        });
      }
    });

    // Add any other positions not in the predefined order
    Object.keys(grouped).forEach((pos) => {
      if (!POSITION_ORDER.includes(pos)) {
        sorted[pos] = grouped[pos].sort((a, b) => a.name.localeCompare(b.name));
      }
    });

    return sorted;
  }, [squad]);

  if (isLoading) {
    return (
      <FullPage>
        <Loading />
      </FullPage>
    );
  }

  if (error || !squad) {
    return (
      <FullPage>
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">
            {error || "No squad data available"}
          </p>
        </div>
      </FullPage>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="flex items-center gap-4">
        {squad.team.logo && (
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image
              src={squad.team.logo}
              alt={squad.team.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 64px, 80px"
            />
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            {squad.team.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {squad.players.length} players
          </p>
        </div>
      </div>

      {/* Players by Position */}
      {Object.entries(playersByPosition).map(([position, players]) => (
        <div
          key={position}
          className="bg-card border border-border rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">
            {position} ({players.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/stats/player/${player.id}?season=${season}`}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                {player.photo && (
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <Image
                      src={player.photo}
                      alt={player.name}
                      fill
                      className="object-cover rounded-full"
                      sizes="48px"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {player.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {player.number !== null && (
                      <span className="font-medium">#{player.number}</span>
                    )}
                    <span>•</span>
                    <span>{player.age} years</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
