"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function LeagueCardSkeleton() {
  return (
    <div className="bg-card rounded-lg px-4 py-3 md:p-4">
      <div className="flex flex-row items-start gap-4">
        {/* Logo Skeleton */}
        <Skeleton className="w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0" />

        {/* Info Skeleton */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Flag Skeleton */}
        <Skeleton className="w-4 h-4 md:w-6 md:h-6 flex-shrink-0" />
      </div>
    </div>
  );
}

