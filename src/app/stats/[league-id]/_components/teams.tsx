"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import FullPage from "@/components/common/full-page";
import type { TeamsApiResponse, TeamResponseItem } from "@/type/teams-info";

// Component to handle image errors gracefully
function TeamLogoImage({
  src,
  alt,
  teamName,
}: {
  src: string;
  alt: string;
  teamName: string;
}) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 rounded-xl flex items-center justify-center shadow-inner">
        <span className="text-[10px] md:text-xs font-bold text-foreground/70">
          {teamName.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl shadow-inner">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 40px, 48px"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

interface TeamsProps {
  leagueId: string;
  season: number;
}

export default function Teams({ leagueId, season }: TeamsProps) {
  const [teams, setTeams] = useState<TeamResponseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTeams = async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/teams-info?league=${leagueId}&season=${season}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load teams (${response.status})`);
        }

        const data = (await response.json()) as TeamsApiResponse;

        setTeams(data.response ?? []);
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setTeams([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchTeams();

    return () => {
      controller.abort();
    };
  }, [leagueId, season]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => a.team.name.localeCompare(b.team.name));
  }, [teams]);

  // Loading skeleton
  if (isLoading) {
    return (
      <FullPage>
        <div className="space-y-4 px-4 md:px-0">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 15 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-card/50 backdrop-blur-sm rounded-xl p-2 md:p-3 shadow-sm border border-border/50 h-full flex flex-col"
              >
                <div className="relative flex flex-col items-center text-center space-y-2.5 md:space-y-3 flex-1">
                  {/* Logo Skeleton */}
                  <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                    <Skeleton className="w-full h-full rounded-xl" />
                  </div>

                  {/* Name Skeleton */}
                  <div className="w-full space-y-0.5">
                    <Skeleton className="h-3 md:h-3.5 w-3/4 mx-auto rounded-lg" />
                    <Skeleton className="h-3 w-1/2 mx-auto rounded-lg" />
                  </div>

                  {/* Info Skeleton */}
                  <div className="w-full space-y-1.5">
                    <Skeleton className="h-3 w-2/3 mx-auto rounded-lg" />
                    <Skeleton className="h-3 w-16 mx-auto rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FullPage>
    );
  }

  if (error) {
    return (
      <FullPage>
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold text-destructive">{error}</p>
        </div>
      </FullPage>
    );
  }

  if (sortedTeams.length === 0) {
    return (
      <FullPage>
        <div className="text-center">
          <p className="text-lg font-semibold text-muted-foreground">
            No teams found for this league and season
          </p>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage>
      <div className="space-y-4 px-4 md:px-0">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4">
          {sortedTeams.map((item) => {
            const CardContent = (
              <div className="group relative bg-card/50 backdrop-blur-sm rounded-xl p-2 md:p-3 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full flex flex-col border border-border/50 hover:border-primary/30 overflow-hidden">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-primary/5 transition-all duration-300 rounded-xl" />

                <div className="relative flex flex-col items-center justify-between text-center space-y-2.5 md:space-y-3 flex-1 z-10">
                  {/* Team Logo */}
                  <div className="relative w-8 h-8 md:w-10 md:h-10 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {item.team.logo ? (
                      <TeamLogoImage
                        src={item.team.logo}
                        alt={item.team.name}
                        teamName={item.team.name}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted/80 rounded-xl flex items-center justify-center shadow-inner">
                        <span className="text-[10px] md:text-xs font-bold text-foreground/70">
                          {item.team.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Team Name */}
                  <div className="w-full space-y-0.5">
                    <h3 className="text-xs md:text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {item.team.name}
                    </h3>
                    {item.team.code && (
                      <p className="text-xs text-muted-foreground font-medium">
                        {item.team.code}
                      </p>
                    )}
                  </div>

                  {/* Team Info */}
                  <div className="w-full space-y-1.5 text-xs">
                    {item.team.founded && (
                      <span className="font-medium text-xs text-muted-foreground">
                        Founded {item.team.founded}
                      </span>
                    )}

                    {item.team.national && (
                      <div className="inline-flex items-center px-1.5 py-0.5 bg-gradient-to-r from-primary/20 to-primary/10 text-primary rounded-full text-xs font-semibold border border-primary/20">
                        National Team
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );

            return (
              <Link
                key={item.team.id}
                href={`/stats/${leagueId}/${item.team.id}?season=${season}`}
                className="block h-full"
              >
                {CardContent}
              </Link>
            );
          })}
        </div>

        {/* Results Count */}
        <div className="text-center text-xs text-muted-foreground pt-2">
          <span className="font-medium">
            Showing {sortedTeams.length} team
            {sortedTeams.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </FullPage>
  );
}
