"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";

interface StatsLeaderProps {
  leagueId: string;
  season: number;
}

export default function StatsLeader({ leagueId, season }: StatsLeaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement stats leaders API call
    // This will fetch top scorers, assists, cards, etc.
    setIsLoading(false);
  }, [leagueId, season]);

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
      <div className="text-center py-8">
        <p className="text-lg font-semibold text-muted-foreground">
          Stats Leaders - Coming Soon
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Top scorers, assists, and other statistics will be displayed here.
        </p>
      </div>
    </div>
  );
}
