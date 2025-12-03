"use client";

import { LucideIcon } from "lucide-react";

interface BiggestStat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
}

interface BiggestStatSectionProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  stats: BiggestStat[];
}

export default function BiggestStatSection({
  icon: Icon,
  iconColor,
  title,
  stats,
}: BiggestStatSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex  items-center gap-1.5 pb-2 border-b border-border/50">
        <Icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${iconColor}`} />
        <p className="text-xs md:text-sm font-bold text-foreground">{title}</p>
      </div>
      <div className="space-y-1.5">
        {stats.map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-1.5 rounded-md bg-muted/40"
            >
              <div className="flex items-center gap-1.5">
                {StatIcon && (
                  <StatIcon className="w-2.5 h-2.5 text-muted-foreground" />
                )}
                <span className="text-[11px] md:text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
              <span
                className={`text-[11px] md:text-xs font-bold ${
                  stat.color || "text-foreground"
                }`}
              >
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
