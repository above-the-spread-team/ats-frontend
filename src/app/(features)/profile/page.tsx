"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Users, FileText, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useUser } from "@/services/fastapi/user";
import { cn } from "@/lib/utils";
import UserInfo from "@/app/(features)/profile/_components/user-info";
import UserPosts from "@/app/(features)/profile/_components/user-posts";
import UserGroups from "@/app/(features)/profile/_components/user-groups";
import Notification from "@/app/(features)/profile/_components/notification";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileTabId = "user-info" | "groups" | "posts" | "notifications";

const NAV_ITEMS: {
  id: ProfileTabId;
  label: string;
  /** Short label for mobile; empty = icon only on mobile */
  shortLabel: string;
  icon: LucideIcon;
}[] = [
  { id: "user-info", label: "User info", shortLabel: "Info", icon: User },
  { id: "groups", label: "Groups", shortLabel: "Group", icon: Users },
  { id: "posts", label: "Posts", shortLabel: "Post", icon: FileText },
  { id: "notifications", label: "Notifications", shortLabel: "", icon: Bell },
];

const VALID_TABS: ProfileTabId[] = [
  "user-info",
  "groups",
  "posts",
  "notifications",
];

function isValidTab(tab: string | null): tab is ProfileTabId {
  return tab !== null && VALID_TABS.includes(tab as ProfileTabId);
}

export default function MePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab: ProfileTabId = useMemo(() => {
    const tab = searchParams.get("tab");
    return isValidTab(tab) ? tab : "user-info";
  }, [searchParams]);

  const { data: user, isLoading, error } = useCurrentUser();
  const { data: publicProfile } = useUser(user?.id ?? null);

  const setActiveTab = (tab: ProfileTabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (error && error instanceof Error && error.message.includes("401")) {
      router.push("/login");
    }
  }, [error, router]);

  if (isLoading || !user) {
    return (
      <div className="container mx-auto space-y-4 px-4 max-w-6xl py-3 md:py-4">
        <h1 className="text-lg md:text-xl font-bold text-primary-title">
          My Profile
        </h1>
        <div className="flex flex-row">
          <div className="flex flex-col h-fit w-40 bg-card border border-border/60 rounded-l-2xl overflow-hidden">
            {NAV_ITEMS.map((item) => (
              <Skeleton key={item.id} className="m-2 h-10 rounded-lg" />
            ))}
          </div>
          <div className="min-h-[700px] rounded-b-2xl rounded-r-2xl w-full border border-border/60 border-l-0 bg-card p-4">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-4  px-4 max-w-6xl  py-3 md:py-4">
      {/* Header */}
      <h1 className="text-lg md:text-xl font-bold text-primary-title">
        My Profile
      </h1>
      {/* Main content */}
      <div className="flex flex-col md:flex-row ">
        {/* Left side Navigation - URL ?tab= controls active tab */}
        <div className="flex flex-row md:flex-col h-fit justify-between w-full gap-0  md:w-40 bg-card border border-border/60 rounded-t-2xl md:rounded-r-none md:rounded-l-2xl overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary-font font-medium border-b-2 md:border-b-0 md:border-r-2 border-primary-font"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {/* Mobile: short label or icon only (e.g. no label for Notifications) */}
                {item.shortLabel ? (
                  <span className="md:hidden">{item.shortLabel}</span>
                ) : null}
                {/* Desktop: full label */}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
        {/* Right side Content - render panel by activeTab */}
        <div className="min-h-[700px] rounded-b-2xl rounded-t-none md:rounded-r-2xl w-full border border-border/60 border-l-0 bg-card p-4">
          {activeTab === "user-info" && (
            <UserInfo
              user={user}
              stats={
                publicProfile
                  ? {
                      post_count: publicProfile.post_count,
                      group_count: publicProfile.group_count,
                      comment_count: publicProfile.comment_count,
                      total_likes: publicProfile.total_likes,
                    }
                  : undefined
              }
            />
          )}
          {activeTab === "groups" && <UserGroups userId={user.id} />}
          {activeTab === "posts" && <UserPosts userId={user.id} />}
          {activeTab === "notifications" && <Notification />}
        </div>
      </div>
    </div>
  );
}
