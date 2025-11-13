"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/common/loading";
import FullPage from "@/components/common/full-page";

interface TeamsProps {
  leagueId: string;
  season: number;
}

export default function Teams({ leagueId, season }: TeamsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement teams API call
    // This will fetch all teams in the league
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
          Teams - Coming Soon
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          All teams in the league will be displayed here.
        </p>
      </div>
    </div>
  );
}
