"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import { useLikeNews, useDislikeNews } from "@/services/fastapi/news";

interface NewsReactionsProps {
  newsId: number;
  initialLikes: number;
  initialDislikes: number;
  initialUserReaction: boolean | null;
}

export default function NewsReactions({
  newsId,
  initialLikes,
  initialDislikes,
  initialUserReaction,
}: NewsReactionsProps) {
  const router = useRouter();
  const likeNewsMutation = useLikeNews();
  const dislikeNewsMutation = useDislikeNews();

  const [optimistic, setOptimistic] = useState<{
    liked: boolean;
    disliked: boolean;
    likeCount: number;
    dislikeCount: number;
  } | null>(null);

  useEffect(() => {
    setOptimistic(null);
  }, [initialUserReaction, initialLikes, initialDislikes]);

  const userLiked =
    optimistic?.liked ?? (initialUserReaction === true);
  const userDisliked =
    optimistic?.disliked ?? (initialUserReaction === false);
  const likeCount = optimistic?.likeCount ?? initialLikes;
  const dislikeCount = optimistic?.dislikeCount ?? initialDislikes;

  const handleLike = async () => {
    setOptimistic(
      userLiked
        ? {
            liked: false,
            disliked: false,
            likeCount: likeCount - 1,
            dislikeCount,
          }
        : userDisliked
          ? {
              liked: true,
              disliked: false,
              likeCount: likeCount + 1,
              dislikeCount: dislikeCount - 1,
            }
          : {
              liked: true,
              disliked: false,
              likeCount: likeCount + 1,
              dislikeCount,
            },
    );

    try {
      await likeNewsMutation.mutateAsync(newsId);
    } catch (error) {
      setOptimistic(null);
      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    }
  };

  const handleDislike = async () => {
    setOptimistic(
      userDisliked
        ? {
            liked: false,
            disliked: false,
            likeCount,
            dislikeCount: dislikeCount - 1,
          }
        : userLiked
          ? {
              liked: false,
              disliked: true,
              likeCount: likeCount - 1,
              dislikeCount: dislikeCount + 1,
            }
          : {
              liked: false,
              disliked: true,
              likeCount,
              dislikeCount: dislikeCount + 1,
            },
    );

    try {
      await dislikeNewsMutation.mutateAsync(newsId);
    } catch (error) {
      setOptimistic(null);
      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    }
  };

  return (
    <div className="flex items-center gap-2 ml-auto">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 text-sm hover:text-heart-hover transition-colors ${
          userLiked ? "text-heart" : "text-muted-foreground"
        }`}
        aria-label={userLiked ? "Unlike this news" : "Like this news"}
      >
        {userLiked ? (
          <BiSolidLike className="h-5 w-5" />
        ) : (
          <BiLike className="h-5 w-5" />
        )}
        <span>{likeCount}</span>
      </button>
      <button
        onClick={handleDislike}
        className={`flex items-center gap-1 text-sm hover:text-heart-hover transition-colors ${
          userDisliked ? "text-heart" : "text-muted-foreground"
        }`}
        aria-label={userDisliked ? "Remove dislike" : "Dislike this news"}
      >
        {userDisliked ? (
          <BiSolidDislike className="h-5 w-5" />
        ) : (
          <BiDislike className="h-5 w-5" />
        )}
        <span>{dislikeCount}</span>
      </button>
    </div>
  );
}
