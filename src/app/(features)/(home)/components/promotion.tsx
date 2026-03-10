"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const WORLD_CUP_START = new Date("2026-06-11T00:00:00");

function getTimeLeft() {
  const now = new Date();
  const diff = WORLD_CUP_START.getTime() - now.getTime();

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[40px] sm:min-w-[52px] text-center">
        <span className="text-white font-bold text-lg sm:text-2xl md:text-3xl tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-white/50 text-[9px] sm:text-[10px] uppercase tracking-widest mt-1 font-medium">
        {label}
      </span>
    </div>
  );
}

export default function Promotion() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Link href="/world-cup" className="block group focus:outline-none">
      <div className="relative w-full overflow-hidden rounded-xl md:rounded-2xl cursor-pointer min-h-[240px] sm:min-h-[280px] md:min-h-[300px]">
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&q=80&auto=format&fit=crop"
          alt="FIFA World Cup 2026 stadium"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Glow accents */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 w-40 h-40 rounded-full bg-red-500/10 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-4 sm:p-6 md:p-8 min-h-[240px] sm:min-h-[280px] md:min-h-[300px]">
          {/* Top row: title + CTA */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest px-2 sm:px-2.5 py-1 rounded-full mb-2 sm:mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
                Coming Soon
              </span>

              {/* Title */}
              <h2 className="text-white font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-none tracking-tight">
                FIFA World Cup
              </h2>
              <p className="text-yellow-400 font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-none tracking-tight">
                2026 ™
              </p>

              {/* Host countries */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:mt-3">
                {["🇺🇸 USA", "🇨🇦 Canada", "🇲🇽 Mexico"].map((c) => (
                  <span
                    key={c}
                    className="text-white/70 text-[10px] sm:text-xs font-medium bg-white/10 px-2 py-0.5 rounded-full whitespace-nowrap"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {/* Dates */}
              <p className="text-white/50 text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-medium tracking-wide">
                11 Jun — 19 Jul 2026 · 48 Teams · 16 Venues
              </p>
            </div>

            {/* CTA — always visible, adapts size */}
            <span className="flex-shrink-0 inline-flex items-center gap-1 sm:gap-1.5 bg-white text-black text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full group-hover:bg-yellow-400 transition-colors duration-300 mt-1">
              <span className="hidden xs:inline">Explore</span>
              <span className="xs:hidden">Go</span>
              <svg
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          </div>

          {/* Bottom row: countdown */}
          <div className="mt-4 sm:mt-6">
            <p className="text-white/40 text-[9px] sm:text-[10px] uppercase tracking-widest mb-1.5 sm:mb-2 font-medium">
              Kick-off countdown
            </p>
            <div className="flex items-end gap-1.5 sm:gap-2.5 md:gap-3">
              <CountdownUnit value={timeLeft.days} label="Days" />
              <span className="text-white/30 font-bold text-lg sm:text-2xl mb-3 leading-none">
                :
              </span>
              <CountdownUnit value={timeLeft.hours} label="Hrs" />
              <span className="text-white/30 font-bold text-lg sm:text-2xl mb-3 leading-none">
                :
              </span>
              <CountdownUnit value={timeLeft.minutes} label="Min" />
              <span className="text-white/30 font-bold text-lg sm:text-2xl mb-3 leading-none">
                :
              </span>
              <CountdownUnit value={timeLeft.seconds} label="Sec" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
