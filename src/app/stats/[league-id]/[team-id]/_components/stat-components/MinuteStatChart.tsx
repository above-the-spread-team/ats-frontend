"use client";

import { LucideIcon } from "lucide-react";

interface MinuteStat {
  total: number | null;
  percentage?: string | null;
}

interface MinuteStatChartProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  data: Record<string, MinuteStat> | { [key: string]: MinuteStat };
  valueColor: string;
  barColor: string;
}

export default function MinuteStatChart({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  data,
  valueColor,
  barColor,
}: MinuteStatChartProps) {
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
        {Object.entries(data).map(
          ([minute, stat]) =>
            stat.total !== null && (
              <div key={minute} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm font-medium text-foreground">
                    {minute}&apos;
                  </span>
                  <div className="flex items-center gap-2 justify-end  pr-4">
                    <span
                      className={`text-xs md:text-sm font-bold ${valueColor}`}
                    >
                      {stat.total}
                    </span>
                    {stat.percentage && stat.percentage !== null && (
                      <span className="text-xs md:text-sm text-muted-foreground w-8 text-right">
                        {stat.percentage}
                      </span>
                    )}
                  </div>
                </div>
                {stat.percentage && stat.percentage !== null && (
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-500`}
                      style={{
                        width: stat.percentage,
                      }}
                    />
                  </div>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
}
