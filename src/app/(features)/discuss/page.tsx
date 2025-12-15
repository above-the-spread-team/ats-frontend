"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FullPage from "@/components/common/full-page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import {
  usePosts,
  useLikePost,
  useDislikePost,
} from "@/services/fastapi/posts";
import {
  useComments,
  useCommentReplies,
  useLikeComment,
  useDislikeComment,
} from "@/services/fastapi/comments";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { PostResponse } from "@/type/fastapi/posts";
import type { CommentResponse } from "@/type/fastapi/comments";
import CreatePost from "./_components/create-post";
import CreateComment from "./_components/create-comment";

// Frontend Post type (simplified, without title)
interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  viewCount: number;
  comments: Comment[];
  userLiked?: boolean;
  userDisliked?: boolean;
}

interface Comment {
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
  } | null; // User who was replied to (null for top-level comments)
}

function formatTimeAgo(dateString: string): string {
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface CommentItemProps {
  comment: Comment;
  postId: number;
  level?: number;
  onReply?: () => void;
}

function CommentItem({
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
    <div
      className={`${
        level > 0 ? "ml-6 md:ml-8 border-l-2 border-border pl-4 md:pl-6" : ""
      }`}
    >
      <div className="flex gap-3 py-3">
        <div className="flex-shrink-0">
          <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs md:text-sm font-semibold overflow-hidden">
            {comment.author.avatar ? (
              <Image
                src={comment.author.avatar}
                alt={comment.author.name}
                width={32}
                height={32}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span>{getInitials(comment.author.name)}</span>
            )}
          </div>
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
              className={`flex items-center gap-1.5 text-xs hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                userLiked ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleDislike}
              disabled={
                likeCommentMutation.isPending ||
                dislikeCommentMutation.isPending
              }
              className={`flex items-center gap-1.5 text-xs hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                userDisliked ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{dislikeCount}</span>
            </button>
            <button
              onClick={handleReplyClick}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Reply</span>
            </button>
            {comment.replyCount > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
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
          </div>
          {showReplyForm && (
            <div className="mt-3 pl-4 border-l-2 border-border">
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
                placeholder="Write a reply..."
              />
            </div>
          )}
          {/* Only show replies for top-level comments (level === 0) */}
          {level === 0 && isExpanded && (
            <div className="mt-4 space-y-2">
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

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const postId = parseInt(post.id);

  // Fetch comments when expanded
  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useComments(
    isExpanded ? postId : null,
    1,
    20,
    false // Only fetch top-level comments, replies loaded separately
  );

  // Initialize state from post data (from API response)
  const [userLiked, setUserLiked] = useState(post.userLiked || false);
  const [userDisliked, setUserDisliked] = useState(post.userDisliked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [dislikeCount, setDislikeCount] = useState(post.dislikeCount);

  // Sync state when post prop changes (e.g., after refetch)
  useEffect(() => {
    setUserLiked(post.userLiked || false);
    setUserDisliked(post.userDisliked || false);
    setLikeCount(post.likeCount);
    setDislikeCount(post.dislikeCount);
  }, [post.userLiked, post.userDisliked, post.likeCount, post.dislikeCount]);

  const likePostMutation = useLikePost();
  const dislikePostMutation = useDislikePost();

  const handleLike = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const postId = parseInt(post.id);
    if (isNaN(postId)) return;

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
      const stats = await likePostMutation.mutateAsync(postId);

      // Update with actual API response
      setLikeCount(stats.likes);
      setDislikeCount(stats.dislikes);
      setUserLiked(stats.user_reaction === true);
      setUserDisliked(stats.user_reaction === false);
    } catch (error) {
      // Revert optimistic update on error
      setUserLiked(post.userLiked || false);
      setUserDisliked(post.userDisliked || false);
      setLikeCount(post.likeCount);
      setDislikeCount(0);

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

    const postId = parseInt(post.id);
    if (isNaN(postId)) return;

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
      const stats = await dislikePostMutation.mutateAsync(postId);

      // Update with actual API response
      setLikeCount(stats.likes);
      setDislikeCount(stats.dislikes);
      setUserLiked(stats.user_reaction === true);
      setUserDisliked(stats.user_reaction === false);
    } catch (error) {
      // Revert optimistic update on error
      setUserLiked(post.userLiked || false);
      setUserDisliked(post.userDisliked || false);
      setLikeCount(post.likeCount);
      setDislikeCount(0);

      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start px-4 justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm md:text-base font-semibold flex-shrink-0 overflow-hidden">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={48}
                  height={48}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{getInitials(post.author.name)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-semibold truncate">
                {post.author.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm md:text-base  text-foreground whitespace-pre-wrap break-words">
          {post.content}
        </p>

        <div className="flex items-center gap-6 pt-2 border-t border-border">
          <button
            onClick={handleLike}
            disabled={
              likePostMutation.isPending || dislikePostMutation.isPending
            }
            className={`flex items-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              userLiked
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <ThumbsUp className="w-5 h-5" />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={handleDislike}
            disabled={
              likePostMutation.isPending || dislikePostMutation.isPending
            }
            className={`flex items-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              userDisliked
                ? "text-destructive"
                : "text-muted-foreground hover:text-destructive"
            }`}
          >
            <ThumbsDown className="w-5 h-5" />
            <span>{dislikeCount}</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.commentCount}</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <Eye className="w-5 h-5" />
            <span>{post.viewCount}</span>
          </div>
        </div>

        {isExpanded && (
          <div className="pt-4 border-t border-border mt-4">
            <h4 className="text-sm font-semibold mb-4">
              Comments ({post.commentCount})
            </h4>

            {/* Create Comment Form */}
            <div className="mb-4">
              <CreateComment
                postId={postId}
                onSuccess={() => refetchComments()}
                placeholder="Write a comment..."
              />
            </div>

            {/* Comments List */}
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
              <div className="space-y-1">
                {commentsData.items.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={mapCommentResponse(comment)}
                    postId={postId}
                    onReply={() => refetchComments()}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to map PostResponse to frontend Post type
function mapPostResponse(post: PostResponse): Post {
  return {
    id: post.id.toString(),
    content: post.content,
    author: {
      id: post.author.id.toString(),
      name: post.author.username,
      avatar: post.author.avatar_url,
    },
    createdAt: post.created_at,
    likeCount: post.likes,
    dislikeCount: post.dislikes,
    commentCount: post.comment_count,
    viewCount: 0, // Backend doesn't have view count yet
    comments: [], // Comments will be fetched separately when expanded
    userLiked: post.user_reaction === true,
    userDisliked: post.user_reaction === false,
  };
}

/**
 * Helper function to map CommentResponse to frontend Comment type
 *
 * Two-layer comment system with @username display rules:
 * - Layer 1 (Top-level): Comments directly under posts (parent_comment_id is null)
 * - Layer 2 (Replies): All replies, whether to top-level comments or other replies
 *   - Backend automatically enforces this structure via root_comment_id
 *
 * @username display rules (handled by backend):
 * 1. First-layer replies (replying to top-level): replied_to_user = null → No @username
 * 2. Second-layer replies to another user's reply: replied_to_user set → Show @username
 * 3. Second-layer replies to own reply: replied_to_user = null → No @username
 */
function mapCommentResponse(comment: CommentResponse): Comment {
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
    // Replies are loaded separately via lazy loading, so don't include nested replies here
    replies: [], // Replies are fetched separately when user clicks "View replies"
    userLiked: comment.user_reaction === true, // Shows if current user liked this comment
    userDisliked: comment.user_reaction === false, // Shows if current user disliked this comment
    parentCommentId: comment.parent_comment_id,
    // replied_to_user is only set by backend for second-layer replies to another user's reply
    repliedToUser: comment.replied_to_user
      ? {
          id: comment.replied_to_user.id.toString(),
          name: comment.replied_to_user.username,
          avatar: comment.replied_to_user.avatar_url,
        }
      : null,
  };
}

export default function DiscussPage() {
  const router = useRouter();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [page] = useState(1);
  const pageSize = 20;

  // Fetch posts from API
  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = usePosts(page, pageSize);

  // Get current user
  const { data: currentUser } = useCurrentUser();

  // Map posts from API to frontend format
  const posts = useMemo(() => {
    if (!postsData?.items) return [];
    return postsData.items.map(mapPostResponse);
  }, [postsData]);

  // Handle create post input click
  const handleCreatePostClick = () => {
    if (currentUser) {
      setIsCreatePostOpen(true);
    } else {
      router.push("/login");
    }
  };

  return (
    <FullPage minusHeight={70}>
      <div className="container mx-auto py-4 md:py-6 max-w-4xl px-4">
        {/* Create Post Input */}
        <Card className="mb-4 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mygray flex items-center justify-center text-muted-foreground flex-shrink-0 overflow-hidden">
                {currentUser ? (
                  currentUser.avatar_url ? (
                    <Image
                      src={currentUser.avatar_url}
                      alt={currentUser.username}
                      width={48}
                      height={48}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm md:text-base font-semibold">
                      {getInitials(currentUser.username)}
                    </span>
                  )
                ) : (
                  <User className="w-5 h-5 md:w-6 md:h-6 text-background font-black" />
                )}
              </div>
              <div
                onClick={handleCreatePostClick}
                className="flex-1 bg-muted/50 hover:bg-muted border border-border rounded-2xl px-4 py-3 cursor-pointer transition-colors"
              >
                <p className="text-sm text-muted-foreground">
                  Want to say something?
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Post Dialog */}
        <CreatePost
          open={isCreatePostOpen}
          onOpenChange={setIsCreatePostOpen}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <div className="flex gap-6 pt-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Failed to load posts
              </h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An error occurred"}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Posts List */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && posts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No posts yet. Be the first to share!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </FullPage>
  );
}
