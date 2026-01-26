"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import FullPage from "@/components/common/full-page";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useGroup } from "@/services/fastapi/groups";
import CreateEditGroup from "../../_components/create-edit-group";

export default function EditGroupPage() {
  const router = useRouter();
  const params = useParams();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  
  const groupIdParam = params["group-id"] as string | undefined;
  const groupId = groupIdParam ? parseInt(groupIdParam, 10) : null;
  const validGroupId = groupId && !isNaN(groupId) && groupId > 0 ? groupId : null;

  // Fetch group data to verify ownership
  const { data: groupData, isLoading: isLoadingGroup } = useGroup(validGroupId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingUser && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isLoadingUser, router]);

  // Redirect if not owner
  useEffect(() => {
    if (
      !isLoadingUser &&
      !isLoadingGroup &&
      currentUser &&
      groupData &&
      currentUser.id !== groupData.owner_id
    ) {
      // User is not the owner, redirect to group page
      router.push(`/discuss/group-posts/${validGroupId}`);
    }
  }, [
    currentUser,
    groupData,
    isLoadingUser,
    isLoadingGroup,
    router,
    validGroupId,
  ]);

  // Show loading or nothing while checking auth
  if (isLoadingUser || !currentUser) {
    return null;
  }

  // Show loading while fetching group
  if (isLoadingGroup || !validGroupId) {
    return (
      <FullPage minusHeight={70}>
        <div className="container mx-auto py-4 md:py-6 max-w-2xl px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/discuss")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Back to Discussion
            </p>
          </Button>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </FullPage>
    );
  }

  // Show error if group not found or user is not owner
  if (!groupData || (currentUser && currentUser.id !== groupData.owner_id)) {
    return (
      <FullPage minusHeight={70}>
        <div className="container mx-auto py-4 md:py-6 max-w-2xl px-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/discuss")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" />
            <p className="text-xs md:text-sm text-muted-foreground font-medium">
              Back to Discussion
            </p>
          </Button>
          <div className="text-center py-8">
            <p className="text-destructive">
              {!groupData
                ? "Group not found"
                : "You don't have permission to edit this group"}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/discuss")}
              className="mt-4"
            >
              Back to Discussion
            </Button>
          </div>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage minusHeight={70}>
      <div className="container mx-auto py-4 md:py-6 max-w-2xl px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/discuss/group-posts/${validGroupId}`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" />
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Back to Group
          </p>
        </Button>

        {/* Edit Group Form */}
        <CreateEditGroup groupId={validGroupId} />
      </div>
    </FullPage>
  );
}
