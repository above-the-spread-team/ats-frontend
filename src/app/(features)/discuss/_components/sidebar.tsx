"use client";

import Link from "next/link";
import Image from "next/image";
import { useUserGroups } from "@/services/fastapi/groups";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Lock, MessageSquare, Plus, Search, Crown, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: groupsData, isLoading } = useUserGroups();
  const groups = groupsData?.items || [];

  // Separate groups into owned and followed
  const ownedGroups = groups.filter((group) => group.is_owner);
  const followedGroups = groups.filter((group) => !group.is_owner);

  const navigationLinks = [
    {
      href: "/discuss",
      label: "All Posts",
      icon: MessageSquare,
    },
    {
      href: "/discuss/create-group",
      label: "Create Group",
      icon: Plus,
    },
    {
      href: "/discuss/search-group",
      label: "Search Group",
      icon: Search,
    },
  ];

  return (
    <div className="sticky top-0">
      <Card className="shadow-sm">
        <CardContent className="p-4">
          {/* Navigation Section */}
          <nav className="flex flex-col gap-1 mb-6 pb-6 border-b border-border">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* My Groups Section */}
          <div className="space-y-6">
            {/* Owned Groups Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-4 h-4 text-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  My Groups
                </h3>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg"
                    >
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Owned Groups List */}
              {!isLoading && ownedGroups.length > 0 && (
                <div className="space-y-1">
                  {ownedGroups.map((group) => {
                    const isActive =
                      pathname === `/discuss/group-posts/${group.id}`;
                    return (
                      <Link
                        key={group.id}
                        href={`/discuss/group-posts/${group.id}`}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 group",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted",
                        )}
                      >
                        {/* Group Icon */}
                        {group.icon_url ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-offset-2 ring-offset-background ring-transparent group-hover:ring-primary/20 transition-all">
                            <Image
                              src={group.icon_url}
                              alt={group.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-offset-2 ring-offset-background transition-all",
                              isActive
                                ? "bg-primary-foreground/20 ring-primary/30"
                                : "bg-primary/10 ring-transparent group-hover:ring-primary/20",
                            )}
                          >
                            <Users
                              className={cn(
                                "w-5 h-5",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          </div>
                        )}

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-foreground",
                              )}
                            >
                              {group.name}
                            </p>
                            {group.is_private && (
                              <Lock
                                className={cn(
                                  "w-3 h-3 flex-shrink-0",
                                  isActive
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground",
                                )}
                              />
                            )}
                          </div>
                          {group.description && (
                            <p
                              className={cn(
                                "text-xs truncate",
                                isActive
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              {group.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Empty State for Owned Groups */}
              {!isLoading && ownedGroups.length === 0 && (
                <div className="py-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                    <Crown className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No groups owned yet
                  </p>
                </div>
              )}
            </div>

            {/* Following Groups Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-4 h-4 text-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  Following
                </h3>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-2 rounded-lg"
                    >
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-2.5 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Following Groups List */}
              {!isLoading && followedGroups.length > 0 && (
                <div className="space-y-1">
                  {followedGroups.map((group) => {
                    const isActive =
                      pathname === `/discuss/group-posts/${group.id}`;
                    return (
                      <Link
                        key={group.id}
                        href={`/discuss/group-posts/${group.id}`}
                        className={cn(
                          "flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 group",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted",
                        )}
                      >
                        {/* Group Icon */}
                        {group.icon_url ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-offset-2 ring-offset-background ring-transparent group-hover:ring-primary/20 transition-all">
                            <Image
                              src={group.icon_url}
                              alt={group.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-offset-2 ring-offset-background transition-all",
                              isActive
                                ? "bg-primary-foreground/20 ring-primary/30"
                                : "bg-primary/10 ring-transparent group-hover:ring-primary/20",
                            )}
                          >
                            <Users
                              className={cn(
                                "w-5 h-5",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          </div>
                        )}

                        {/* Group Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-foreground",
                              )}
                            >
                              {group.name}
                            </p>
                            {group.is_private && (
                              <Lock
                                className={cn(
                                  "w-3 h-3 flex-shrink-0",
                                  isActive
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground",
                                )}
                              />
                            )}
                          </div>
                          {group.description && (
                            <p
                              className={cn(
                                "text-xs truncate",
                                isActive
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground",
                              )}
                            >
                              {group.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Empty State for Following Groups */}
              {!isLoading && followedGroups.length === 0 && (
                <div className="py-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Not following any groups
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
