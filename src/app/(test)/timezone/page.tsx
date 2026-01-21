"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface TimezoneApiResponse {
  get: string;
  parameters: Record<string, never>;
  errors: string[] | Record<string, unknown>;
  results: number;
  paging: { current: number; total: number };
  response: string[];
}

export default function TimezoneTestPage() {
  const [data, setData] = useState<TimezoneApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch("/api/timezone", { cache: "default" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json: TimezoneApiResponse) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!data?.response) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.response;
    return data.response.filter((tz) => tz.toLowerCase().includes(q));
  }, [data?.response, search]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Timezone Test (Football API)</h1>

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Timezones ({data.results})</CardTitle>
              <Input
                placeholder="Search (e.g. Asia, Taipei, Europe)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Showing {filtered.length} of {data.results}
              </p>
              <ul className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto font-mono text-sm">
                {filtered.map((tz) => (
                  <li key={tz} className="py-1 px-2 rounded hover:bg-muted">
                    {tz}
                  </li>
                ))}
              </ul>
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-sm">No matches.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raw JSON response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-md p-4 overflow-auto max-h-[50vh] font-mono text-xs">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
