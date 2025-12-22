"use client";

import SectionSkeleton from "./section-skeleton";

export default function StatsSkeleton() {
  return (
    <div className="space-y-4 mt-4 pb-10">
      {/* Sections Skeleton */}
      <div className="space-y-8">
        <SectionSkeleton cardCount={3} />
        <SectionSkeleton cardCount={5} />
      </div>
    </div>
  );
}
