"use client";

interface FixturePlayersProps {
  fixtureId: number;
}

export default function FixturePlayers({ fixtureId }: FixturePlayersProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Fixture Players</p>
      <p className="text-sm text-muted-foreground mt-2">
        Fixture ID: {fixtureId}
      </p>
    </div>
  );
}
