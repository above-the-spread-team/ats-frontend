"use client";

import { useParams, useRouter } from "next/navigation";
import FullPage from "@/components/common/full-page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { usePost } from "@/services/fastapi/posts";
import PostCard, { mapPostResponse } from "../_components/post-card";

export default function DiscussPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params["post-id"]
    ? parseInt(params["post-id"] as string)
    : null;

  const {
    data: postData,
    isLoading,
    error,
    refetch,
  } = usePost(postId && !isNaN(postId) ? postId : null);

  const post = postData ? mapPostResponse(postData) : null;

  const handleBackToDiscussion = () => {
    if (postId) {
      router.push(`/discuss#post-${postId}`);
    } else {
      router.push("/discuss");
    }
  };

  return (
    <FullPage minusHeight={70}>
      <div className="container mx-auto  pt-2 pb-8 space-y-2 max-w-4xl px-0">
        {/* Back Button */}
        <Button variant="ghost" onClick={handleBackToDiscussion} className=" ">
          <ArrowLeft className="w-4 h-4 text-muted-foreground " />
          <p className="text-xs md:text-sm text-muted-foreground font-medium">
            Back to Discussion
          </p>
        </Button>
        <div className="px-2">
          {/* Loading State */}
          {isLoading && (
            <Card className="hover:shadow-md transition-shadow space-y-2 p-3 px-4">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <CardContent className="space-y-2 p-0">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-6 pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Failed to load post
                </h3>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleBackToDiscussion} variant="outline">
                    Back to Discussion
                  </Button>
                  <Button onClick={() => refetch()} variant="outline">
                    Try again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Post Not Found */}
          {!isLoading && !error && !post && (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Post not found</h3>
                <p className="text-muted-foreground mb-4">
                  The post you&apos;re looking for doesn&apos;t exist or has
                  been deleted.
                </p>
                <Button onClick={handleBackToDiscussion} variant="outline">
                  Back to Discussion
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Post Content */}
          {!isLoading && !error && post && (
            <div className="space-y-4">
              <PostCard
                post={post}
                initialExpanded={true}
                scrollableComments={false}
              />
            </div>
          )}
        </div>
      </div>
    </FullPage>
  );
}
