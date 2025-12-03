"use client";

import { LucideIcon } from "lucide-react";

interface StatRow {
  label: string;
  value: string | number;
  subRows?: Array<{ label: string; value: string | number; avg?: string }>;
}

interface StatCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  rows: StatRow[];
}

export default function StatCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  rows,
}: StatCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
      <div className="flex items-center gap-1 mb-2">
        <div className={`p-1 ${iconBgColor} rounded-md`}>
          <Icon className={`w-3 h-3 md:w-4 md:h-4 ${iconColor}`} />
        </div>
        <h2 className="text-xs md:text-sm font-bold text-foreground">
          {title}
        </h2>
      </div>
      <div className="space-y-1">
        {rows.map((row, idx) => (
          <div key={idx}>
            <div className="flex justify-between items-center py-0.5 0">
              <span className="text-xs md:text-sm text-muted-foreground">
                {row.label}
              </span>
              <span className="text-xs md:text-sm font-bold text-foreground">
                {row.value}
              </span>
            </div>
            {row.subRows && (
              <div className="flex  flex-col gap-0.5 border-t border-border/50 py-0.5">
                {row.subRows.map((subRow, subIdx) => (
                  <div
                    key={subIdx}
                    className="flex justify-between items-center"
                  >
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {subRow.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {subRow.avg && (
                        <span className="text-xs md:text-sm text-muted-foreground text-right">
                          avg: {subRow.avg}
                        </span>
                      )}
                      <span className="text-xs md:text-sm w-6 text-right text-foreground font-medium">
                        {subRow.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
