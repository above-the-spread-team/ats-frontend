"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

const NAV_ITEMS: { id: ProfileTabId; label: string; icon: LucideIcon }[] = [
  { id: "user-info", label: "User info", icon: User },
  { id: "groups", label: "Groups", icon: Users },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function ProfileByUserIdPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("user-info");

  const userIdParam = params.userId as string | undefined;
  const isMe = userIdParam === "me";
  const userIdFromUrl = isMe ? null : (userIdParam ? parseInt(userIdParam, 10) : NaN);

  const { data: currentUser, isLoading: currentUserLoading, error: currentUserError } = useCurrentUser();
  const { data: publicUser, isLoading: publicUserLoading, error: publicUserError } = useUser(
    isMe ? null : (Number.isNaN(userIdFromUrl) ? null : userIdFromUrl),
  );

  // "me" -> redirect to /profile
  useEffect(() => {
    if (userIdParam === "me" && !currentUserLoading) {
      if (currentUserError || !currentUser) {
        router.replace("/login");
        return;
      }
      router.replace("/profile");
      return;
    }
  }, [userIdParam, currentUser, currentUserLoading, currentUserError, router]);

  // Require auth for "me"; for numeric id, 404 if user not found
  const isViewingSelf =
    currentUser &&
    !isMe &&
    !Number.isNaN(userIdFromUrl) &&
    userIdFromUrl === currentUser.id;

  const profileUser = isViewingSelf ? currentUser : publicUser;
  const isLoadingProfile = isMe
    ? currentUserLoading
    : isViewingSelf
      ? currentUserLoading
      : publicUserLoading;
  const errorProfile = isViewingSelf ? currentUserError : publicUserError;
  const showEmail = !!isViewingSelf && !!currentUser;
  const showNotifications = !!isViewingSelf;

  useEffect(() => {
    if (currentUserError && currentUserError instanceof Error && currentUserError.message.includes("401")) {
      router.push("/login");
    }
  }, [currentUserError, router]);

  // Invalid userId (missing, NaN) or 404
  if (
    !isMe &&
    (Number.isNaN(userIdFromUrl) ||
      (!publicUserLoading && (publicUserError || !publicUser)))
  ) {
    return (
      <div className="container mx-auto space-y-4 px-4 max-w-6xl py-3 md:py-4">
        <h1 className="text-lg md:text-xl font-bold text-primary-title">
          Profile
        </h1>
        <div className="rounded-b-2xl rounded-r-2xl w-full border border-border/60 bg-card p-8 text-center text-muted-foreground">
          User not found.
        </div>
      </div>
    );
  }

  if (isMe) {
    return null; // redirect handled above
  }

  if (isLoadingProfile || !profileUser) {
    return (
      <div className="container mx-auto space-y-4 px-4 max-w-6xl py-3 md:py-4">
        <h1 className="text-lg md:text-xl font-bold text-primary-title">
          Profile
        </h1>
        <div className="flex flex-row">
          <div className="flex flex-col h-fit w-40 bg-card border border-border/60 rounded-l-2xl overflow-hidden">
            {NAV_ITEMS.filter((item) => showNotifications || item.id !== "notifications").map((item) => (
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

  const navItemsToShow = showNotifications
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.id !== "notifications");

  return (
    <div className="container mx-auto space-y-4 px-4 max-w-6xl py-3 md:py-4">
      <h1 className="text-lg md:text-xl font-bold text-primary-title">
        {isViewingSelf ? "My Profile" : "Profile"}
      </h1>
      <div className="flex flex-row ">
        <div className="flex flex-col h-fit w-40 bg-card border border-border/60 rounded-l-2xl overflow-hidden">
          {navItemsToShow.map((item) => {
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
                    ? "bg-primary/15 text-primary-font font-medium border-r-2 border-primary-font"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="min-h-[700px] rounded-b-2xl rounded-r-2xl w-full border border-border/60 border-l-0 bg-card p-4">
          {activeTab === "user-info" && (
            <UserInfo
              user={profileUser}
              showEmail={showEmail}
              stats={
                isViewingSelf && publicUser
                  ? {
                      post_count: publicUser.post_count,
                      group_count: publicUser.group_count,
                      comment_count: publicUser.comment_count,
                      total_likes: publicUser.total_likes,
                    }
                  : undefined
              }
            />
          )}
          {activeTab === "groups" && <UserGroups userId={profileUser.id} />}
          {activeTab === "posts" && <UserPosts userId={profileUser.id} />}
          {activeTab === "notifications" && showNotifications && <Notification />}
        </div>
      </div>
    </div>
  );
}
