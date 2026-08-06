interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function FixturesError({ message, onRetry }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-destructive/30 bg-destructive/10 p-8 text-center shadow-sm">
      <div className="text-5xl">🚫</div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-destructive">
          Unable to load fixtures
        </h2>
        <p className="max-w-lg text-sm text-destructive/80 whitespace-pre-line">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-full bg-destructive text-destructive-foreground px-4 py-2 text-sm font-semibold shadow hover:bg-destructive/90 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
