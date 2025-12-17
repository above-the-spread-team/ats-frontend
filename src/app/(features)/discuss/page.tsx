"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import FullPage from "@/components/common/full-page";
import UserIcon from "@/components/common/user-icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  MoreVertical,
  User,
} from "lucide-react";
import {
  usePosts,
  useLikePost,
  useDislikePost,
} from "@/services/fastapi/posts";
import { useComments } from "@/services/fastapi/comments";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { PostResponse } from "@/type/fastapi/posts";
import type { CommentResponse } from "@/type/fastapi/comments";
import CreatePost from "./_components/create-post";
import CreateComment from "./_components/create-comment";
import CommentItem, {
  type Comment,
  mapCommentResponse,
  formatTimeAgo,
} from "./_components/comment-item";

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

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
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

  // Check if content exceeds 10 lines
  useEffect(() => {
    if (contentRef.current && !isContentExpanded) {
      // Temporarily remove line-clamp to measure actual height
      const element = contentRef.current;
      const hadLineClamp = element.classList.contains("line-clamp-10");
      if (hadLineClamp) {
        element.classList.remove("line-clamp-10");
      }

      const lineHeight = parseFloat(
        window.getComputedStyle(element).lineHeight
      );
      const maxHeight = lineHeight * 10; // 10 lines
      const actualHeight = element.scrollHeight;

      if (hadLineClamp) {
        element.classList.add("line-clamp-10");
      }

      setShowViewMore(actualHeight > maxHeight);
    } else if (isContentExpanded) {
      // If expanded, we know it exceeded 10 lines
      setShowViewMore(true);
    }
  }, [post.content, isContentExpanded]);

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
    <Card className="hover:shadow-md transition-shadow space-y-2 p-3 px-4">
      <CardHeader className="p-0  ">
        <div className="flex items-start   justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <UserIcon
              avatarUrl={post.author.avatar}
              name={post.author.name}
              size="medium"
              variant="primary"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base font-semibold truncate">
                {post.author.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 rounded-full"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        <div className="mb-1.5 flex flex-col items-start">
          <p
            ref={contentRef}
            className={`text-sm md:text-base text-foreground whitespace-pre-wrap break-words ${
              !isContentExpanded && showViewMore ? "line-clamp-[14]" : ""
            }`}
          >
            {post.content}
          </p>
          {showViewMore && (
            <button
              onClick={() => setIsContentExpanded(!isContentExpanded)}
              className="text-xs text-muted-foreground font-semibold hover:text-primary-font transition-colors mt-0.5"
            >
              {isContentExpanded ? "View less" : "View more"}
            </button>
          )}
        </div>

        <div className="flex items-center px-1 gap-4 md:gap-6 pt-2 border-t border-border">
          <button
            onClick={handleLike}
            disabled={
              likePostMutation.isPending || dislikePostMutation.isPending
            }
            className={`flex items-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              userLiked
                ? "text-heart"
                : "text-muted-foreground hover:text-heart-hover"
            }`}
          >
            <Heart
              className={`w-5 h-5 scale-90 md:scale-100 ${
                userLiked ? "fill-current" : ""
              }`}
            />
            <span className="font-semibold">{likeCount}</span>
          </button>
          <button
            onClick={handleDislike}
            disabled={
              likePostMutation.isPending || dislikePostMutation.isPending
            }
            className={`flex items-center gap-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              userDisliked
                ? "text-heart"
                : "text-muted-foreground hover:text-heart-hover"
            }`}
          >
            <ThumbsDown className="w-5 h-5 scale-90 md:scale-100" />
            <span className="font-semibold">{dislikeCount}</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 text-sm transition-colors ${
              isExpanded
                ? "text-primary-font "
                : "text-muted-foreground hover:text-primary-font"
            }`}
          >
            <MessageCircle className={`w-5 scale-90 md:scale-100 h-5 `} />
            <span className="font-semibold">{post.commentCount}</span>
          </button>
        </div>

        {isExpanded && (
          <div className="pt-2 border-t border-border ">
            {/* Create Comment Form */}
            <div className="mb-1 md:mb-2">
              {!showCommentForm ? (
                <div
                  onClick={() => {
                    if (currentUser) {
                      setShowCommentForm(true);
                    } else {
                      router.push("/login");
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {currentUser ? (
                    <UserIcon
                      avatarUrl={currentUser.avatar_url}
                      name={currentUser.username}
                      size="small"
                      variant="primary"
                      className="w-5 h-5 md:w-6 md:h-6"
                    />
                  ) : (
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-mygray flex items-center justify-center text-muted-foreground flex-shrink-0 overflow-hidden">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-background font-black" />
                    </div>
                  )}
                  <div className="bg-muted/50 h-8  w-full border-b border-primary-font/50 flex items-center justify-start pl-2">
                    <p className="text-xs  text-muted-foreground">
                      Add a comment...
                    </p>
                  </div>
                </div>
              ) : (
                <CreateComment
                  postId={postId}
                  onSuccess={() => {
                    setShowCommentForm(false);
                    refetchComments();
                  }}
                  onCancel={() => setShowCommentForm(false)}
                  autoFocus={true}
                />
              )}
            </div>

            {/* Comments List - Scrollable */}
            <div className="max-h-[400px] pb-2 md:max-h-[500px] overflow-y-auto overflow-x-hidden pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
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
                <div className="space-y-5 md:space-y-5 pt-3 md:pt-4">
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
      <div className="container  mx-auto py-4 md:py-6 max-w-4xl px-4">
        {/* Create Post Input */}
        <Card className="mb-4 hover:shadow-md rounded-3xl transition-shadow">
          <CardContent className="p-2 md:p-3">
            <div className="flex items-center gap-3">
              {currentUser ? (
                <UserIcon
                  avatarUrl={currentUser.avatar_url}
                  name={currentUser.username}
                  size="medium"
                  variant="primary"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-mygray flex items-center justify-center text-muted-foreground flex-shrink-0 overflow-hidden">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-background font-black" />
                </div>
              )}
              <div
                onClick={handleCreatePostClick}
                className="flex-1 rounded-full bg-mygray/20 hover:bg-muted border border-border  px-4 py-2 md:py-3 cursor-pointer transition-colors"
              >
                <p className="text-xs md:text-sm text-muted-foreground">
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
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 px-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
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
