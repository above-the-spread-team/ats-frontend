"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FullPage from "@/components/common/full-page";
import NoDate from "@/components/common/no-data";
import type {
  LeadersApiResponse,
  LeaderResponseItem,
} from "@/type/footballapi/leader";

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
      <div className="relative w-5 h-5 md:w-8 md:h-8 flex-shrink-0 bg-muted rounded-full flex items-center justify-center">
        <span className="text-[8px] md:text-xs font-bold text-foreground/70">
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
    <div className="relative w-5 h-5 md:w-8 md:h-8 flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="rounded-full object-cover"
        sizes="(max-width: 768px) 16px, 20px"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

// Component to handle team logo errors gracefully
function TeamLogoImage({ src, alt }: { src: string; alt: string }) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return null; // Don't show anything if team logo fails
  }

  return (
    <div className="relative w-5 h-5 md:w-6 md:h-6 flex-shrink-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain"
        sizes="(max-width: 768px) 16px, 20px"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

type LeaderType =
  | "topscorers"
  | "topassists"
  | "topyellowcards"
  | "topredcards";

interface LeaderProps {
  leagueId: string;
  season: number;
}

const LEADER_OPTIONS: { value: LeaderType; labelKey: string }[] = [
  { value: "topscorers", labelKey: "leaders.topScorers" },
  { value: "topassists", labelKey: "leaders.topAssists" },
  { value: "topyellowcards", labelKey: "leaders.yellowCards" },
  { value: "topredcards", labelKey: "leaders.redCards" },
];

// Reusable cell styles
const cellBaseClass = "px-1 md:px-4 py-1.5 md:py-2";
const cellStatClass = `${cellBaseClass} text-center text-xs md:text-sm text-muted-foreground`;

// Reusable TableCell wrapper component
function LeaderCell({
  className = cellBaseClass,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <TableCell className={className}>{children}</TableCell>;
}

export default function Leader({ leagueId, season }: LeaderProps) {
  const t = useTranslations("stats");
  const tCommon = useTranslations("common");
  const [selectedType, setSelectedType] = useState<LeaderType>("topscorers");

  // Get table columns based on leader type
  const getTableColumns = (type: LeaderType) => {
    const baseColumns = [
      { label: "", align: "left" as const },
      { label: tCommon("player"), align: "left" as const },
      { label: tCommon("team"), align: "left" as const },
    ];

    if (type === "topscorers") {
      return [
        ...baseColumns,
        { label: t("leaders.columns.goals"), align: "center" as const },
        { label: t("leaders.columns.assists"), align: "center" as const },
        { label: t("leaders.columns.played"), align: "center" as const },
        { label: t("leaders.columns.goalsPer90"), align: "center" as const },
        { label: t("leaders.columns.minutesPerGoal"), align: "center" as const },
        { label: t("leaders.columns.shots"), align: "center" as const },
        { label: t("leaders.columns.conversion"), align: "center" as const },
        { label: t("leaders.columns.accuracy"), align: "center" as const },
        { label: t("leaders.columns.position"), align: "center" as const },
      ];
    } else if (type === "topassists") {
      return [
        ...baseColumns,
        { label: t("leaders.columns.assists"), align: "center" as const },
        { label: t("leaders.columns.goals"), align: "center" as const },
        { label: t("leaders.columns.played"), align: "center" as const },
        { label: t("leaders.columns.chances"), align: "center" as const },
        { label: t("leaders.columns.chancesPer90"), align: "center" as const },
        { label: t("leaders.columns.passes"), align: "center" as const },
        { label: t("leaders.columns.position"), align: "center" as const },
      ];
    } else {
      // Cards
      return [
        ...baseColumns,
        {
          label:
            type === "topyellowcards"
              ? t("leaders.columns.yellow")
              : t("leaders.columns.red"),
          align: "center" as const,
        },
        { label: t("leaders.columns.played"), align: "center" as const },
        { label: t("leaders.columns.position"), align: "center" as const },
      ];
    }
  };
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
          throw new Error(t("leaders.loadFailed", { status: response.status }));
        }

        const data = (await response.json()) as LeadersApiResponse;

        setLeaders(data.response ?? []);
        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : tCommon("unknown"));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Helper functions for calculations
  const getGoalsPer90 = (
    stats: LeaderResponseItem["statistics"][0]
  ): number | null => {
    if (!stats) return null;
    const goals = stats.goals.total ?? 0;
    const minutes = stats.games.minutes ?? 0;
    if (minutes === 0) return null;
    return (goals / minutes) * 90;
  };

  const getMinutesPerGoal = (
    stats: LeaderResponseItem["statistics"][0]
  ): number | null => {
    if (!stats) return null;
    const goals = stats.goals.total ?? 0;
    const minutes = stats.games.minutes ?? 0;
    if (goals === 0) return null;
    return minutes / goals;
  };

  const getGoalConversion = (
    stats: LeaderResponseItem["statistics"][0]
  ): number | null => {
    if (!stats) return null;
    const goals = stats.goals.total ?? 0;
    const totalShots = stats.shots.total ?? 0;
    if (totalShots === 0) return null;
    return (goals / totalShots) * 100;
  };

  const getShotAccuracy = (
    stats: LeaderResponseItem["statistics"][0]
  ): number | null => {
    if (!stats) return null;
    const shotsOnTarget = stats.shots.on ?? 0;
    const totalShots = stats.shots.total ?? 0;
    if (totalShots === 0) return null;
    return (shotsOnTarget / totalShots) * 100;
  };

  // Helper functions for assists
  const getChancesPer90 = (
    stats: LeaderResponseItem["statistics"][0]
  ): number | null => {
    if (!stats) return null;
    const chances = stats.passes.key ?? 0;
    const minutes = stats.games.minutes ?? 0;
    if (minutes === 0) return null;
    return (chances / minutes) * 90;
  };

  if (error) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate message={error} helpText={t("leaders.errorHelp")} />
      </FullPage>
    );
  }

  // Loading skeleton
  if (isLoading) {
    const columns = getTableColumns(selectedType);
    return (
      <div className="space-y-4">
        {/* Dropdown Selector Skeleton */}
        <div className="flex items-center pt-2 md:pt-0 gap-2 px-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Table Skeleton */}
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block md:block">
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-card">
                  <TableRow>
                    {columns.map((column) => (
                      <TableHead
                        key={column.label}
                        className={`${
                          column.align === "left" ? "text-left" : "text-center"
                        } px-2 md:px-4 text-xs md:text-xs font-semibold text-muted-foreground tracking-wider`}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <TableRow key={idx}>
                      {columns.map((column, colIdx) => {
                        if (colIdx === 0) {
                          return (
                            <LeaderCell key={column.label}>
                              <Skeleton className="h-3 md:h-5 w-4 md:w-6 ml-1" />
                            </LeaderCell>
                          );
                        } else if (colIdx === 1) {
                          return (
                            <LeaderCell key={column.label}>
                              <div className="flex items-center gap-1.5 md:gap-3">
                                <Skeleton className="h-5 w-5 md:h-8 md:w-8 rounded-full" />
                                <Skeleton className="h-3 md:h-4 w-20 md:w-32" />
                              </div>
                            </LeaderCell>
                          );
                        } else if (colIdx === 2) {
                          return (
                            <LeaderCell key={column.label}>
                              <div className="flex items-center justify-center">
                                <Skeleton className="h-5 w-5 md:h-6 md:w-6 rounded" />
                              </div>
                            </LeaderCell>
                          );
                        } else {
                          return (
                            <LeaderCell
                              key={column.label}
                              className={cellStatClass}
                            >
                              <Skeleton className="h-3 md:h-4 w-6 md:w-10 mx-auto" />
                            </LeaderCell>
                          );
                        }
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Dropdown Selector */}
      <div className="flex items-center pt-2 md:pt-0 gap-2 px-4">
        <label
          htmlFor="leader-type-select"
          className="text-sm font-medium text-muted-foreground"
        >
          {t("leaders.typeLabel")}
        </label>
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as LeaderType)}
        >
          <SelectTrigger
            id="leader-type-select"
            className="w-[140px] md:w-[160px] rounded-xl font-medium ring-1 ring-mygray"
          >
            <SelectValue placeholder={t("leaders.selectType")} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl p-1 bg-primary-active text-mygray">
            {LEADER_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="rounded-xl font-medium"
              >
                {t(option.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {leaders.length === 0 && !isLoading && (
        <FullPage center minusHeight={300}>
          <NoDate
            message={t("leaders.empty")}
            helpText={t("leaders.emptyHelp")}
          />
        </FullPage>
      )}

      {leaders.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-full inline-block md:block">
            <div className="overflow-hidden">
              <Table>
                <TableHeader className="bg-card">
                  <TableRow>
                    {getTableColumns(selectedType).map((column) => (
                      <TableHead
                        key={column.label}
                        className={`${
                          column.align === "left" ? "text-left" : "text-center"
                        } px-2 md:px-4 text-xs md:text-xs font-semibold text-muted-foreground tracking-wider`}
                      >
                        {column.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaders.map((item, index) => {
                    const stats = item.statistics[0];
                    const rank = index + 1;
                    const statValue = getStatValue(item);
                    const isTopScorers = selectedType === "topscorers";
                    const isTopAssists = selectedType === "topassists";

                    // Calculations for top scorers
                    const goalsPer90 = isTopScorers
                      ? getGoalsPer90(stats)
                      : null;
                    const minutesPerGoal = isTopScorers
                      ? getMinutesPerGoal(stats)
                      : null;
                    const goalConversion = isTopScorers
                      ? getGoalConversion(stats)
                      : null;
                    const shotAccuracy = isTopScorers
                      ? getShotAccuracy(stats)
                      : null;

                    return (
                      <TableRow key={item.player.id}>
                        {/* Rank */}
                        <LeaderCell>
                          <span className="font-bold pl-1 text-foreground text-xs md:text-sm">
                            {rank}
                          </span>
                        </LeaderCell>

                        {/* Player */}
                        <LeaderCell>
                          <Link
                            href={`/stats/player/${item.player.id}`}
                            className="flex items-center gap-1.5 md:gap-3 hover:opacity-80 transition-opacity"
                          >
                            {item.player.photo ? (
                              <PlayerImage
                                src={item.player.photo}
                                alt={item.player.name}
                                playerName={item.player.name}
                              />
                            ) : (
                              <div className="relative w-5 h-5 md:w-8 md:h-8 flex-shrink-0 bg-muted rounded-full flex items-center justify-center">
                                <span className="text-[8px] md:text-xs font-bold text-foreground/70">
                                  {item.player.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                            <p className="font-semibold text-foreground text-xs md:text-sm">
                              {item.player.name}
                            </p>
                          </Link>
                        </LeaderCell>

                        {/* Team */}
                        <LeaderCell className="text-center ">
                          {stats && stats.team.logo && (
                            <div className="flex items-center justify-center">
                              <TeamLogoImage
                                src={stats.team.logo}
                                alt={stats.team.name}
                              />
                            </div>
                          )}
                        </LeaderCell>

                        {/* Top Scorers Columns */}
                        {isTopScorers && (
                          <>
                            {/* Goals */}
                            <LeaderCell
                              className={`${cellBaseClass} text-center`}
                            >
                              <span className="font-bold text-primary text-xs md:text-base">
                                {stats?.goals.total ?? 0}
                              </span>
                            </LeaderCell>

                            {/* Assists */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.goals.assists ?? 0}
                            </LeaderCell>

                            {/* Played */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.games.appearences ?? 0}
                            </LeaderCell>

                            {/* Goals per 90 */}
                            <LeaderCell className={cellStatClass}>
                              {goalsPer90 !== null ? (
                                <span className="text-xs md:text-sm">
                                  {goalsPer90.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </LeaderCell>

                            {/* Minutes per Goal */}
                            <LeaderCell className={cellStatClass}>
                              {minutesPerGoal !== null ? (
                                <span className="text-xs md:text-sm">
                                  {Math.round(minutesPerGoal)}
                                </span>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </LeaderCell>

                            {/* Total Shots */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.shots.total ?? 0}
                            </LeaderCell>

                            {/* Goal Conversion */}
                            <LeaderCell className={cellStatClass}>
                              {goalConversion !== null ? (
                                <span className="text-xs md:text-sm">
                                  {goalConversion.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </LeaderCell>

                            {/* Shot Accuracy */}
                            <LeaderCell className={cellStatClass}>
                              {shotAccuracy !== null ? (
                                <span className="text-xs md:text-sm">
                                  {shotAccuracy.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </LeaderCell>

                            {/* Position */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.games.position ?? "—"}
                            </LeaderCell>
                          </>
                        )}

                        {/* Top Assists Columns */}
                        {isTopAssists && (
                          <>
                            {/* Assists */}
                            <LeaderCell
                              className={`${cellBaseClass} text-center`}
                            >
                              <span className="font-bold text-primary text-xs md:text-base">
                                {statValue}
                              </span>
                            </LeaderCell>

                            {/* Goals */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.goals.total ?? 0}
                            </LeaderCell>

                            {/* Played */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.games.appearences ?? 0}
                            </LeaderCell>

                            {/* Chances Created */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.passes.key ?? 0}
                            </LeaderCell>

                            {/* Chances per 90 */}
                            <LeaderCell className={cellStatClass}>
                              {getChancesPer90(stats) !== null ? (
                                <span className="text-xs md:text-sm">
                                  {getChancesPer90(stats)!.toFixed(2)}
                                </span>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </LeaderCell>

                            {/* Total Passes */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.passes.total ?? 0}
                            </LeaderCell>

                            {/* Position */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.games.position ?? "—"}
                            </LeaderCell>
                          </>
                        )}

                        {/* Cards Columns */}
                        {!isTopScorers && !isTopAssists && (
                          <>
                            {/* Cards */}
                            <LeaderCell
                              className={`${cellBaseClass} text-center`}
                            >
                              <span className="font-bold text-primary text-xs md:text-base">
                                {statValue}
                              </span>
                            </LeaderCell>

                            {/* Played */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.games.appearences ?? 0}
                            </LeaderCell>

                            {/* Position */}
                            <LeaderCell className={cellStatClass}>
                              {stats?.games.position ?? "—"}
                            </LeaderCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
