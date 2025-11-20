"use client";

interface LineupsProps {
  fixtureId: number;
}

export default function Lineups({ fixtureId }: LineupsProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Lineups</p>
      <p className="text-sm text-muted-foreground mt-2">
        Fixture ID: {fixtureId}
      </p>
    </div>
  );
}
