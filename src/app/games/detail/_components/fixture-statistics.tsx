"use client";

interface FixtureStatisticsProps {
  fixtureId: number;
}

export default function FixtureStatistics({
  fixtureId,
}: FixtureStatisticsProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Fixture Statistics</p>
      <p className="text-sm text-muted-foreground mt-2">
        Fixture ID: {fixtureId}
      </p>
    </div>
  );
}
