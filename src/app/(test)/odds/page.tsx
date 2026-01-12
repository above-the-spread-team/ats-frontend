"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search } from "lucide-react";
import type {
  OddsApiResponse,
  OddsResponseItem,
} from "@/type/footballapi/odds";
import NoData from "@/components/common/no-data";

export default function OddsPage() {
  const [data, setData] = useState<OddsApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search parameters
  const [fixture, setFixture] = useState("");
  const [league, setLeague] = useState("");
  const [date, setDate] = useState("");
  const [bookmaker, setBookmaker] = useState("");
  const [bet, setBet] = useState("");

  const fetchOdds = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fixture) params.append("fixture", fixture);
      if (league) params.append("league", league);
      if (date) params.append("date", date);
      if (bookmaker) params.append("bookmaker", bookmaker);
      if (bet) params.append("bet", bet);

      const response = await fetch(`/api/odds?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch odds");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Football Odds (Pre-Match)</h1>
        <p className="text-muted-foreground mb-4">
          Get odds from fixtures, leagues, or date. Updated every 3 hours.
        </p>

        {/* Search Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Odds</CardTitle>
            <CardDescription>
              Enter at least one parameter to search for odds
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Fixture ID
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 164327"
                  value={fixture}
                  onChange={(e) => setFixture(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  League ID
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 39"
                  value={league}
                  onChange={(e) => setLeague(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Bookmaker ID
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 6"
                  value={bookmaker}
                  onChange={(e) => setBookmaker(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bet ID</label>
                <Input
                  type="number"
                  placeholder="e.g., 4"
                  value={bet}
                  onChange={(e) => setBet(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={fetchOdds} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Odds
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                Found {data.results} result(s) | Page {data.paging.current} of{" "}
                {data.paging.total}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Odds Results */}
          {data.response && data.response.length > 0 ? (
            data.response.map((item: OddsResponseItem, index: number) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex flex-wrap items-center gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        {item.league.name}
                      </CardTitle>
                      <CardDescription>
                        {item.league.country} • Season {item.league.season}
                      </CardDescription>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      <div>Fixture ID: {item.fixture.id}</div>
                      <div>Date: {formatDate(item.fixture.date)}</div>
                      <div>Updated: {formatDate(item.update)}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {item.bookmakers.map((bookmaker, bookmakerIndex) => (
                    <div
                      key={bookmakerIndex}
                      className="mb-6 last:mb-0 border-b last:border-0 pb-6 last:pb-0"
                    >
                      <h3 className="text-xl font-semibold mb-4">
                        {bookmaker.name} (ID: {bookmaker.id})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bookmaker.bets.map((bet, betIndex) => (
                          <Card key={betIndex} className="border">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-sm font-semibold">
                                {bet.name} (ID: {bet.id})
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {bet.values.map((value, valueIndex) => (
                                  <div
                                    key={valueIndex}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                  >
                                    <span className="text-sm font-medium">
                                      {value.value}
                                    </span>
                                    <span className="text-sm font-bold text-primary">
                                      {value.odd}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <NoData
                  message="No odds found"
                  helpText="Try adjusting your search parameters."
                />
              </CardContent>
            </Card>
          )}

          {/* Raw JSON Data */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raw API Response</CardTitle>
              <CardDescription>
                Full JSON data returned by the API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
