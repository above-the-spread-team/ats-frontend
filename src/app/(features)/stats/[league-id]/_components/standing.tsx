"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FullPage from "@/components/common/full-page";
import NoDate from "@/components/common/no-date";
import type { StandingsApiResponse, StandingEntry } from "@/type/standing";

function getFormColor(result: string | null): string {
  if (!result) return "bg-muted text-muted-foreground";
  const char = result.toUpperCase();
  if (char === "W") return "bg-green-500/20 text-green-600 dark:text-green-400";
  if (char === "D")
    return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400";
  if (char === "L") return "bg-red-500/20 text-red-600 dark:text-red-400";
  return "bg-muted text-muted-foreground";
}

const tableColumns = [
  { label: "", align: "left" as const },
  { label: "Team", align: "left" as const },
  { label: "P", align: "center" as const },
  { label: "W", align: "center" as const },
  { label: "D", align: "center" as const },
  { label: "L", align: "center" as const },
  { label: "GF", align: "center" as const },
  { label: "GA", align: "center" as const },
  { label: "GD", align: "center" as const },
  { label: "Pts", align: "center" as const },
  { label: "Form", align: "center" as const },
];

interface StandingsProps {
  leagueId: string;
  season: number;
}

// Reusable cell styles
const cellBaseClass = "px-1 md:px-4 py-1.5 md:py-2";
const cellStatClass = `${cellBaseClass} text-center text-[10px] md:text-sm text-muted-foreground`;

// Reusable TableCell wrapper component
function StandingCell({
  className = cellBaseClass,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <TableCell className={className}>{children}</TableCell>;
}

export default function Standings({ leagueId, season }: StandingsProps) {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchStandings = async () => {
      if (!leagueId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/standings?league=${leagueId}&season=${season}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to load standings (${response.status})`);
        }

        const data = (await response.json()) as StandingsApiResponse;

        if (data.response && data.response.length > 0) {
          const league = data.response[0].league;
          // Flatten the standings array (it's an array of arrays for groups)
          const allStandings = league.standings.flat();
          setStandings(allStandings);
        } else {
          setStandings([]);
        }

        if (data.errors && data.errors.length > 0) {
          setError(data.errors.join("\n"));
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setStandings([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchStandings();

    return () => {
      controller.abort();
    };
  }, [leagueId, season]);

  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => a.rank - b.rank);
  }, [standings]);

  if (!leagueId) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message="Invalid league ID"
          helpText="The league ID provided is not valid."
        />
      </FullPage>
    );
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block md:block">
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-card  ">
                <TableRow>
                  {tableColumns.map((column) => (
                    <TableHead
                      key={column.label}
                      className={`${
                        column.align === "left" ? "text-left" : "text-center"
                      } px-2 md:px-4   text-[10px] md:text-xs font-semibold text-muted-foreground  tracking-wider`}
                    >
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 12 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <StandingCell>
                      <Skeleton className="h-3 md:h-5 w-4 md:w-6 ml-1" />
                    </StandingCell>
                    <StandingCell>
                      <div className="flex items-center gap-1.5 md:gap-3">
                        <Skeleton className="h-5 w-5 md:h-8 md:w-8 rounded" />
                        <Skeleton className="h-3 md:h-4 w-20 md:w-32" />
                      </div>
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      <Skeleton className="h-3 md:h-4 w-4 md:w-6 mx-auto" />
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      <Skeleton className="h-3 md:h-4 w-4 md:w-6 mx-auto" />
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      <Skeleton className="h-3 md:h-4 w-4 md:w-6 mx-auto" />
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      <Skeleton className="h-3 md:h-4 w-4 md:w-6 mx-auto" />
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      <Skeleton className="h-3 md:h-4 w-5 md:w-8 mx-auto" />
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      <Skeleton className="h-3 md:h-4 w-5 md:w-8 mx-auto" />
                    </StandingCell>
                    <StandingCell className={`${cellBaseClass} text-center`}>
                      <Skeleton className="h-3 md:h-4 w-6 md:w-10 mx-auto" />
                    </StandingCell>
                    <StandingCell className={`${cellBaseClass} text-center`}>
                      <Skeleton className="h-3 md:h-5 w-5 md:w-8 mx-auto" />
                    </StandingCell>
                    <StandingCell
                      className={`${cellBaseClass} text-center pr-2 md:pr-0`}
                    >
                      <div className="flex items-center justify-center gap-0.5 md:gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton
                            key={i}
                            className="h-4 w-4 md:h-6 md:w-6 rounded"
                          />
                        ))}
                      </div>
                    </StandingCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message={error}
          helpText="Unable to load standings. Please try again later."
        />
      </FullPage>
    );
  }

  if (sortedStandings.length === 0) {
    return (
      <FullPage center minusHeight={300}>
        <NoDate
          message="No standings available"
          helpText="No standings data available for this league and season."
        />
      </FullPage>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full inline-block md:block">
        {/* Table - visible on all sizes */}
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-card">
              <TableRow>
                {tableColumns.map((column) => (
                  <TableHead
                    key={column.label}
                    className={`${
                      column.align === "left" ? "text-left" : "text-center"
                    } px-2 md:px-4    text-[10px] md:text-xs font-semibold text-muted-foreground  tracking-wider`}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="">
              {sortedStandings.map((standing) => {
                return (
                  <TableRow key={standing.team.id} className="">
                    <StandingCell>
                      <span className="font-bold pl-1 text-foreground text-[10px] md:text-sm">
                        {standing.rank}
                      </span>
                    </StandingCell>
                    <StandingCell>
                      <Link
                        href={`/stats/${leagueId}/${standing.team.id}?season=${season}`}
                        className="flex items-center gap-1.5 md:gap-3 hover:opacity-80 transition-opacity"
                      >
                        {standing.team.logo && (
                          <div className="relative w-5 h-5 md:w-8 md:h-8 flex-shrink-0">
                            <Image
                              src={standing.team.logo}
                              alt={standing.team.name}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 20px, 32px"
                            />
                          </div>
                        )}
                        <span className="font-semibold text-foreground text-[10px] md:text-sm truncate max-w-[80px] md:max-w-none">
                          {standing.team.name}
                        </span>
                      </Link>
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      {standing.all.played}
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      {standing.all.win}
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      {standing.all.draw}
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      {standing.all.lose}
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      {standing.all.goals.for}
                    </StandingCell>
                    <StandingCell className={cellStatClass}>
                      {standing.all.goals.against}
                    </StandingCell>
                    <StandingCell
                      className={`${cellBaseClass} text-center font-semibold text-[10px] md:text-sm ${
                        standing.goalsDiff > 0
                          ? "text-green-600 dark:text-green-400"
                          : standing.goalsDiff < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {standing.goalsDiff > 0 ? "+" : ""}
                      {standing.goalsDiff}
                    </StandingCell>
                    <StandingCell className={`${cellBaseClass} text-center`}>
                      <span className="font-bold text-foreground text-xs md:text-base">
                        {standing.points}
                      </span>
                    </StandingCell>
                    <StandingCell
                      className={`${cellBaseClass} text-center pr-2 md:pr-0`}
                    >
                      {standing.form && (
                        <div className="flex  items-center justify-center gap-0.5 md:gap-1">
                          {standing.form.split("").map((result, idx) => (
                            <span
                              key={idx}
                              className={`w-4  h-4 md:w-6 md:h-6 rounded text-[8px] md:text-xs font-bold flex items-center justify-center ${getFormColor(
                                result
                              )}`}
                            >
                              {result}
                            </span>
                          ))}
                        </div>
                      )}
                    </StandingCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
