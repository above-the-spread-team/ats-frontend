"use client";

import { useState } from "react";
import Image from "next/image";
import FullPage from "@/components/common/full-page";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  MoreVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  mockPosts,
  currentUser,
  type Post,
  type Comment,
} from "@/data/discuss-mock";
import CreatePost from "./_components/create-post";

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
              getInitials(comment.author.name)
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
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm md:text-base font-semibold flex-shrink-0">
              {post.author.avatar ? (
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(post.author.name)
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
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold mb-2">{post.title}</h3>
          <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap break-words">
            {post.content}
          </p>
        </div>

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

export default function DiscussPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const handleCreatePost = (title: string, content: string) => {
    // Create new post object
    const newPost: Post = {
      id: Date.now().toString(),
      title,
      content,
      author: currentUser,
      createdAt: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      comments: [],
      userLiked: false,
      userDisliked: false,
    };

    // Add to beginning of posts array
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <FullPage minusHeight={70}>
      <div className="container mx-auto py-4 md:py-6 max-w-4xl px-4">
        {/* Create Post Input */}
        <Card className="mb-4 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm md:text-base font-semibold flex-shrink-0">
                {currentUser.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    width={32}
                    height={32}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(currentUser.name)
                )}
              </div>
              <div
                onClick={() => setIsCreatePostOpen(true)}
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
          onSubmit={handleCreatePost}
        />

        {/* Posts List */}
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
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
