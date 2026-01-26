"use client";

import { useState } from "react";
import UserIcon from "@/components/common/user-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Users } from "lucide-react";
import { useGroupMembers } from "@/services/fastapi/groups";

interface GroupMemberProps {
  groupId: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function GroupMember({
  groupId,
  page,
  pageSize,
  onPageChange,
}: GroupMemberProps) {
  const {
    data: groupMembersData,
    isLoading: isLoadingGroupMembers,
    error: groupMembersError,
  } = useGroupMembers(groupId, page, pageSize);

  if (isLoadingGroupMembers) {
    return (
      <div className="space-y-3 md:space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (groupMembersError) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Failed to load members
          </h3>
          <p className="text-muted-foreground mb-4">
            {groupMembersError instanceof Error
              ? groupMembersError.message
              : "An error occurred"}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!groupMembersData || groupMembersData.items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No members in this group yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        {groupMembersData.items.map((member) => (
          <Card key={member.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <UserIcon
                  avatarUrl={member.avatar_url}
                  name={member.username}
                  size="medium"
                  variant="primary"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground">
                    {member.username}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination for members */}
      {groupMembersData.total_pages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) {
                      onPageChange(page - 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Generate page numbers */}
              {(() => {
                const pages: (number | "ellipsis")[] = [];
                const totalPages = groupMembersData.total_pages;

                if (totalPages > 0) {
                  pages.push(1);
                }

                if (page > 3) {
                  pages.push("ellipsis");
                }

                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);

                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                  }
                }

                if (page < totalPages - 2) {
                  pages.push("ellipsis");
                }

                if (totalPages > 1) {
                  pages.push(totalPages);
                }

                const uniquePages: (number | "ellipsis")[] = [];
                const seen = new Set<number | "ellipsis">();
                for (const p of pages) {
                  if (!seen.has(p)) {
                    uniquePages.push(p);
                    seen.add(p);
                  }
                }

                return uniquePages.map((p, idx) => {
                  if (p === "ellipsis") {
                    return <PaginationEllipsis key={`ellipsis-${idx}`} />;
                  }
                  return (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          onPageChange(p);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        isActive={page === p}
                        className="cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  );
                });
              })()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < (groupMembersData?.total_pages || 1)) {
                      onPageChange(page + 1);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className={
                    page === (groupMembersData?.total_pages || 1)
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}
