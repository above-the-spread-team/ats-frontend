"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import { ArrowLeft, Flag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FullPage from "@/components/common/full-page";
import NoDate from "@/components/common/no-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { PlayerStatisticsApiResponse } from "@/type/footballapi/player-statistics";

export default function PlayerPage() {
  const t = useTranslations("stats");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const numberLocale =
    locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : locale;
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const playerId = params["player-id"] as string;

  const seasonParam = searchParams.get("season");
  const teamId = searchParams.get("teamId");
  const leagueId = searchParams.get("leagueId");

  const [playerData, setPlayerData] = useState<
    PlayerStatisticsApiResponse["response"][0] | null
  >(null);
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Season: URL param > latest from player-seasons API > current year
  const latestFromApi =
    availableSeasons.length > 0 ? Math.max(...availableSeasons) : undefined;
  const season = seasonParam
    ? parseInt(seasonParam, 10)
    : latestFromApi ?? new Date().getFullYear();

  // Fetch available seasons for the player
  useEffect(() => {
    const controller = new AbortController();

    const fetchAvailableSeasons = async () => {
      if (!playerId) return;

      setIsLoadingSeasons(true);

      try {
        const response = await fetch(
          `/api/player-seasons?player=${playerId}`,
          { signal: controller.signal }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.response && Array.isArray(data.response)) {
            // Sort seasons in descending order (most recent first)
            const sortedSeasons = data.response
              .map((s: number) => s)
              .sort((a: number, b: number) => b - a);
            setAvailableSeasons(sortedSeasons);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Error fetching available seasons:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSeasons(false);
        }
      }
    };

    fetchAvailableSeasons();

    return () => {
      controller.abort();
    };
  }, [playerId]);

  // Fetch player statistics for the selected season
  useEffect(() => {
    const controller = new AbortController();

    const fetchPlayerStatistics = async () => {
      if (!playerId || !season) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/player-statistics?id=${playerId}&season=${season}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(t("player.loadFailed", { status: response.status }));
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
        setError(err instanceof Error ? err.message : tCommon("unknown"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, season]);

  const handleSeasonChange = (newSeason: string) => {
    const seasonNum = parseInt(newSeason, 10);
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", seasonNum.toString());
    
    // Preserve teamId and leagueId if they exist
    if (teamId) params.set("teamId", teamId);
    if (leagueId) params.set("leagueId", leagueId);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <FullPage minusHeight={80}>
        <div className="container mx-auto max-w-6xl space-y-4 md:space-y-2 px-4 md:px-6 py-4">
          {/* Back Link Skeleton */}
          <Skeleton className="h-4 w-24" />

          {/* Player Header Skeleton */}
          <div className="flex flex-row items-start md:items-center gap-4 p-2 md:p-4 pt-0 md:pt-2">
            <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 md:h-6 w-32 md:w-40" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>
          </div>

          {/* Statistics by Team/League Skeleton */}
          <div className="space-y-4 md:space-y-6">
            {Array.from({ length: 1 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-3 md:p-4 shadow-md"
              >
                {/* Team/League Header Skeleton */}
                <div className="flex items-center gap-2 md:gap-3 mb-3 pb-3 border-b border-border/50">
                  <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <Skeleton className="h-4 md:h-5 w-32 md:w-40" />
                    <Skeleton className="h-3 md:h-4 w-48 md:w-64" />
                  </div>
                </div>

                {/* Key Stats Skeleton */}
                <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-3">
                  <div className="text-center p-1.5 md:p-2 bg-muted/30 rounded-md">
                    <Skeleton className="h-3 md:h-3.5 w-12 mx-auto mb-0.5" />
                    <Skeleton className="h-4 md:h-4 w-8 mx-auto" />
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-green-500/10 rounded-md">
                    <Skeleton className="h-3 md:h-3.5 w-12 mx-auto mb-0.5" />
                    <Skeleton className="h-4 md:h-4 w-8 mx-auto" />
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-blue-500/10 rounded-md">
                    <Skeleton className="h-3 md:h-3.5 w-12 mx-auto mb-0.5" />
                    <Skeleton className="h-4 md:h-4 w-8 mx-auto" />
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-purple-500/10 rounded-md">
                    <Skeleton className="h-3 md:h-3.5 w-12 mx-auto mb-0.5" />
                    <Skeleton className="h-4 md:h-4 w-8 mx-auto" />
                  </div>
                </div>

                {/* Statistics Table Skeleton */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableBody>
                      {Array.from({ length: 12 }).map((_, rowIdx) => (
                        <TableRow key={rowIdx}>
                          <TableCell className="text-xs md:text-sm w-1/3">
                            <Skeleton className="h-4 md:h-5 w-20 md:w-24" />
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">
                            <Skeleton className="h-4 md:h-5 w-6 md:w-8" />
                          </TableCell>
                          <TableCell className="text-xs md:text-sm w-1/3">
                            <Skeleton className="h-4 md:h-5 w-16 md:w-20" />
                          </TableCell>
                          <TableCell className="text-xs md:text-sm">
                            <Skeleton className="h-4 md:h-5 w-6 md:w-8" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FullPage>
    );
  }

  if (error || !playerData) {
    return (
      <FullPage center minusHeight={70}>
        <NoDate
          message={error || t("player.noData")}
          helpText={t("player.noDataHelp")}
        />
      </FullPage>
    );
  }

  const { player, statistics } = playerData;

  return (
    <FullPage minusHeight={80}>
      <div className="container mx-auto max-w-6xl space-y-4 md:space-y-2 px-4 md:px-6 py-4">
        {/* Back Link */}
        <button
          onClick={() => {
            // Navigate back to squad page if teamId and leagueId are present
            if (teamId && leagueId) {
              router.push(`/stats/${leagueId}/${teamId}?tab=squad`);
            } else {
              router.back();
            }
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          {tCommon("back")}
        </button>

        {/* Player Header with Season Selector */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-row items-start md:items-center gap-4 p-2 md:p-4 pt-0 md:pt-2 flex-1">
            {player.photo && (
              <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                <Image
                  src={player.photo}
                  alt={player.name}
                  fill
                  className="object-cover rounded-full border-2 border-border"
                  sizes="(max-width: 768px) 80px, 96px"
                />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-foreground">
                  {player.name}
                </h1>
                {statistics.length > 0 && statistics[0].games.captain && (
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-semibold border border-primary/20">
                    {t("player.captain")}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                {player.nationality && (
                  <span className="flex items-center gap-1">
                    <Flag className="w-3 h-3" />
                    {player.nationality}
                  </span>
                )}
                {player.age && (
                  <>
                    <span>•</span>
                    <span>{t("player.yearsOld", { age: player.age })}</span>
                  </>
                )}
                {statistics.length > 0 && statistics[0].games.position && (
                  <>
                    <span>•</span>
                    <span>{statistics[0].games.position}</span>
                  </>
                )}
                {player.height && (
                  <>
                    <span>•</span>
                    <span>{t("player.height", { value: player.height })}</span>
                  </>
                )}
                {player.weight && (
                  <>
                    <span>•</span>
                    <span>{t("player.weight", { value: player.weight })}</span>
                  </>
                )}
              </div>
              {player.birth && (
                <p className="text-xs text-muted-foreground">
                  {player.birth.place
                    ? t("player.bornIn", {
                        date: player.birth.date,
                        place: player.birth.place,
                      })
                    : t("player.born", { date: player.birth.date })}
                </p>
              )}
            </div>
          </div>

          {/* Season Selector */}
          {availableSeasons.length > 0 && (
            <div className="flex items-center justify-end gap-2 px-2 md:px-4">
              <label
                htmlFor="player-season-select"
                className="text-sm font-medium text-muted-foreground"
              >
                {t("season.label")}
              </label>
              <Select
                value={season.toString()}
                onValueChange={handleSeasonChange}
                disabled={isLoadingSeasons}
              >
                <SelectTrigger
                  id="player-season-select"
                  className="w-[100px] md:w-[120px] rounded-xl font-medium ring-1 ring-mygray"
                >
                  <SelectValue placeholder={t("season.select")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl p-1 bg-primary-active text-mygray max-h-[300px]">
                  {availableSeasons.map((seasonYear) => (
                    <SelectItem
                      key={seasonYear}
                      value={seasonYear.toString()}
                      className="rounded-xl font-medium"
                    >
                      {seasonYear}/{seasonYear + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Statistics by Team/League */}
        {statistics.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            {statistics.map((stat, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-card to-card/95 border border-border/50 rounded-lg md:rounded-xl p-3 md:p-4 shadow-md"
              >
                {/* Team/League Header */}
                <div className="flex items-center gap-2 md:gap-3 mb-3 pb-3 border-b border-border/50">
                  {stat.team.logo && (
                      <div className="relative w-8 h-8 md:w-10 md:h-10">
                        <Image
                          src={stat.team.logo}
                          alt={stat.team.name}
                          fill
                          className="object-contain dark:p-1 dark:bg-white dark:rounded-xl"
                          sizes="(max-width: 768px) 32px, 40px"
                        />
                      </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-foreground truncate">
                      {stat.team.name}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {stat.league.name} • {stat.league.country} •{" "}
                      {t("player.seasonLabel", { season: stat.league.season })}
                    </p>
                  </div>
                </div>

                {/* Key Stats - Compact */}
                <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-3">
                  <div className="text-center p-1.5 md:p-2 bg-muted/30 rounded-md">
                    <p className="text-xs md:text-sm text-muted-foreground mb-0.5">
                      {t("player.apps")}
                    </p>
                    <p className="text-xs md:text-sm font-bold text-foreground">
                      {stat.games.appearences !== null
                        ? stat.games.appearences
                        : "-"}
                    </p>
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-green-500/10 rounded-md">
                    <p className="text-xs md:text-sm text-muted-foreground mb-0.5">
                      {t("player.goals")}
                    </p>
                    <p className="text-xs md:text-sm font-bold text-green-600 dark:text-green-400">
                      {stat.goals.total !== null ? stat.goals.total : "-"}
                    </p>
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-blue-500/10 rounded-md">
                    <p className="text-xs md:text-sm text-muted-foreground mb-0.5">
                      {t("player.assists")}
                    </p>
                    <p className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400">
                      {stat.goals.assists !== null ? stat.goals.assists : "-"}
                    </p>
                  </div>
                  <div className="text-center p-1.5 md:p-2 bg-purple-500/10 rounded-md">
                    <p className="text-xs md:text-sm text-muted-foreground mb-0.5">
                      {t("player.rating")}
                    </p>
                    <p className="text-xs md:text-sm font-bold text-purple-600 dark:text-purple-400">
                      {stat.games.rating && stat.games.rating !== "0"
                        ? parseFloat(stat.games.rating).toFixed(2)
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Statistics Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableBody>
                      {/* Games */}
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground w-1/3">
                          {t("player.lineups")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.games.lineups !== null
                            ? stat.games.lineups
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground w-1/3">
                          {t("player.minutes")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.games.minutes !== null
                            ? stat.games.minutes.toLocaleString(numberLocale)
                            : "-"}
                        </TableCell>
                      </TableRow>
                      {stat.games.number && (
                        <TableRow>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.number")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                            #{stat.games.number}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.position")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                            {stat.games.position}
                          </TableCell>
                        </TableRow>
                      )}
                      {!stat.games.number && (
                        <TableRow>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.position")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                            {stat.games.position}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground"></TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground"></TableCell>
                        </TableRow>
                      )}

                      {/* Substitutes */}
                      {stat.substitutes && (
                        <TableRow>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.subsIn")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                            {stat.substitutes.in !== null
                              ? stat.substitutes.in
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.subsOut")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                            {stat.substitutes.out !== null
                              ? stat.substitutes.out
                              : "-"}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Goals & Shots */}
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.shotsTotal")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.shots.total !== null ? stat.shots.total : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.shotsOnTarget")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.shots.on !== null ? stat.shots.on : "-"}
                        </TableCell>
                      </TableRow>
                      {(stat.goals.conceded !== null ||
                        (stat.goals.saves !== null &&
                          stat.goals.saves > 0)) && (
                        <TableRow>
                          {stat.goals.conceded !== null && (
                            <>
                              <TableCell className="text-xs md:text-sm text-muted-foreground">
                                {t("player.goalsConceded")}
                              </TableCell>
                              <TableCell className="text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">
                                {stat.goals.conceded}
                              </TableCell>
                            </>
                          )}
                          {stat.goals.saves !== null &&
                            stat.goals.saves > 0 && (
                              <>
                                <TableCell className="text-xs md:text-sm text-muted-foreground">
                                  {t("player.saves")}
                                </TableCell>
                                <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                                  {stat.goals.saves}
                                </TableCell>
                              </>
                            )}
                        </TableRow>
                      )}

                      {/* Passes */}
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.passesTotal")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.passes.total !== null
                            ? stat.passes.total.toLocaleString(numberLocale)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.keyPasses")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.passes.key !== null ? stat.passes.key : "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.passAccuracy")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.passes.accuracy !== null
                            ? `${stat.passes.accuracy}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground"></TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground"></TableCell>
                      </TableRow>

                      {/* Defense */}
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.tackles")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.tackles.total !== null
                            ? stat.tackles.total
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.blocks")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.tackles.blocks !== null
                            ? stat.tackles.blocks
                            : "-"}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.interceptions")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.tackles.interceptions !== null
                            ? stat.tackles.interceptions
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground"></TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground"></TableCell>
                      </TableRow>

                      {/* Duels */}
                      {stat.duels.total !== null && (
                        <TableRow>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.duelsTotal")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                            {stat.duels.total}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.duelsWon")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400">
                            {stat.duels.won !== null ? stat.duels.won : "-"}
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Dribbles */}
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.dribblesAttempts")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                          {stat.dribbles.attempts !== null
                            ? stat.dribbles.attempts
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.dribblesSuccess")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400">
                          {stat.dribbles.success !== null
                            ? stat.dribbles.success
                            : "-"}
                        </TableCell>
                      </TableRow>
                      {stat.dribbles.past !== null && (
                        <TableRow>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.dribblesPast")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                            {stat.dribbles.past}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground"></TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground"></TableCell>
                        </TableRow>
                      )}

                      {/* Fouls */}
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.foulsDrawn")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400">
                          {stat.fouls.drawn !== null ? stat.fouls.drawn : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.foulsCommitted")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">
                          {stat.fouls.committed !== null
                            ? stat.fouls.committed
                            : "-"}
                        </TableCell>
                      </TableRow>

                      {/* Cards */}
                      <TableRow>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.yellowCards")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          {stat.cards.yellow !== null ? stat.cards.yellow : "-"}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground">
                          {t("player.redCards")}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">
                          {stat.cards.red !== null ? stat.cards.red : "-"}
                        </TableCell>
                      </TableRow>
                      {stat.cards.yellowred > 0 && (
                        <TableRow>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">
                            {t("player.yellowRedCards")}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-orange-600 dark:text-orange-400">
                            {stat.cards.yellowred}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground"></TableCell>
                          <TableCell className="text-xs md:text-sm font-semibold text-foreground"></TableCell>
                        </TableRow>
                      )}

                      {/* Penalties */}
                      {(stat.penalty.scored > 0 ||
                        stat.penalty.missed > 0 ||
                        stat.penalty.won > 0) && (
                        <>
                          <TableRow>
                            <TableCell className="text-xs md:text-sm text-muted-foreground">
                              {t("player.penaltiesScored")}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm font-semibold text-green-600 dark:text-green-400">
                              {stat.penalty.scored}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm text-muted-foreground">
                              {t("player.penaltiesMissed")}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">
                              {stat.penalty.missed}
                            </TableCell>
                          </TableRow>
                          {stat.penalty.saved !== null &&
                            stat.penalty.saved > 0 && (
                              <TableRow>
                                <TableCell className="text-xs md:text-sm text-muted-foreground">
                                  {t("player.penaltiesSaved")}
                                </TableCell>
                                <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                                  {stat.penalty.saved}
                                </TableCell>
                                <TableCell className="text-xs md:text-sm text-muted-foreground">
                                  {t("player.penaltiesWon")}
                                </TableCell>
                                <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                                  {stat.penalty.won}
                                </TableCell>
                              </TableRow>
                            )}
                          {(!stat.penalty.saved ||
                            stat.penalty.saved === 0) && (
                            <TableRow>
                              <TableCell className="text-xs md:text-sm text-muted-foreground">
                                {t("player.penaltiesWon")}
                              </TableCell>
                              <TableCell className="text-xs md:text-sm font-semibold text-foreground">
                                {stat.penalty.won}
                              </TableCell>
                              {stat.penalty.commited !== null &&
                                stat.penalty.commited > 0 && (
                                  <>
                                    <TableCell className="text-xs md:text-sm text-muted-foreground">
                                      {t("player.penaltiesCommitted")}
                                    </TableCell>
                                    <TableCell className="text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">
                                      {stat.penalty.commited}
                                    </TableCell>
                                  </>
                                )}
                              {(!stat.penalty.commited ||
                                stat.penalty.commited === 0) && (
                                <>
                                  <TableCell className="text-xs md:text-sm text-muted-foreground"></TableCell>
                                  <TableCell className="text-xs md:text-sm font-semibold text-foreground"></TableCell>
                                </>
                              )}
                            </TableRow>
                          )}
                          {stat.penalty.commited !== null &&
                            stat.penalty.commited > 0 &&
                            stat.penalty.saved !== null &&
                            stat.penalty.saved > 0 && (
                              <TableRow>
                                <TableCell className="text-xs md:text-sm text-muted-foreground">
                                  {t("player.penaltiesCommitted")}
                                </TableCell>
                                <TableCell className="text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">
                                  {stat.penalty.commited}
                                </TableCell>
                                <TableCell className="text-xs md:text-sm text-muted-foreground"></TableCell>
                                <TableCell className="text-xs md:text-sm font-semibold text-foreground"></TableCell>
                              </TableRow>
                            )}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FullPage>
  );
}
