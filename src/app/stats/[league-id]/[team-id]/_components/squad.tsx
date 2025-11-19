"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import IconBg from "@/components/common/icon-bg";
import FullPage from "@/components/common/full-page";
import type { SquadsApiResponse, SquadPlayer } from "@/type/squads";

interface SquadProps {
  teamId: string;
}

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

// Component to handle player image errors gracefully
function PlayerImage({
  src,
  alt,
  playerName,
}: {
  src: string;
  alt: string;
  playerName: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 bg-muted rounded-full flex items-center justify-center border border-border/50">
        <span className="text-[10px] md:text-xs font-bold text-foreground/70">
          {playerName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="rounded-full object-cover border border-border/50"
        sizes="(max-width: 768px) 48px, 56px"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

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
      <div className="space-y-4 md:space-y-6">
        {/* Team Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 md:w-64" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Position Sections Skeleton */}
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-3 md:p-4"
          >
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
              {Array.from({ length: 5 }).map((_, playerIdx) => (
                <Skeleton key={playerIdx} className="h-16 md:h-20 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
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
    <div className="space-y-4 md:space-y-6 px-1 md:px-0">
      {/* Players by Position */}
      {Object.entries(playersByPosition).map(([position, players]) => (
        <div key={position} className="">
          <h3 className="text-sm md:text-base font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2">
            <span>{position}</span>
            <span className="text-xs md:text-sm font-normal text-muted-foreground">
              ({players.length})
            </span>
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5  md:grid-cols-6 lg:grid-cols-7  gap-2 md:gap-3">
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/stats/player/${player.id}?season=${season}`}
                className="flex flex-col items-center gap-2 py-2 bg-card  rounded-2xl transition-all duration-300 group hover:shadow-lg hover:-translate-y-0 hover:border-primary/40 hover:bg-gradient-to-br hover:from-card hover:to-card/95"
              >
                <PlayerImage
                  src={player.photo}
                  alt={player.name}
                  playerName={player.name}
                />
                <div className="w-full text-center space-y-1">
                  <p className="text-[11px] md:text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                    {player.name}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] text-muted-foreground">
                    {player.number !== null && (
                      <>
                        <span className="font-medium bg-muted/60 px-1.5 py-0.5 rounded group-hover:bg-primary/20 group-hover:text-primary transition-colors duration-300">
                          #{player.number}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    <span className="group-hover:text-foreground transition-colors duration-300">
                      {player.age} yrs
                    </span>
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
