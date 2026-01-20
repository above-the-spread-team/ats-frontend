"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import UserIcon from "@/components/common/user-icon";
import {
  ChevronDown,
  ChevronUp,
  EllipsisVertical,
  Edit,
  Trash2,
} from "lucide-react";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNewsCommentReplies,
  useLikeNewsComment,
  useDislikeNewsComment,
  useDeleteNewsComment,
} from "@/services/fastapi/news";
import { useCurrentUser } from "@/services/fastapi/oauth";
import CreateNewsComment from "./create-news-comment";
import EditNewsComment from "./edit-news-comment";
import ConfirmDialog from "@/components/common/popup";
import type { CommentResponse } from "@/type/fastapi/comments";

// Comment interface (shared with page.tsx)
export interface NewsComment {
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
  replies?: NewsComment[];
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

// Helper function to map CommentResponse to frontend NewsComment type
export function mapNewsCommentResponse(comment: CommentResponse): NewsComment {
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

interface NewsCommentItemProps {
  comment: NewsComment;
  newsId: number;
  level?: number;
  onReply?: () => void;
}

export default function NewsCommentItem({
  comment,
  newsId,
  level = 0,
  onReply,
}: NewsCommentItemProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed, expand when user clicks
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);

  // Derive state directly from comment prop - React Query will update it automatically via cache
  // This matches the pattern used in news detail page and post-card
  const userLiked = comment.userLiked ?? false;
  const userDisliked = comment.userDisliked ?? false;
  const likeCount = comment.likeCount ?? 0;
  const dislikeCount = comment.dislikeCount ?? 0;

  const likeCommentMutation = useLikeNewsComment();
  const dislikeCommentMutation = useDislikeNewsComment();
  const deleteCommentMutation = useDeleteNewsComment();

  // Check if current user is the comment author
  const isAuthor = currentUser?.id === parseInt(comment.author.id);

  // Only fetch replies for top-level comments (level === 0) when expanded
  const commentId = level === 0 ? parseInt(comment.id) : null;
  const {
    data: repliesData,
    isLoading: repliesLoading,
    refetch: refetchReplies,
  } = useNewsCommentReplies(isExpanded && commentId ? commentId : null, 1, 20);


  // Check if content exceeds 4 lines
  useEffect(() => {
    if (contentRef.current && !isContentExpanded) {
      // Temporarily remove line-clamp to measure actual height
      const element = contentRef.current;
      const hadLineClamp = element.classList.contains("line-clamp-4");
      if (hadLineClamp) {
        element.classList.remove("line-clamp-4");
      }

      const lineHeight = parseFloat(
        window.getComputedStyle(element).lineHeight
      );
      const maxHeight = lineHeight * 4; // 4 lines
      const actualHeight = element.scrollHeight;

      if (hadLineClamp) {
        element.classList.add("line-clamp-4");
      }

      setShowReadMore(actualHeight > maxHeight);
    } else if (isContentExpanded) {
      // If expanded, we know it exceeded 4 lines
      setShowReadMore(true);
    }
  }, [comment.content, isContentExpanded]);

  const handleLike = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const commentId = parseInt(comment.id);
    if (isNaN(commentId)) return;

    try {
      // Call API - React Query will update the cache automatically
      await likeCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error("Error liking comment:", error);
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
      // Call API - React Query will update the cache automatically
      await dislikeCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error("Error disliking comment:", error);
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
    // Expand replies section when replying (only for top-level comments)
    if (level === 0 && !isExpanded) {
      setIsExpanded(true);
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySuccess = () => {
    setShowReplyForm(false);
    onReply?.();
  };

  const handleDeleteConfirm = async () => {
    const commentId = parseInt(comment.id);
    if (isNaN(commentId)) return;

    try {
      await deleteCommentMutation.mutateAsync({
        commentId,
        newsId,
      });
      setIsDeleteDialogOpen(false);
      onReply?.(); // Refresh comments
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className={`${level > 0 ? " py-1" : ""}`}>
      <div className="flex gap-3  ">
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
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{comment.author.name}</p>
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-accent rounded-sm transition-colors">
                    <EllipsisVertical className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {isEditing ? (
            <div className="mb-2">
              <EditNewsComment
                commentId={parseInt(comment.id)}
                initialContent={comment.content}
                onSuccess={() => {
                  setIsEditing(false);
                  onReply?.(); // Refresh comments
                }}
                onCancel={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <div className="mb-1.5 flex flex-col items-start">
              <p
                ref={contentRef}
                className={`text-sm text-foreground whitespace-pre-wrap  break-words ${
                  !isContentExpanded && showReadMore ? "line-clamp-4" : ""
                }`}
              >
                {comment.repliedToUser && (
                  <span className="text-primary-font font-medium">
                    @{comment.repliedToUser.name}{" "}
                  </span>
                )}
                {comment.content}
              </p>
              {showReadMore && (
                <button
                  onClick={() => setIsContentExpanded(!isContentExpanded)}
                  className="text-xs text-muted-foreground font-semibold hover:text-primary-font  transition-colors mt-0.5 "
                >
                  {isContentExpanded ? "Read less" : "Read more"}
                </button>
              )}
            </div>
          )}
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
              {userLiked ? (
                <BiSolidLike className="w-4 h-4" />
              ) : (
                <BiLike className="w-4 h-4" />
              )}
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
              {userDisliked ? (
                <BiSolidDislike className="w-4 h-4" />
              ) : (
                <BiDislike className="w-4 h-4" />
              )}
              <span>{dislikeCount}</span>
            </button>
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary-font transition-colors"
            >
              <span className="text-xs font-medium">Reply</span>
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
            <div className={`mt-2 ${level > 0 ? "-ml-4" : ""}`}>
              <CreateNewsComment
                newsId={newsId}
                parentCommentId={parseInt(comment.id)}
                autoFocus={true}
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
                <div className="space-y-2 pl-3">
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
                  <NewsCommentItem
                    key={reply.id}
                    comment={mapNewsCommentResponse(reply)}
                    newsId={newsId}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        isPending={deleteCommentMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
