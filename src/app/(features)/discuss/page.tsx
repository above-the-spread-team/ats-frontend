"use client";

import { useState, useMemo } from "react";
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
import { usePosts } from "@/services/fastapi/posts";
import { useCurrentUser } from "@/services/fastapi/oauth";
import type { PostResponse } from "@/type/fastapi/posts";
import CreatePost from "./_components/create-post";

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
  level?: number;
}

function CommentItem({ comment, level = 0 }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [userLiked, setUserLiked] = useState(comment.userLiked || false);
  const [userDisliked, setUserDisliked] = useState(
    comment.userDisliked || false
  );
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikeCount);

  const handleLike = () => {
    if (userLiked) {
      setUserLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setUserLiked(true);
      setLikeCount((prev) => prev + 1);
      if (userDisliked) {
        setUserDisliked(false);
        setDislikeCount((prev) => prev - 1);
      }
    }
  };

  const handleDislike = () => {
    if (userDisliked) {
      setUserDisliked(false);
      setDislikeCount((prev) => prev - 1);
    } else {
      setUserDisliked(true);
      setDislikeCount((prev) => prev + 1);
      if (userLiked) {
        setUserLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }
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
            {comment.content}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs hover:text-primary transition-colors ${
                userLiked ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{likeCount}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center gap-1.5 text-xs hover:text-destructive transition-colors ${
                userDisliked ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
              <span>{dislikeCount}</span>
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
          {comment.replies && comment.replies.length > 0 && isExpanded && (
            <div className="mt-4 space-y-2">
              {comment.replies.map((reply) => (
                <CommentItem key={reply.id} comment={reply} level={level + 1} />
              ))}
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [userLiked, setUserLiked] = useState(post.userLiked || false);
  const [userDisliked, setUserDisliked] = useState(post.userDisliked || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [dislikeCount, setDislikeCount] = useState(0);

  const handleLike = () => {
    if (userLiked) {
      setUserLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setUserLiked(true);
      setLikeCount((prev) => prev + 1);
      if (userDisliked) {
        setUserDisliked(false);
        setDislikeCount((prev) => prev - 1);
      }
    }
  };

  const handleDislike = () => {
    if (userDisliked) {
      setUserDisliked(false);
      setDislikeCount((prev) => prev - 1);
    } else {
      setUserDisliked(true);
      setDislikeCount((prev) => prev + 1);
      if (userLiked) {
        setUserLiked(false);
        setLikeCount((prev) => prev - 1);
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
            className={`flex items-center gap-2 text-sm transition-colors ${
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
            className={`flex items-center gap-2 text-sm transition-colors ${
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

        {post.comments.length > 0 && isExpanded && (
          <div className="pt-4 border-t border-border mt-4">
            <h4 className="text-sm font-semibold mb-4">
              Comments ({post.commentCount})
            </h4>
            <div className="space-y-1">
              {post.comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
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
    likeCount: post.reaction_count, // Using reaction_count as likeCount for now
    commentCount: post.comment_count,
    viewCount: 0, // Backend doesn't have view count yet
    comments: [], // Comments will be fetched separately if needed
    userLiked: false, // Will be determined by checking user's reactions
    userDisliked: false,
  };
}

export default function DiscussPage() {
  const router = useRouter();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [page, setPage] = useState(1);
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
