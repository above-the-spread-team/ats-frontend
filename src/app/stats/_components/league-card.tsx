"use client";

import Image from "next/image";
import Link from "next/link";
import type { LeagueResponseItem, LeagueSeason } from "@/type/league";

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
              className="object-contain  "
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

          <p className="text-sm text-muted-foreground">{league.country.name}</p>

          {seasonData && (
            <>
              {seasonData.current && (
                <span className="inline-block px-2 py-0.5 bg-primary/20 text-primary-font rounded-full text-xs font-semibold">
                  Current Season
                </span>
              )}
              <div className="text-xs text-muted-foreground">
                {seasonData.start} - {seasonData.end}
              </div>
            </>
          )}
        </div>
        {league.country.flag && (
          <Image
            src={league.country.flag}
            alt={league.country.name}
            width={32}
            height={32}
            className="object-contain w-4 md:w-6"
          />
        )}
      </div>
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
