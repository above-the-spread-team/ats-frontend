import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The page you are looking for has gone off the pitch. Head back to Above The Spread to catch the latest fixtures, stats, and football discussions.",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary-hero/20 blur-3xl sm:h-96 sm:w-96 lg:h-[500px] lg:w-[500px]" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl sm:h-96 sm:w-96 lg:h-[500px] lg:w-[500px]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-[0.04] dark:opacity-[0.07]"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
          style={{
            maskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 0%, transparent 80%)",
          }}
        >
          <rect x="40" y="40" width="1120" height="720" />
          <line x1="600" y1="40" x2="600" y2="760" />
          <circle cx="600" cy="400" r="110" />
          <circle
            cx="600"
            cy="400"
            r="4"
            fill="hsl(var(--foreground))"
            stroke="none"
          />
          <rect x="40" y="200" width="200" height="400" />
          <rect x="40" y="290" width="80" height="220" />
          <circle
            cx="170"
            cy="400"
            r="4"
            fill="hsl(var(--foreground))"
            stroke="none"
          />
          <path d="M 240 340 A 100 100 0 0 1 240 460" />
          <rect x="960" y="200" width="200" height="400" />
          <rect x="1080" y="290" width="80" height="220" />
          <circle
            cx="1030"
            cy="400"
            r="4"
            fill="hsl(var(--foreground))"
            stroke="none"
          />
          <path d="M 960 340 A 100 100 0 0 0 960 460" />
          <path d="M 40 60 A 20 20 0 0 1 60 40" />
          <path d="M 1140 40 A 20 20 0 0 1 1160 60" />
          <path d="M 1160 740 A 20 20 0 0 1 1140 760" />
          <path d="M 60 760 A 20 20 0 0 1 40 740" />
        </svg>
      </div>

      <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-10 text-center sm:gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:text-left">
        <div className="flex flex-1 flex-col items-center gap-5 sm:gap-6 lg:items-start">
          <span className="inline-flex items-center gap-2 rounded-full border-l-2 border-primary-hero bg-primary/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground sm:text-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-hero" />
            Error 404
          </span>

          <h1 className="relative text-5xl font-black leading-none tracking-tight sm:text-7xl lg:text-9xl">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 select-none text-foreground opacity-30 blur-sm"
            >
              404
            </span>
            <span className="relative text-primary-font">404</span>
          </h1>

          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Off the pitch
            </h2>
            <p className="mx-auto max-w-md text-sm text-foreground sm:text-base lg:mx-0 lg:max-w-lg">
              The page you&apos;re chasing has taken a bad touch and rolled out
              of bounds. Let&apos;s get you back in the game.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="group h-11 gap-2 rounded-full bg-primary-hero px-6 text-sm font-semibold text-white shadow-md hover:bg-primary-hero/90 hover:text-white sm:text-base"
            >
              <Link href="/" aria-label="Back to home">
                Back to Home
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 gap-2 rounded-full border-primary/20 px-6 text-sm font-semibold text-foreground hover:bg-primary/5 hover:text-foreground sm:text-base"
            >
              <Link href="/games" aria-label="View today's fixtures">
                <Search className="h-4 w-4" />
                Browse Fixtures
              </Link>
            </Button>
          </div>

          <Link
            href="/"
            className="group mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors hover:text-foreground/90 sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Or head back to the main feed
          </Link>
        </div>

        <div className="relative flex w-full flex-1 items-center justify-center py-6 sm:py-8 lg:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-48 w-48 animate-pulse rounded-full bg-primary-font/10 blur-2xl sm:h-64 sm:w-64 lg:h-80 lg:w-80" />
          </div>

          <div
            className="relative h-48 w-48 sm:h-64 sm:w-64 lg:h-80 lg:w-80"
            style={{
              filter:
                "drop-shadow(0 12px 30px hsl(var(--primary-font) / 0.35))",
            }}
          >
            <svg
              viewBox="0 0 200 200"
              className="h-full w-full"
              role="img"
              aria-label="Soccer ball"
            >
              <defs>
                <radialGradient id="ballHighlight" cx="32%" cy="28%" r="78%">
                  <stop offset="0%" stopColor="hsl(var(--card))" />
                  <stop offset="55%" stopColor="hsl(var(--secondary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary-font))" />
                </radialGradient>
                <clipPath id="ballClip">
                  <circle cx="100" cy="100" r="86" />
                </clipPath>
              </defs>

              <circle
                cx="100"
                cy="100"
                r="88"
                fill="url(#ballHighlight)"
                stroke="hsl(var(--primary-font))"
                strokeWidth="3"
              />

              <g
                clipPath="url(#ballClip)"
                className="animate-[spin_24s_linear_infinite]"
                style={{ transformOrigin: "100px 100px" }}
              >
                <g fill="hsl(var(--primary-font))">
                  <polygon points="100,74 125,92 115,121 85,121 75,92" />
                  <polygon points="100,60 79,45 87,20 113,20 121,45" />
                  <polygon points="138,88 146,63 172,63 180,88 159,103" />
                  <polygon points="124,132 149,132 157,157 136,172 116,157" />
                  <polygon points="77,132 85,157 64,172 43,157 51,132" />
                  <polygon points="62,88 41,103 20,88 28,63 54,63" />
                </g>
                <g
                  stroke="hsl(var(--primary-font))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                >
                  <line x1="100" y1="74" x2="100" y2="60" />
                  <line x1="125" y1="92" x2="138" y2="88" />
                  <line x1="115" y1="121" x2="124" y2="132" />
                  <line x1="85" y1="121" x2="77" y2="132" />
                  <line x1="75" y1="92" x2="62" y2="88" />
                  <line x1="121" y1="45" x2="146" y2="63" />
                  <line x1="159" y1="103" x2="149" y2="132" />
                  <line x1="116" y1="157" x2="85" y2="157" />
                  <line x1="51" y1="132" x2="41" y2="103" />
                  <line x1="54" y1="63" x2="79" y2="45" />
                </g>
              </g>

              <circle
                cx="100"
                cy="100"
                r="86"
                fill="none"
                stroke="hsl(var(--primary-font))"
                strokeWidth="0.5"
                opacity="0.25"
              />
            </svg>
          </div>

          <div className="absolute right-4 top-4 hidden items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left shadow-lg backdrop-blur sm:flex">
            <span className="h-2 w-2 rounded-full bg-foreground" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground">
                Status
              </p>
              <p className="text-sm font-bold text-foreground">Lost Ball</p>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 hidden items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5 text-left shadow-lg backdrop-blur sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-foreground" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground">
                Next play
              </p>
              <p className="text-sm font-bold text-foreground">
                Kick-off @ /
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
