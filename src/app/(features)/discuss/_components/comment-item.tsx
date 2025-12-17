"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserIcon from "@/components/common/user-icon";
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useCommentReplies,
  useLikeComment,
  useDislikeComment,
} from "@/services/fastapi/comments";
import { useCurrentUser } from "@/services/fastapi/oauth";
import CreateComment from "./create-comment";
import type { CommentResponse } from "@/type/fastapi/comments";

// Comment interface (shared with page.tsx)
export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  content: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  replies?: Comment[];
  userLiked?: boolean;
  userDisliked?: boolean;
  parentCommentId?: number | null;
  repliedToUser?: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

// formatTimeAgo helper function
export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  } catch {
    return "recently";
  }
}

// Helper function to map CommentResponse to frontend Comment type
export function mapCommentResponse(comment: CommentResponse): Comment {
  return {
    id: comment.id.toString(),
    author: {
      id: comment.author.id.toString(),
      name: comment.author.username,
      avatar: comment.author.avatar_url,
    },
    content: comment.content,
    createdAt: comment.created_at,
    likeCount: comment.likes,
    dislikeCount: comment.dislikes,
    replyCount: comment.reply_count,
    replies: [],
    userLiked: comment.user_reaction === true,
    userDisliked: comment.user_reaction === false,
    parentCommentId: comment.parent_comment_id,
    repliedToUser: comment.replied_to_user
      ? {
          id: comment.replied_to_user.id.toString(),
          name: comment.replied_to_user.username,
          avatar: comment.replied_to_user.avatar_url,
        }
      : null,
  };
}

interface CommentItemProps {
  comment: Comment;
  postId: number;
  level?: number;
  onReply?: () => void;
}

export default function CommentItem({
  comment,
  postId,
  level = 0,
  onReply,
}: CommentItemProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed, expand when user clicks
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [userLiked, setUserLiked] = useState(comment.userLiked || false);
  const [userDisliked, setUserDisliked] = useState(
    comment.userDisliked || false
  );
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikeCount);

  const likeCommentMutation = useLikeComment();
  const dislikeCommentMutation = useDislikeComment();

  // Only fetch replies for top-level comments (level === 0) when expanded
  const commentId = level === 0 ? parseInt(comment.id) : null;
  const {
    data: repliesData,
    isLoading: repliesLoading,
    refetch: refetchReplies,
  } = useCommentReplies(isExpanded && commentId ? commentId : null, 1, 20);

  // Sync state when comment prop changes
  useEffect(() => {
    setUserLiked(comment.userLiked || false);
    setUserDisliked(comment.userDisliked || false);
    setLikeCount(comment.likeCount);
    setDislikeCount(comment.dislikeCount);
  }, [
    comment.userLiked,
    comment.userDisliked,
    comment.likeCount,
    comment.dislikeCount,
  ]);

  const handleLike = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const commentId = parseInt(comment.id);
    if (isNaN(commentId)) return;

    try {
      // Optimistic update
      const wasLiked = userLiked;
      const wasDisliked = userDisliked;

      if (wasLiked) {
        setUserLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      } else {
        setUserLiked(true);
        setLikeCount((prev) => prev + 1);
        if (wasDisliked) {
          setUserDisliked(false);
          setDislikeCount((prev) => Math.max(0, prev - 1));
        }
      }

      // Call API
      const updatedComment = await likeCommentMutation.mutateAsync(commentId);

      // Update with actual API response
      setLikeCount(updatedComment.likes);
      setDislikeCount(updatedComment.dislikes);
      setUserLiked(updatedComment.user_reaction === true);
      setUserDisliked(updatedComment.user_reaction === false);
    } catch (error) {
      // Revert optimistic update on error
      setUserLiked(comment.userLiked || false);
      setUserDisliked(comment.userDisliked || false);
      setLikeCount(comment.likeCount);
      setDislikeCount(comment.dislikeCount);

      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    }
  };

  const handleDislike = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const commentId = parseInt(comment.id);
    if (isNaN(commentId)) return;

    try {
      // Optimistic update
      const wasLiked = userLiked;
      const wasDisliked = userDisliked;

      if (wasDisliked) {
        setUserDisliked(false);
        setDislikeCount((prev) => Math.max(0, prev - 1));
      } else {
        setUserDisliked(true);
        setDislikeCount((prev) => prev + 1);
        if (wasLiked) {
          setUserLiked(false);
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      }

      // Call API
      const updatedComment = await dislikeCommentMutation.mutateAsync(
        commentId
      );

      // Update with actual API response
      setLikeCount(updatedComment.likes);
      setDislikeCount(updatedComment.dislikes);
      setUserLiked(updatedComment.user_reaction === true);
      setUserDisliked(updatedComment.user_reaction === false);
    } catch (error) {
      // Revert optimistic update on error
      setUserLiked(comment.userLiked || false);
      setUserDisliked(comment.userDisliked || false);
      setLikeCount(comment.likeCount);
      setDislikeCount(comment.dislikeCount);

      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    }
  };

  const handleReplyClick = () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReply?.();
  };

  return (
    <div className={`${level > 0 ? " py-1" : ""}`}>
      <div className="flex gap-3 ">
        <div className="flex-shrink-0">
          <UserIcon
            avatarUrl={comment.author.avatar}
            name={comment.author.name}
            size="small"
            variant="primary"
            className={`${level > 0 ? "w-5 h-5 md:w-6 md:h-6" : ""}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold">{comment.author.name}</p>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-foreground mb-2 whitespace-pre-wrap break-words">
            {comment.repliedToUser && (
              <span className="text-primary font-medium">
                @{comment.repliedToUser.name}{" "}
              </span>
            )}
            {comment.content}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              disabled={
                likeCommentMutation.isPending ||
                dislikeCommentMutation.isPending
              }
              className={`flex items-center gap-1.5 text-xs hover:text-heart-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                userLiked ? "text-heart" : "text-muted-foreground"
              }`}
            >
              <Heart className={`w-4 h-4 ${userLiked ? "fill-current" : ""}`} />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleDislike}
              disabled={
                likeCommentMutation.isPending ||
                dislikeCommentMutation.isPending
              }
              className={`flex items-center gap-1.5 text-xs hover:text-heart-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                userDisliked ? "text-heart" : "text-muted-foreground"
              }`}
            >
              <ThumbsDown
                className={`w-4 h-4 ${userDisliked ? "fill-current" : ""}`}
              />
              <span>{dislikeCount}</span>
            </button>
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-font transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
          {comment.replyCount > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex mt-3 items-center gap-1 text-xs text-primary-font font-semibold transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Hide {comment.replyCount} replies</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Show {comment.replyCount} replies</span>
                </>
              )}
            </button>
          )}

          {showReplyForm && (
            <div className="mt-2 ">
              <CreateComment
                postId={postId}
                parentCommentId={parseInt(comment.id)}
                onSuccess={() => {
                  handleReplySuccess();
                  // Refetch replies if expanded
                  if (isExpanded && level === 0) {
                    refetchReplies();
                  }
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
          {/* Only show replies for top-level comments (level === 0) */}
          {level === 0 && isExpanded && (
            <div className="mt-1 space-y-2">
              {repliesLoading ? (
                <div className="space-y-2 pl-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : repliesData && repliesData.items.length > 0 ? (
                repliesData.items.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={mapCommentResponse(reply)}
                    postId={postId}
                    level={level + 1}
                    onReply={() => {
                      refetchReplies();
                      onReply?.();
                    }}
                  />
                ))
              ) : comment.replyCount > 0 ? (
                <p className="text-xs text-muted-foreground pl-4">
                  No replies yet
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
