"use client";

import { useParams } from "next/navigation";
import PostContent from "../../_components/post-content";

export default function GroupPostsPage() {
  const params = useParams();
  const groupIdParam = params["group-id"] as string | undefined;

  // Strict parsing with radix 10 for cross-browser compatibility
  const groupId = groupIdParam ? parseInt(groupIdParam, 10) : null;
  const validGroupId =
    groupId && !isNaN(groupId) && groupId > 0 ? groupId : null;

  return <PostContent groupId={validGroupId} />;
}
