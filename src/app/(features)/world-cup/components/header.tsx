"use client";

import { useEffect, useState } from "react";

const WORLD_CUP_START = new Date("2026-06-11T00:00:00");
const WORLD_CUP_END = new Date("2026-07-19T00:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = WORLD_CUP_START.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    started: false,
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="bg-black/50 backdrop-blur-md border border-white/15 rounded-xl w-14 h-14 sm:w-16 sm:h-16 md:w-[72px] md:h-[72px] flex items-center justify-center shadow-lg">
        <span className="text-white font-black text-xl sm:text-2xl md:text-3xl tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] font-semibold">
        {label}
      </span>
    </div>
  );
}

const stats = [
  { value: "48", label: "Teams" },
  { value: "104", label: "Matches" },
  { value: "16", label: "Venues" },
  { value: "3", label: "Nations" },
];

const hosts = [
  { flag: "🇺🇸", name: "USA" },
  { flag: "🇨🇦", name: "Canada" },
  { flag: "🇲🇽", name: "Mexico" },
];

export default function WorldCupHeader() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isLive =
    new Date() >= WORLD_CUP_START && new Date() <= WORLD_CUP_END;

  return (
    <div className="relative w-full overflow-hidden min-h-[300px] sm:min-h-[360px] md:min-h-[420px]">
      {/* Background image — different stadium shot from the home promo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1600&q=85&auto=format&fit=crop"
        alt="World Cup 2026 stadium"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />

      {/* Layered overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-yellow-500/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-32 bg-black/40 blur-2xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full min-h-[300px] sm:min-h-[360px] md:min-h-[420px] px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8">

        {/* ── Top: Branding ── */}
        <div className="flex flex-col items-center text-center gap-2 sm:gap-3">

          {/* Status badge */}
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              Live Now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-yellow-500/15 border border-yellow-500/35 text-yellow-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Coming Soon · Jun 11, 2026
            </span>
          )}

          {/* Trophy + Title */}
          <div className="flex flex-col items-center">
            <span className="text-4xl sm:text-5xl md:text-6xl leading-none mb-1" aria-hidden>
              🏆
            </span>
            <h1 className="text-white font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight">
              FIFA World Cup
            </h1>
            <p className="text-yellow-400 font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-none tracking-tight">
              2026™
            </p>
          </div>

          {/* Host countries */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
            {hosts.map(({ flag, name }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/80 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm"
              >
                <span className="text-base leading-none">{flag}</span>
                {name}
              </span>
            ))}
          </div>

          {/* Dates */}
          <p className="text-white/40 text-[11px] sm:text-xs font-medium tracking-widest uppercase">
            11 June — 19 July 2026
          </p>
        </div>

        {/* ── Middle: Stats row ── */}
        <div className="flex items-center justify-center gap-0 mt-4 sm:mt-6 w-full max-w-sm sm:max-w-md">
          {stats.map(({ value, label }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center flex-1 py-2 ${
                i < stats.length - 1
                  ? "border-r border-white/15"
                  : ""
              }`}
            >
              <span className="text-white font-black text-xl sm:text-2xl leading-none">
                {value}
              </span>
              <span className="text-white/45 text-[9px] sm:text-[10px] uppercase tracking-widest font-medium mt-0.5">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Bottom: Countdown ── */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
          <p className="text-white/35 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-semibold">
            {timeLeft.started ? "Tournament Underway" : "Kick-off Countdown"}
          </p>
          {!timeLeft.started && (
            <div className="flex items-end gap-2 sm:gap-3">
              <CountdownUnit value={timeLeft.days} label="Days" />
              <span className="text-white/25 font-bold text-2xl sm:text-3xl mb-4 leading-none select-none">:</span>
              <CountdownUnit value={timeLeft.hours} label="Hours" />
              <span className="text-white/25 font-bold text-2xl sm:text-3xl mb-4 leading-none select-none">:</span>
              <CountdownUnit value={timeLeft.minutes} label="Mins" />
              <span className="text-white/25 font-bold text-2xl sm:text-3xl mb-4 leading-none select-none">:</span>
              <CountdownUnit value={timeLeft.seconds} label="Secs" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
