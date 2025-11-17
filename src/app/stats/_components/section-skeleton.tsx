"use client";

import { Skeleton } from "@/components/ui/skeleton";
import LeagueCardSkeleton from "./league-card-skeleton";

interface SectionSkeletonProps {
  cardCount?: number;
}

export default function SectionSkeleton({ cardCount = 6 }: SectionSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Section Header Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="w-24 h-6" />
        <Skeleton className="w-8 h-5 rounded-full" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <LeagueCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

