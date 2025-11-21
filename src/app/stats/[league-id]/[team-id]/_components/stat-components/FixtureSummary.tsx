"use client";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  Plane,
} from "lucide-react";

interface FixtureSummaryProps {
  played: { total: number; home: number; away: number };
  wins: { total: number; home: number; away: number };
  draws: { total: number; home: number; away: number };
  loses: { total: number; home: number; away: number };
}

export default function FixtureSummary({
  played,
  wins,
  draws,
  loses,
}: FixtureSummaryProps) {
  const stats = [
    {
      icon: BarChart3,
      label: "Played",
      total: played.total,
      home: played.home,
      away: played.away,
      color: "text-foreground",
      bgColor: "bg-muted/30",
    },
    {
      icon: TrendingUp,
      label: "Wins",
      total: wins.total,
      home: wins.home,
      away: wins.away,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Minus,
      label: "Draws",
      total: draws.total,
      home: draws.home,
      away: draws.away,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: TrendingDown,
      label: "Losses",
      total: loses.total,
      home: loses.home,
      away: loses.away,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="bg-card border border-border/50 rounded-lg md:rounded-xl p-3 md:p-4 shadow-md">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={`p-1.5 ${stat.bgColor} rounded-md`}>
                    <Icon
                      className={`w-3 h-3 md:w-3.5 md:h-3.5 ${stat.color}`}
                    />
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
                <p className={`text-xs md:text-sm font-bold ${stat.color}`}>
                  {stat.total}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs text-muted-foreground pt-1.5 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span className="font-medium">{stat.home}</span>
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span className="flex items-center gap-1">
                  <Plane className="w-3 h-3" />
                  <span className="font-medium">{stat.away}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
