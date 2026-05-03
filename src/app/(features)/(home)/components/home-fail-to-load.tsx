interface HomeFailToLoadProps {
  message?: string;
  description?: string;
}

export default function HomeFailToLoad({
  message = "Failed to load",
  description = "Something went wrong. Please try again later.",
}: HomeFailToLoadProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 sm:px-6 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex-shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-destructive"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
