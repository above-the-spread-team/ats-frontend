"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
      <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
        <span className="text-white font-black text-base sm:text-xl tabular-nums leading-none">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-white/80 text-[10px] uppercase tracking-widest mt-1 font-semibold">
        {label}
      </span>
    </div>
  );
}

export default function Promotion() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const t = useTranslations("promotion");
  const ct = useTranslations("common");

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl group">
      {/* Background */}
      <Image
        src="https://images.unsplash.com/photo-1637203722998-6b3dc1df589e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="FIFA World Cup 2026"
        fill
        className="absolute inset-0 object-cover object-bottom transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 896px"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute -left-10 -top-10 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      {/* Content */}
      {/* Top-right: countdown */}
      <div className="hidden md:flex absolute top-5 right-5 z-20 flex-col items-end">
        <p className="text-white/70 text-[11px] uppercase tracking-widest font-semibold mb-1.5">
          {t("kickOffIn")}
        </p>
        <div className="flex items-end gap-1.5">
          <CountdownUnit value={timeLeft.days} label={ct("days")} />
          <span className="text-white/50 font-bold text-base mb-3.5 leading-none">
            :
          </span>
          <CountdownUnit value={timeLeft.hours} label={ct("hours")} />
          <span className="text-white/50 font-bold text-base mb-3.5 leading-none">
            :
          </span>
          <CountdownUnit value={timeLeft.minutes} label={ct("minutes")} />
          <span className="text-white/50 font-bold text-base mb-3.5 leading-none">
            :
          </span>
          <CountdownUnit value={timeLeft.seconds} label={ct("seconds")} />
        </div>
        <p className="text-white/80 text-[11px] mt-1.5">{t("worldCupDates")}</p>
      </div>

      <div className="relative z-10 p-5 sm:p-7 md:p-8">
        {/* Left: text */}
        <div className="max-w-lg space-y-4">
          <div className="space-y-1">
            <h2 className="text-white font-black text-xl sm:text-2xl md:text-3xl leading-tight tracking-tight">
              {t("bannerText")}
            </h2>
            {/* Event pills */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t("dailyPrize")}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full">
                {t("bracketPrize")}
              </span>
            </div>
            <ul className="text-white/90 text-xs md:text-sm font-semibold leading-relaxed max-w-md space-y-1.5 list-none">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 font-bold text-emerald-400">
                  ①
                </span>
                {t("description")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 font-bold text-amber-400">
                  ②
                </span>
                {t("bracketDesc")}
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Link
            href="/world-cup/prediction"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-black font-bold text-sm px-5 py-2.5 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            {t("exploreButton")}
            <svg
              className="w-3.5 h-3.5"
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
          </Link>
        </div>
      </div>
    </div>
  );
}
