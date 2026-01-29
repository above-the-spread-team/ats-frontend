"use client";

import Link from "next/link";
import Image from "next/image";
import { useUserGroups } from "@/services/fastapi/groups";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Lock,
  MessageSquare,
  Plus,
  Search,
  Crown,
  UserPlus,
} from "lucide-react";
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
    <div className="sticky top-0 ">
      <Card className="shadow-lg pb-56 md:pb-6 border-border/50 rounded-none bg-gradient-to-br from-card via-card to-card/95 w-60 md:w-64 xl:w-72  backdrop-blur-sm">
        <CardContent className="py-2 px-3">
          {/* Navigation Section */}
          <nav className="flex flex-col gap-1.5 mb-4 pb-4 border-b border-border/60">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden group",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:text-foreground hover:shadow-sm",
                  )}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />
                  )}
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0 relative z-10 transition-transform duration-300",
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-foreground group-hover:scale-110",
                    )}
                  />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* My Groups Section */}
          <div className="space-y-4 ">
            {/* Owned Groups Section */}
            <div>
              <div className="flex items-center gap-2.5 mb-2 px-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
                  <Crown className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  My Groups
                </h3>
                {ownedGroups.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                    {ownedGroups.length}
                  </span>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-1">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                    >
                      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-28 rounded-md" />
                        <Skeleton className="h-2.5 w-36 rounded-md" />
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
                          "flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-lg shadow-primary/25"
                            : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-md border border-transparent hover:border-border/50",
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                        )}
                        {/* Group Icon */}
                        {group.icon_url ? (
                          <div
                            className={cn(
                              "relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md",
                            )}
                          >
                            <Image
                              src={group.icon_url}
                              alt={group.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "bg-white/20 ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "bg-gradient-to-br from-primary/15 to-primary/5 ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md group-hover:from-primary/20 group-hover:to-primary/10",
                            )}
                          >
                            <Users
                              className={cn(
                                "w-4 h-4",
                                isActive ? "text-white" : "text-primary",
                              )}
                            />
                          </div>
                        )}

                        {/* Group Info */}
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className={cn(
                                "text-sm font-semibold truncate transition-colors",
                                isActive ? "text-white" : "text-foreground",
                              )}
                            >
                              {group.name}
                            </p>
                            {group.is_private && (
                              <Lock
                                className={cn(
                                  "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                                  isActive
                                    ? "text-white/80"
                                    : "text-muted-foreground group-hover:text-foreground/70",
                                )}
                              />
                            )}
                          </div>
                          {group.description && (
                            <p
                              className={cn(
                                "text-xs truncate transition-colors",
                                isActive
                                  ? "text-white/85"
                                  : "text-muted-foreground group-hover:text-muted-foreground/90",
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
                <div className="py-8 text-center rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-yellow-600/60 dark:text-yellow-500/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    No groups owned yet
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Create your first group to get started
                  </p>
                </div>
              )}
            </div>

            {/* Following Groups Section */}
            <div>
              <div className="flex items-center gap-2.5 mb-4 px-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Following
                </h3>
                {followedGroups.length > 0 && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
                    {followedGroups.length}
                  </span>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-1">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                    >
                      <Skeleton className="w-11 h-11 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-28 rounded-md" />
                        <Skeleton className="h-2.5 w-36 rounded-md" />
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
                          "flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                          isActive
                            ? "bg-gradient-to-r from-primary via-primary/95 to-primary text-white shadow-lg shadow-primary/25"
                            : "hover:bg-gradient-to-r hover:from-muted/80 hover:to-muted/60 hover:shadow-md border border-transparent hover:border-border/50",
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
                        )}
                        {/* Group Icon */}
                        {group.icon_url ? (
                          <div
                            className={cn(
                              "relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md",
                            )}
                          >
                            <Image
                              src={group.icon_url}
                              alt={group.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ring-2 transition-all duration-300",
                              isActive
                                ? "bg-white/20 ring-white/30 ring-offset-2 ring-offset-primary shadow-lg"
                                : "bg-gradient-to-br from-primary/15 to-primary/5 ring-border/50 ring-offset-2 ring-offset-background group-hover:ring-primary/30 group-hover:shadow-md group-hover:from-primary/20 group-hover:to-primary/10",
                            )}
                          >
                            <Users
                              className={cn(
                                "w-4 h-4",
                                isActive ? "text-white" : "text-primary",
                              )}
                            />
                          </div>
                        )}

                        {/* Group Info */}
                        <div className="flex-1 min-w-0 relative z-10">
                          <div className="flex items-center gap-2 mb-1">
                            <p
                              className={cn(
                                "text-sm font-semibold truncate transition-colors",
                                isActive ? "text-white" : "text-foreground",
                              )}
                            >
                              {group.name}
                            </p>
                            {group.is_private && (
                              <Lock
                                className={cn(
                                  "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                                  isActive
                                    ? "text-white/80"
                                    : "text-muted-foreground group-hover:text-foreground/70",
                                )}
                              />
                            )}
                          </div>
                          {group.description && (
                            <p
                              className={cn(
                                "text-xs truncate transition-colors",
                                isActive
                                  ? "text-white/85"
                                  : "text-muted-foreground group-hover:text-muted-foreground/90",
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
                <div className="py-8 text-center rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50">
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Not following any groups
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Search for groups to join and start discussing
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
