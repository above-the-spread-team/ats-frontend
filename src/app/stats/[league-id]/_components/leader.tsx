"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";
import type { LeadersApiResponse, LeaderResponseItem } from "@/type/leader";

type LeaderType =
  | "topscorers"
  | "topassists"
  | "topyellowcards"
  | "topredcards";

interface LeaderProps {
  leagueId: string;
  season: number;
}

const LEADER_OPTIONS: { value: LeaderType; label: string }[] = [
  { value: "topscorers", label: "Top Scorers" },
  { value: "topassists", label: "Top Assists" },
  { value: "topyellowcards", label: "Yellow Cards" },
  { value: "topredcards", label: "Red Cards" },
];

export default function Leader({ leagueId, season }: LeaderProps) {
  const [selectedType, setSelectedType] = useState<LeaderType>("topscorers");
  const [leaders, setLeaders] = useState<LeaderResponseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLeaders = async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/leaders?type=${selectedType}&league=${leagueId}&season=${season}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load leaders (${response.status})`);
        }

        const data = (await response.json()) as LeadersApiResponse;

        setLeaders(data.response ?? []);
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setLeaders([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchLeaders();

    return () => {
      controller.abort();
    };
  }, [leagueId, season, selectedType]);

  const getStatValue = (item: LeaderResponseItem): number => {
    const stats = item.statistics[0];
    if (!stats) return 0;

    switch (selectedType) {
      case "topscorers":
        return stats.goals.total ?? 0;
      case "topassists":
        return stats.goals.assists ?? 0;
      case "topyellowcards":
        return stats.cards.yellow ?? 0;
      case "topredcards":
        return stats.cards.red ?? 0;
      default:
        return 0;
    }
  };

  const getStatLabel = (): string => {
    switch (selectedType) {
      case "topscorers":
        return "Goals";
      case "topassists":
        return "Assists";
      case "topyellowcards":
        return "Yellow Cards";
      case "topredcards":
        return "Red Cards";
      default:
        return "";
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Dropdown Selector */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="leader-type-select"
          className="text-sm font-medium text-muted-foreground"
        >
          Leader Type:
        </label>
        <select
          id="leader-type-select"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as LeaderType)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {LEADER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {leaders.length === 0 && !isLoading && (
        <FullPage>
          <div className="text-center">
            <p className="text-lg font-semibold text-muted-foreground">
              No leaders found for this league and season
            </p>
          </div>
        </FullPage>
      )}

      {leaders.length > 0 && (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                    Rank
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                    Player
                  </th>
                  <th className="text-left p-3 text-xs font-semibold text-muted-foreground">
                    Team
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    {getStatLabel()}
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    Appearances
                  </th>
                  <th className="text-center p-3 text-xs font-semibold text-muted-foreground">
                    Position
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((item, index) => {
                  const stats = item.statistics[0];
                  const rank = index + 1;
                  const statValue = getStatValue(item);

                  return (
                    <tr
                      key={item.player.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3 font-semibold text-foreground">
                        {rank}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {item.player.photo && (
                            <Image
                              src={item.player.photo}
                              alt={item.player.name}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-foreground">
                              {item.player.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.player.nationality}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {stats && (
                          <div className="flex items-center gap-2">
                            {stats.team.logo && (
                              <Image
                                src={stats.team.logo}
                                alt={stats.team.name}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            )}
                            <span className="text-sm text-foreground">
                              {stats.team.name}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-lg font-bold text-primary">
                          {statValue}
                        </span>
                      </td>
                      <td className="p-3 text-center text-muted-foreground">
                        {stats?.games.appearences ?? 0}
                      </td>
                      <td className="p-3 text-center text-muted-foreground text-sm">
                        {stats?.games.position ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {leaders.map((item, index) => {
              const stats = item.statistics[0];
              const rank = index + 1;
              const statValue = getStatValue(item);

              return (
                <div
                  key={item.player.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-foreground w-6">
                        {rank}
                      </span>
                      {item.player.photo && (
                        <Image
                          src={item.player.photo}
                          alt={item.player.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.player.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.player.nationality}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {statValue}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getStatLabel()}
                      </div>
                    </div>
                  </div>

                  {stats && (
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        {stats.team.logo && (
                          <Image
                            src={stats.team.logo}
                            alt={stats.team.name}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        )}
                        <span className="text-sm text-foreground">
                          {stats.team.name}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.games.appearences} apps • {stats.games.position}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
