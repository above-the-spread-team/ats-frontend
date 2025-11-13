"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";
import type { TeamsApiResponse, TeamResponseItem } from "@/type/team-info";
import { MapPin, Calendar, Users } from "lucide-react";

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
          `/api/team-info?league=${leagueId}&season=${season}`,
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

  if (isLoading) {
    return (
      <FullPage>
        <Loading />
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTeams.map((item) => (
          <div
            key={item.team.id}
            className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Team Logo */}
              <div className="relative w-20 h-20 md:w-24 md:h-24">
                {item.team.logo ? (
                  <Image
                    src={item.team.logo}
                    alt={item.team.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 80px, 96px"
                  />
                ) : (
                  <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {item.team.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Team Name */}
              <div>
                <h3 className="text-lg md:text-xl font-bold text-foreground">
                  {item.team.name}
                </h3>
                {item.team.code && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.team.code}
                  </p>
                )}
              </div>

              {/* Team Info */}
              <div className="w-full space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{item.team.country}</span>
                </div>

                {item.team.founded && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Founded {item.team.founded}</span>
                  </div>
                )}

                {item.team.national && (
                  <div className="inline-block px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                    National Team
                  </div>
                )}
              </div>

              {/* Venue Info */}
              {item.venue.name && (
                <div className="w-full pt-4 border-t border-border space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{item.venue.name}</span>
                  </div>

                  {item.venue.city && (
                    <p className="text-xs text-muted-foreground">
                      {item.venue.city}
                      {item.venue.address && `, ${item.venue.address}`}
                    </p>
                  )}

                  {item.venue.capacity && (
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>
                        {item.venue.capacity.toLocaleString()} capacity
                      </span>
                    </div>
                  )}

                  {item.venue.surface && (
                    <p className="text-xs text-muted-foreground capitalize">
                      Surface: {item.venue.surface}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-muted-foreground pt-4">
        Showing {sortedTeams.length} team{sortedTeams.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
