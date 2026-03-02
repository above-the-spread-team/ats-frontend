"use client";

import { useParams, useSearchParams } from "next/navigation";
import PostContent from "../../_components/post-content";

export default function GroupPostsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const groupIdParam = params["group-id"] as string | undefined;

  // Strict parsing with radix 10 for cross-browser compatibility
  const groupId = groupIdParam ? parseInt(groupIdParam, 10) : null;
  const validGroupId =
    groupId && !isNaN(groupId) && groupId > 0 ? groupId : null;

  // ?view=pending|followers|banned — used by notification deep-links
  const viewParam = searchParams.get("view");
  const initialView =
    viewParam === "pending" || viewParam === "followers" || viewParam === "banned"
      ? viewParam
      : undefined;

  return <PostContent groupId={validGroupId} initialView={initialView} />;
}
