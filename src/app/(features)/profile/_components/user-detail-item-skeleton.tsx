import { Skeleton } from "@/components/ui/skeleton";

export default function UserDetailItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-card">
      <Skeleton className="h-5 w-5 mt-0.5 shrink-0 rounded" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>
    </div>
  );
}

