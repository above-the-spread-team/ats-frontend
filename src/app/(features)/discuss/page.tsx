"use client";

import FullPage from "@/components/common/full-page";
import PostContent from "./_components/post-content";

export default function DiscussPage() {
  return (
    <FullPage minusHeight={70}>
      <div className="container mx-auto py-4 md:py-6 max-w-5xl px-2">
        <PostContent groupId={null} />
      </div>
    </FullPage>
  );
}
