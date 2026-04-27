import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Maintenance",
  description:
    "Above The Spread is currently undergoing scheduled maintenance. We'll be back on the pitch shortly.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-hero/20 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl sm:h-96 sm:w-96" />
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary-font)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-font)) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 75%)",
          }}
        />
      </div>

      <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 text-center sm:gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:text-left">
        <div className="flex flex-1 flex-col items-center gap-5 sm:gap-6 lg:items-start">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-font sm:text-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-hero" />
            Scheduled Maintenance
          </span>

          <h1 className="relative text-6xl font-black leading-none tracking-tight text-primary-title sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="relative bg-gradient-to-br from-primary-font via-primary to-primary-hero bg-clip-text text-transparent">
              Half
              <br />
              Time
            </span>
          </h1>

          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-2xl font-bold text-primary-title sm:text-3xl md:text-4xl">
              We&apos;re in the dressing room
            </h2>
            <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base lg:mx-0 lg:max-w-lg">
              Above The Spread is undergoing scheduled maintenance to improve
              your experience. The second half kicks off soon — check back
              shortly.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="inline-flex h-11 items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 text-sm font-semibold text-primary-font sm:text-base">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary-hero" />
              Back soon
            </div>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="h-56 w-56 animate-pulse rounded-full bg-primary-hero/10 blur-2xl sm:h-72 sm:w-72 md:h-80 md:w-80" />
          </div>

          <div className="relative h-56 w-56 sm:h-72 sm:w-72 md:h-80 md:w-80">
            <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border-[3px] border-dashed border-primary/20" />
            <div className="absolute inset-4 animate-[spin_12s_linear_infinite_reverse] rounded-full border-2 border-dotted border-primary-hero/30" />

            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 200 200"
                className="h-36 w-36 drop-shadow-[0_10px_25px_hsl(var(--primary)/0.35)] sm:h-44 sm:w-44 md:h-52 md:w-52"
                role="img"
                aria-label="Soccer ball"
              >
                <defs>
                  <radialGradient id="ballShade" cx="35%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="hsl(var(--card))" />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" />
                  </radialGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="url(#ballShade)"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                />
                <polygon
                  points="100,55 128,75 117,108 83,108 72,75"
                  fill="hsl(var(--primary))"
                />
                <path
                  d="M100 55 L100 30 M128 75 L150 62 M117 108 L140 125 M83 108 L60 125 M72 75 L50 62"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M100 30 L80 18 L100 10 L120 18 Z M150 62 L170 58 L172 78 L155 82 Z M140 125 L158 138 L145 152 L128 142 Z M60 125 L72 142 L55 152 L42 138 Z M50 62 L45 82 L28 78 L30 58 Z"
                  fill="hsl(var(--primary))"
                  opacity="0.85"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  stroke="hsl(var(--primary-font))"
                  strokeWidth="1"
                  opacity="0.25"
                />
              </svg>
            </div>
          </div>

          <div className="absolute -right-2 top-6 hidden rounded-2xl border border-border bg-card px-3 py-2 text-left shadow-lg sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <p className="text-sm font-bold text-primary-font">Maintenance</p>
          </div>

          <div className="absolute -left-2 bottom-8 hidden rounded-2xl border border-border bg-card px-3 py-2 text-left shadow-lg sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Next up
            </p>
            <p className="text-sm font-bold text-primary-hero">
              2nd Half soon
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
