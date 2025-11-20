"use client";

interface EventsProps {
  fixtureId: number;
}

export default function Events({ fixtureId }: EventsProps) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Events</p>
      <p className="text-sm text-muted-foreground mt-2">
        Fixture ID: {fixtureId}
      </p>
    </div>
  );
}
