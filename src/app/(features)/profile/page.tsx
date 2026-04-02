"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useUser } from "@/services/fastapi/user";
import {
  type ProfileTabId,
} from "@/app/(features)/profile/_components/user-nav";
import UserInfo from "@/app/(features)/profile/_components/user-info";
import UserPosts from "@/app/(features)/profile/_components/user-posts";
import UserGroups from "@/app/(features)/profile/_components/user-groups";
import Notification from "@/app/(features)/profile/_components/notification";
import UserPredictions from "@/app/(features)/profile/_components/user-predictions";
import ProfileShell, {
  ProfilePageSkeleton,
} from "@/app/(features)/profile/_components/profile-shell";

const VALID_TABS: ProfileTabId[] = [
  "user-info",
  "groups",
  "posts",
  "notifications",
  "predictions",
];

function isValidTab(tab: string | null): tab is ProfileTabId {
  return tab !== null && VALID_TABS.includes(tab as ProfileTabId);
}

function MePageContent() {
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
    return <ProfilePageSkeleton title="My Profile" />;
  }

  return (
    <ProfileShell
      title="My Profile"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "user-info" && (
        <UserInfo
          user={user}
          canEditAvatar
          stats={
            publicProfile
              ? {
                  post_count: publicProfile.post_count,
                  group_count: publicProfile.group_count,
                  comment_count: publicProfile.comment_count,
                  total_likes: publicProfile.total_likes,
                  prediction_accuracy: publicProfile.prediction_accuracy,
                  total_predictions: publicProfile.total_predictions,
                  correct_predictions: publicProfile.correct_predictions,
                }
              : undefined
          }
        />
      )}
      {activeTab === "groups" && <UserGroups userId={user.id} />}
      {activeTab === "posts" && <UserPosts userId={user.id} />}
      {activeTab === "predictions" && <UserPredictions />}
      {activeTab === "notifications" && <Notification />}
    </ProfileShell>
  );
}

export default function MePage() {
  return (
    <Suspense fallback={<ProfilePageSkeleton title="My Profile" />}>
      <MePageContent />
    </Suspense>
  );
}
