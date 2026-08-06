"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("profile");
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
                {group.is_owner ? t("owner") : t("member")}
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
                  {group.member_count === 1 ? t("singleMember", { count: 1 }) : t("members", { count: group.member_count })}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  {group.post_count} {group.post_count === 1 ? t("singlePost", { count: 1 }) : t("postsCount", { count: group.post_count })}
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
  return (
    <section className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground/80">{emptyMessage}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function UserGroups({ userId }: UserGroupsProps) {
  const t = useTranslations("profile");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserGroupsByUserId(userId, page, PAGE_SIZE);

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const totalPages = data?.total_pages ?? 1;

  const { ownedGroups, followedGroups } = useMemo(() => {
    const owned = items.filter((g) => g.is_owner);
    const followed = items.filter((g) => !g.is_owner);
    return { ownedGroups: owned, followedGroups: followed };
  }, [items]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((sectionIdx) => (
          <section
            key={sectionIdx}
            className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
          >
            <Skeleton className="mb-4 h-4 w-40" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="border-border/50 shadow-none">
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
          </section>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="py-12 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-muted-foreground">{t("noGroupsYet")}</p>
          <p className="mb-4 text-sm text-muted-foreground/80">
            {t("groupsAppearHere")}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href="/discuss/search-group">{t("discoverGroups")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <GroupSection
        title={t("groupsIOwn")}
        groups={ownedGroups}
        emptyMessage={t("noGroupsOwnedDesc")}
      />
      <GroupSection
        title={t("groupsIFollow")}
        groups={followedGroups}
        emptyMessage={t("noGroupsFollowedDesc")}
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
                  {t("pageOf", { page, total: totalPages })}
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
