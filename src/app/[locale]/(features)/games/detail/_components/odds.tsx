"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NoData from "@/components/common/no-data";
import { useOdds } from "@/services/football-api/odds";
import { TrendingUp, Clock, BookOpen } from "lucide-react";
import type { OddsBet } from "@/type/footballapi/odds";
import { useLocale, useTranslations } from "next-intl";

interface OddsProps {
  fixtureId: number;
}

// Common bet type ids mapped to translation keys
const BET_TYPE_KEYS: Record<number, string> = {
  1: "matchWinner",
  2: "bothTeamsScore",
  3: "doubleChance",
  4: "overUnder",
  5: "handicap",
  6: "correctScore",
  7: "firstGoal",
  8: "exactGoals",
  9: "oddEven",
  10: "asianHandicap",
};

function formatOdd(odd: string | number): string {
  const num = typeof odd === "string" ? parseFloat(odd) : odd;
  return num.toFixed(2);
}

function formatDate(dateString: string, dateLocale: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(dateLocale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BetSection({ bet }: { bet: OddsBet }) {
  const t = useTranslations("games");
  const betKey = BET_TYPE_KEYS[bet.id];
  const betName = betKey ? t(`odds.betTypes.${betKey}`) : bet.name;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        {betName}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {bet.values.map((value, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border"
          >
            <span className="text-xs md:text-sm text-muted-foreground flex-1 truncate">
              {value.value}
            </span>
            <span className="text-sm md:text-base font-bold text-primary ml-2 flex-shrink-0">
              {formatOdd(value.odd)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Odds({ fixtureId }: OddsProps) {
  const t = useTranslations("games");
  const locale = useLocale();
  const dateLocale =
    locale === "ja"
      ? "ja-JP"
      : locale === "zh-TW"
        ? "zh-TW"
        : locale === "zh-CN"
          ? "zh-CN"
          : "en-US";
  const { data: oddsData, isLoading, error } = useOdds(fixtureId, 4);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-48 mx-auto" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Bookmaker Card Skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 px-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bet Section Skeleton (2 sections) */}
            {Array.from({ length: 2 }).map((_, sectionIdx) => (
              <div key={sectionIdx} className="space-y-3">
                {/* Bet Title Skeleton */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-5 w-32" />
                </div>
                {/* Bet Values Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border"
                    >
                      <Skeleton className="h-4 w-16 flex-1" />
                      <Skeleton className="h-4 w-10 ml-2 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle error state
  const errorMessage =
    error instanceof Error
      ? error.message
      : oddsData?.errors && oddsData.errors.length > 0
      ? oddsData.errors.join("\n")
      : null;

  if (errorMessage) {
    return (
      <NoData
        message={t("odds.loadFailed")}
        helpText={errorMessage}
        icon={<TrendingUp className="h-12 w-12" />}
      />
    );
  }

  // Handle empty state
  if (
    !oddsData ||
    !oddsData.response ||
    oddsData.response.length === 0 ||
    oddsData.results === 0
  ) {
    return (
      <NoData
        message={t("odds.noOdds")}
        helpText={t("odds.noOddsHelp")}
        icon={<TrendingUp className="h-12 w-12" />}
      />
    );
  }

  const oddsItem = oddsData.response[0];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-base md:text-lg font-bold flex items-center justify-center gap-2">
          <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          {t("odds.title")}
        </h2>
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Clock className="h-3 w-3 md:h-4 md:w-4" />
          <span>
            {t("odds.lastUpdated", {
              date: formatDate(oddsItem.update, dateLocale),
            })}
          </span>
        </div>
      </div>

      {/* Bookmakers */}
      {oddsItem.bookmakers && oddsItem.bookmakers.length > 0 ? (
        <div className="space-y-4">
          {oddsItem.bookmakers.map((bookmaker) => (
            <Card key={bookmaker.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 px-6">
                  <p className="text-xs text-muted-foreground">
                    {t("odds.providedBy")}
                  </p>
                  <CardTitle className="text-base md:text-lg">
                    {bookmaker.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookmaker.bets && bookmaker.bets.length > 0 ? (
                  bookmaker.bets.map((bet, idx) => (
                    <BetSection key={`${bet.id}-${idx}`} bet={bet} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("odds.noBets")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8">
            <NoData
              message={t("odds.noBookmakers")}
              helpText={t("odds.noBookmakersHelp")}
              icon={<BookOpen className="h-12 w-12" />}
            />
          </CardContent>
        </Card>
      )}

      {/* Footer Note */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        <p>{t("odds.footerNote")}</p>
      </div>
    </div>
  );
}
