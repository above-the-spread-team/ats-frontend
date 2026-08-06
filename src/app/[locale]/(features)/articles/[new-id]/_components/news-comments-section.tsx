"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useNewsComments } from "@/services/fastapi/news";
import CreateNewsComment from "@/app/[locale]/(features)/articles/_components/create-news-comment";
import NewsCommentItem, {
  mapNewsCommentResponse,
} from "@/app/[locale]/(features)/articles/_components/news-comment-item";

interface NewsCommentsSectionProps {
  newsId: number;
}

export default function NewsCommentsSection({ newsId }: NewsCommentsSectionProps) {
  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useNewsComments(newsId, 1, 20, false);

  return (
    <Card id="comments-section" className="mt-4 scroll-mt-4">
      <CardContent className="p-4 md:p-6">
        <div className="mb-3">
          <h2 className="text-xl font-bold mb-3">Comments</h2>
          <CreateNewsComment
            newsId={newsId}
            onSuccess={() => refetchComments()}
          />
        </div>

        <div className="space-y-5 md:space-y-5 pt-3 md:pt-4">
          {commentsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : commentsData && commentsData.items.length > 0 ? (
            commentsData.items.map((comment) => (
              <NewsCommentItem
                key={comment.id}
                comment={mapNewsCommentResponse(comment)}
                newsId={newsId}
                onReply={() => refetchComments()}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
