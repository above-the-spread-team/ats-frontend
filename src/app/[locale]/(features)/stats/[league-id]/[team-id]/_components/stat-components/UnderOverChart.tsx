"use client";

import { LucideIcon } from "lucide-react";

interface UnderOverStat {
  over: number;
  under: number;
}

interface UnderOverChartProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  data: Record<string, UnderOverStat> | { [key: string]: UnderOverStat };
}

export default function UnderOverChart({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  data,
}: UnderOverChartProps) {
  return (
    <div className="bg-card border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
      <div className="flex items-center gap-1 mb-2.5">
        <div className={`p-1 ${iconBgColor} rounded-md`}>
          <Icon className={`w-3 h-3 md:w-4 md:h-4 ${iconColor}`} />
        </div>
        <h2 className="text-xs md:text-base font-bold text-foreground">
          {title}
        </h2>
      </div>
      <div className="space-y-2">
        {Object.entries(data).map(([threshold, stat]) => {
          const total = stat.over + stat.under;
          const overPercent = total > 0 ? (stat.over / total) * 100 : 0;
          return (
            <div key={threshold} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm font-medium text-foreground">
                  {threshold}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-green-600 dark:text-green-400">
                    Over: <span className="font-bold">{stat.over}</span>
                  </span>
                  <span className="text-xs md:text-sm text-red-600 dark:text-red-400">
                    Under: <span className="font-bold">{stat.under}</span>
                  </span>
                </div>
              </div>
              {total > 0 && (
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-bar-green transition-all duration-500"
                    style={{ width: `${overPercent}%` }}
                  />
                  <div
                    className="h-full bg-bar-red transition-all duration-500"
                    style={{ width: `${100 - overPercent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
