"use client";

import { Gavel } from "lucide-react";

interface PenaltyCardProps {
  scored: { total: number; percentage: string };
  missed: { total: number; percentage: string };
  total: number;
}

export default function PenaltyCard({
  scored,
  missed,
  total,
}: PenaltyCardProps) {
  const scoredPercent = total > 0 ? (scored.total / total) * 100 : 0;
  const missedPercent = total > 0 ? (missed.total / total) * 100 : 0;

  return (
    <div className="bg-card border border-border/50 rounded-lg md:rounded-xl p-2.5 md:p-4 shadow-md">
      <div className="flex items-center gap-1 mb-3">
        <div className="p-1 bg-primary/10 rounded-md">
          <Gavel className="w-3 h-3 md:w-4 md:h-4 text-primary" />
        </div>
        <h2 className="text-xs md:text-base font-bold text-foreground">
          Penalties
        </h2>
      </div>

      <div className="space-y-3">
        {/* Total */}
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <span className="text-xs md:text-sm font-semibold text-muted-foreground">
            Total
          </span>
          <span className="text-sm md:text-base font-bold text-foreground">
            {total}
          </span>
        </div>

        {/* Scored and Missed */}
        <div className="grid   gap-3 md:gap-4">
          {/* Scored */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-semibold text-muted-foreground">
                Scored
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground">
                  {scored.percentage}
                </span>
                <span className="text-sm md:text-base font-bold text-green-600 dark:text-green-400">
                  {scored.total}
                </span>
              </div>
            </div>
            {total > 0 && (
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-bar-green rounded-full transition-all duration-500"
                  style={{
                    width: scored.percentage,
                  }}
                />
              </div>
            )}
          </div>

          {/* Missed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-semibold text-muted-foreground">
                Missed
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-muted-foreground">
                  {missed.percentage}
                </span>
                <span className="text-sm md:text-base font-bold text-red-600 dark:text-red-400">
                  {missed.total}
                </span>
              </div>
            </div>
            {total > 0 && (
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-bar-red rounded-full transition-all duration-500"
                  style={{
                    width: missed.percentage,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
