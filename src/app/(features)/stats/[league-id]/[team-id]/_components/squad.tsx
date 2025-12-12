"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import FullPage from "@/components/common/full-page";
import NoDate from "@/components/common/no-date";
import { Users, Calendar } from "lucide-react";
import type { SquadsApiResponse, SquadPlayer } from "@/type/footballapi/squads";

interface SquadProps {
  teamId: string;
  leagueId: string;
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

export default function Squad({ teamId, leagueId }: SquadProps) {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");
  const currentYear = new Date().getFullYear();
  const season = seasonParam ? parseInt(seasonParam, 10) : currentYear;

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
      <div className="space-y-5 md:space-y-6 px-1 md:px-0">
        {/* Total Players and Season Skeleton */}
        <div className="flex items-center justify-between px-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 md:w-7 md:h-7 rounded-md" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 md:h-5 w-24 md:w-28" />
              <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 md:w-7 md:h-7 rounded-md" />
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-4 md:h-5 w-20 md:w-24" />
              <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
            </div>
          </div>
        </div>

        {/* Position Sections Skeleton */}
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-border/50">
              <Skeleton className="h-5 md:h-6 w-32" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 md:gap-3">
              {Array.from({ length: 6 }).map((_, playerIdx) => (
                <div
                  key={playerIdx}
                  className="flex flex-col items-center gap-2 py-1 md:py-2 px-2 bg-card rounded-xl"
                >
                  <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full" />
                  <div className="w-full text-center space-y-1.5">
                    <Skeleton className="h-3.5 md:h-4 w-16 mx-auto" />
                    <Skeleton className="h-3 md:h-3.5 w-12 mx-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !squad) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message={error || "No squad data available"}
          helpText="Squad information may not be available for this team or season."
        />
      </FullPage>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6 px-1 md:px-0">
      {/* Total Players and Season */}
      <div className="flex items-center justify-between px-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Users className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm font-semibold text-foreground">
              {squad.players.length}{" "}
              {squad.players.length === 1 ? "player" : "players"}
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground">
              Total squad members
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-primary" />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs md:text-sm font-semibold text-foreground">
              Season {currentYear}
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground">
              Current season
            </span>
          </div>
        </div>
      </div>

      {/* Players by Position */}
      {Object.entries(playersByPosition).map(([position, players]) => (
        <div key={position} className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-border/50">
            <h3 className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">
              <span>{position}</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs md:text-sm font-semibold">
                {players.length}
              </span>
            </h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2 md:gap-3">
            {players.map((player) => (
              <Link
                key={player.id}
                href={`/stats/player/${player.id}?season=${season}&teamId=${teamId}&leagueId=${leagueId}`}
                className="flex flex-col items-center gap-2 py-1 md:py-2 px-2 bg-gradient-to-br from-card to-card/90 border border-border/50 rounded-xl shadow-sm transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 hover:border-primary/50 hover:bg-gradient-to-br hover:from-card hover:via-card/98 hover:to-card/95"
              >
                <div className="transition-transform duration-300 group-hover:scale-105">
                  <PlayerImage
                    src={player.photo}
                    alt={player.name}
                    playerName={player.name}
                  />
                </div>
                <div className="w-full text-center space-y-1.5">
                  <p className="text-[11px] md:text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                    {player.name}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] text-muted-foreground">
                    {player.number !== null && (
                      <>
                        <span className="font-medium bg-gradient-to-br from-muted/80 to-muted/60 px-2 py-0.5 rounded-md border border-border/30 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-all duration-300">
                          #{player.number}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
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
