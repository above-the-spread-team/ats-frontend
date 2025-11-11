export default function NoGame({ date }: { date: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-border/60 bg-card p-10 text-center shadow-sm">
      <div className="text-5xl">⚽️</div>
      <h2 className="text-lg font-semibold text-foreground">
        No fixtures scheduled
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">
        We couldn’t find any games for{" "}
        <span className="font-semibold">{date}</span>. Try selecting another
        date, or check back later once the fixtures are confirmed.
      </p>
    </div>
  );
}
