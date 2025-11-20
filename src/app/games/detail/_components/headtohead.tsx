"use client";

interface HeadtoHeadProps {
  homeTeamId: number;
  awayTeamId: number;
  leagueId: number;
  season: number;
}

export default function HeadtoHead({
  homeTeamId,
  awayTeamId,
  leagueId,
  season,
}: HeadtoHeadProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Head to Head</p>
      <p className="text-sm text-muted-foreground mt-2">
        Team {homeTeamId} vs Team {awayTeamId}
      </p>
    </div>
  );
}
