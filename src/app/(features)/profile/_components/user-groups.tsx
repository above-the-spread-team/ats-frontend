"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, Lock, FileText } from "lucide-react";
import type { GroupListItemWithCounts } from "@/type/fastapi/groups";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useUserGroupsByUserId } from "@/services/fastapi/user";

const PAGE_SIZE = 10;

export interface UserGroupsProps {
  userId: number;
}

function GroupCard({ group }: { group: GroupListItemWithCounts }) {
  return (
    <Link href={`/discuss/group-posts/${group.id}`} className="block">
      <Card className="h-full border-border/50 overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {group.icon_url ? (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-border/50">
                <Image
                  src={group.icon_url}
                  alt={group.name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-border/50">
                <Users className="h-6 w-6 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm md:text-base font-semibold text-foreground">
                  {group.name}
                </h3>
                {group.is_owner && (
                  <Crown className="h-4 w-4 flex-shrink-0 text-amber-500" />
                )}
                {group.is_private && (
                  <Lock className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {group.is_owner ? "Owner" : "Member"}
              </p>
              {/* {group.description && (
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground/90">
                  {group.description}
                </p>
              )} */}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {group.member_count}{" "}
                  {group.member_count === 1 ? "member" : "members"}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {group.post_count} {group.post_count === 1 ? "post" : "posts"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function GroupSection({
  title,
  groups,
  emptyMessage,
}: {
  title: string;
  groups: GroupListItemWithCounts[];
  emptyMessage: string;
}) {
  if (groups.length === 0) {
    return (
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="text-sm text-muted-foreground/80">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}

export default function UserGroups({ userId }: UserGroupsProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserGroupsByUserId(userId, page, PAGE_SIZE);

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const { ownedGroups, followedGroups } = useMemo(() => {
    const owned = items.filter((g) => g.is_owner);
    const followed = items.filter((g) => !g.is_owner);
    return { ownedGroups: owned, followedGroups: followed };
  }, [items]);

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-muted-foreground">No groups yet</p>
          <p className="mb-4 text-sm text-muted-foreground/80">
            Groups you own or follow will appear here.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/discuss/search-group">Discover groups</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <GroupSection
        title="Groups I own"
        groups={ownedGroups}
        emptyMessage="No groups on this page. Groups you created appear here."
      />
      <GroupSection
        title="Groups I follow"
        groups={followedGroups}
        emptyMessage="No groups on this page. Groups you joined (and don’t own) appear here."
      />
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage((p) => p - 1);
                  }}
                  className={
                    page <= 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-2 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage((p) => p + 1);
                  }}
                  className={
                    page >= totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
