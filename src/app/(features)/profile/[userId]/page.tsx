"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useUser } from "@/services/fastapi/user";
import { type ProfileTabId } from "@/app/(features)/profile/_components/user-nav";
import UserInfo from "@/app/(features)/profile/_components/user-info";
import UserPosts from "@/app/(features)/profile/_components/user-posts";
import UserGroups from "@/app/(features)/profile/_components/user-groups";
import Notification from "@/app/(features)/profile/_components/notification";
import UserPredictions from "@/app/(features)/profile/_components/user-predictions";
import ProfileShell, {
  ProfilePageSkeleton,
} from "@/app/(features)/profile/_components/profile-shell";

export default function ProfileByUserIdPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState<ProfileTabId>("user-info");

  const userIdParam = params.userId as string | undefined;
  const isMe = userIdParam === "me";
  const userIdFromUrl = isMe
    ? null
    : userIdParam
      ? parseInt(userIdParam, 10)
      : NaN;

  const {
    data: currentUser,
    isLoading: currentUserLoading,
    error: currentUserError,
  } = useCurrentUser();
  const {
    data: publicUser,
    isLoading: publicUserLoading,
    error: publicUserError,
  } = useUser(isMe ? null : Number.isNaN(userIdFromUrl) ? null : userIdFromUrl);

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
  const showEmail = !!isViewingSelf && !!currentUser;
  const showNotifications = !!isViewingSelf;
  const pageTitle = isViewingSelf ? "My Profile" : "Profile";

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
    return <ProfilePageSkeleton title={pageTitle} showNotifications={showNotifications} />;
  }

  return (
    <ProfileShell
      title={pageTitle}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showNotifications={showNotifications}
    >
      {activeTab === "user-info" && (
        <UserInfo
          user={profileUser}
          showEmail={showEmail}
          canEditAvatar={isViewingSelf}
          stats={
            isViewingSelf && publicUser
              ? {
                  post_count: publicUser.post_count,
                  group_count: publicUser.group_count,
                  comment_count: publicUser.comment_count,
                  total_likes: publicUser.total_likes,
                  prediction_accuracy: publicUser.prediction_accuracy,
                  total_predictions: publicUser.total_predictions,
                  correct_predictions: publicUser.correct_predictions,
                }
              : undefined
          }
        />
      )}
      {activeTab === "groups" && <UserGroups userId={profileUser.id} />}
      {activeTab === "posts" && <UserPosts userId={profileUser.id} />}
      {activeTab === "predictions" && (
        isViewingSelf
          ? <UserPredictions />
          : <p className="py-10 text-center text-sm text-muted-foreground">Prediction stats are only visible to the account owner.</p>
      )}
      {activeTab === "notifications" && showNotifications && <Notification />}
    </ProfileShell>
  );
}
