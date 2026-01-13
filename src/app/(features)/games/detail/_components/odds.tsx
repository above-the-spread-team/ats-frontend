"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NoData from "@/components/common/no-data";
import { useOdds } from "@/services/football-api/odds";
import { TrendingUp, Clock, BookOpen } from "lucide-react";
import type { OddsBet } from "@/type/footballapi/odds";

interface OddsProps {
  fixtureId: number;
}

// Common bet type names mapping
const BET_TYPE_NAMES: Record<number, string> = {
  1: "Match Winner",
  2: "Both Teams Score",
  3: "Double Chance",
  4: "Over/Under",
  5: "Handicap",
  6: "Correct Score",
  7: "First Goal",
  8: "Exact Goals",
  9: "Odd/Even",
  10: "Asian Handicap",
};

function formatOdd(odd: string | number): string {
  const num = typeof odd === "string" ? parseFloat(odd) : odd;
  return num.toFixed(2);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BetSection({ bet }: { bet: OddsBet }) {
  const betName = BET_TYPE_NAMES[bet.id] || bet.name;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-primary" />
        {betName}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
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
  const { data: oddsData, isLoading, error } = useOdds(fixtureId, 4);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
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
        message="Failed to load odds"
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
        message="No odds available"
        helpText="Odds for this fixture are not available yet. Pre-match odds are typically available 1-14 days before the match."
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
          Pre-Match Odds
        </h2>
        <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-muted-foreground">
          <Clock className="h-3 w-3 md:h-4 md:w-4" />
          <span>Last updated: {formatDate(oddsItem.update)}</span>
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
                    Bets provided by
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
                    No bets available for this bookmaker
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
              message="No bookmakers available"
              helpText="No odds data is available for this fixture."
              icon={<BookOpen className="h-12 w-12" />}
            />
          </CardContent>
        </Card>
      )}

      {/* Footer Note */}
      <div className="text-center text-xs text-muted-foreground pt-2">
        <p>
          Odds are updated every 3 hours. Pre-match odds are available 1-14 days
          before the fixture.
        </p>
      </div>
    </div>
  );
}
