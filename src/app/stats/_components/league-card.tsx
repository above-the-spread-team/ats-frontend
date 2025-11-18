"use client";

import Image from "next/image";
import Link from "next/link";
import type { LeagueResponseItem, LeagueSeason } from "@/type/league";
import { Earth } from "lucide-react";
interface LeagueCardProps {
  league: LeagueResponseItem;
  season: number;
  getCurrentSeasonData: (
    league: LeagueResponseItem
  ) => LeagueSeason | undefined;
}

export default function LeagueCard({
  league,
  season,
  getCurrentSeasonData,
}: LeagueCardProps) {
  const seasonData = getCurrentSeasonData(league);
  const hasStandings = seasonData?.coverage.standings ?? false;

  const CardContent = (
    <div
      className={`bg-card  rounded-lg px-4 py-3 md:p-4 hover:shadow-lg transition-shadow ${
        hasStandings ? "cursor-pointer" : "opacity-75"
      }`}
    >
      <div className="flex flex-row items-start gap-4">
        {/* League Logo */}
        <div className="relative w-12 h-12 md:w-14 md:h-14   flex-shrink-0">
          {league.league.logo ? (
            <Image
              src={league.league.logo}
              alt={league.league.name}
              fill
              className="object-contain dark:p-1 dark:bg-mygray/50 dark:rounded-lg  "
            />
          ) : (
            <div className="w-full h-full bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-muted-foreground">
                {league.league.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* League Info */}
        <div className="flex-1 space-y-2">
          <h4 className="text-sm  font-semibold text-foreground line-clamp-1">
            {league.league.name}
          </h4>

          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {league.country.name}
            </p>
            {league.country.flag ? (
              <Image
                src={league.country.flag}
                alt={league.country.name}
                width={32}
                height={32}
                className="object-contain w-4 md:w-6"
              />
            ) : (
              <Earth className="w-4 md:w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>
      {/* Season Info */}
      {seasonData && (
        <div className="flex items-center gap-2 mt-1 pt-2 border-t border-border/50">
          {/* <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" /> */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {seasonData.current && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-xl text-xs font-medium bg-primary/20 text-primary-font/70">
                Current Season
              </span>
            )}
            <span className="text-xs text-muted-foreground/90">
              {seasonData.start} - {seasonData.end}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return hasStandings ? (
    <Link
      href={`/stats/${league.league.id}?season=${season}&tab=standings`}
      className="block"
    >
      {CardContent}
    </Link>
  ) : (
    <div>{CardContent}</div>
  );
}
