"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UserIcon from "@/components/common/user-icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  MoreVertical,
  User,
  Edit,
  Trash2,
  Forward,
  Users,
} from "lucide-react";
import Image from "next/image";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import {
  useLikePost,
  useDislikePost,
  useDeletePost,
} from "@/services/fastapi/posts";
import { useComments } from "@/services/fastapi/comments";
import { useCurrentUser } from "@/services/fastapi/oauth";
import ConfirmDialog from "@/components/common/popup";
import CreateComment from "./create-comment";
import EditPost from "./edit-post";
import CommentItem, {
  type Comment,
  mapCommentResponse,
  formatTimeAgo,
} from "./comment-item";
import type { PostResponse } from "@/type/fastapi/posts";

// Frontend Post type (simplified, without title)
export interface Post {
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
  groupId?: number | null;
  groupName?: string | null;
  groupIconUrl?: string | null;
}

interface PostCardProps {
  post: Post;
  initialExpanded?: boolean; // Auto-expand comments (useful for single post view)
  scrollableComments?: boolean; // Whether comments should be scrollable (default: true)
  hideGroupInfo?: boolean; // If true, hide group icon/name and only show user info (for group pages)
}

export default function PostCard({
  post,
  initialExpanded = false,
  scrollableComments = true,
  hideGroupInfo = false,
}: PostCardProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [showViewMore, setShowViewMore] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
    false, // Only fetch top-level comments, replies loaded separately
  );

  // Derive state directly from post prop - React Query will update it automatically via cache
  // This matches the pattern used in the news detail page
  const userLiked = post.userLiked ?? false;
  const userDisliked = post.userDisliked ?? false;
  const likeCount = post.likeCount ?? 0;
  const dislikeCount = post.dislikeCount ?? 0;

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
        window.getComputedStyle(element).lineHeight,
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
  const deletePostMutation = useDeletePost();

  // Check if current user is the author
  const isAuthor = currentUser && parseInt(post.author.id) === currentUser.id;

  const handleLike = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    const postId = parseInt(post.id);
    if (isNaN(postId)) return;

    try {
      // Call API - React Query will update the cache automatically
      await likePostMutation.mutateAsync(postId);
    } catch (error) {
      console.error("Error liking post:", error);
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
      // Call API - React Query will update the cache automatically
      await dislikePostMutation.mutateAsync(postId);
    } catch (error) {
      console.error("Error disliking post:", error);
      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePostMutation.mutateAsync(postId);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete post:", error);
      // Error is handled by the mutation
    }
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  return (
    <Card
      id={`post-${post.id}`}
      className="hover:shadow-md transition-shadow  space-y-2 p-3 px-4"
    >
      <CardHeader className="p-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* If hideGroupInfo is true (group page), always show user icon and name */}
            {/* Otherwise, show group icon with user badge if post belongs to a group */}
            {hideGroupInfo || !post.groupId ? (
              <>
                <UserIcon
                  avatarUrl={post.author.avatar}
                  name={post.author.name}
                  size="medium"
                  variant="primary"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${post.author.id}`}
                    className="text-sm md:text-base font-semibold line-clamp-2 hover:text-primary-font hover:underline focus:outline-none focus:underline"
                  >
                    {post.author.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(post.createdAt)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 relative">
                  {post.groupIconUrl ? (
                    <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ring-2 ring-border/50 ring-offset-2 ring-offset-background">
                      <Image
                        src={post.groupIconUrl}
                        alt={post.groupName || "Group"}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-2 ring-border/50 ring-offset-2 ring-offset-background">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  {/* User icon at bottom-right corner */}
                  <div className="absolute -bottom-1 -right-3  w-[26px] h-[26px] rounded-full ring-1 ring-background overflow-hidden">
                    <UserIcon
                      avatarUrl={post.author.avatar}
                      name={post.author.name}
                      size="small"
                      variant="primary"
                      className="!w-[26px] !h-[26px] !text-[10px]"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/discuss/group-posts/${post.groupId}`}
                    className="text-sm md:text-base font-semibold line-clamp-2 hover:text-primary-font hover:underline focus:outline-none focus:underline block"
                  >
                    {post.groupName || "Group"}
                  </Link>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Link
                      href={`/profile/${post.author.id}`}
                      className="truncate text-foreground text-sm ml-2 hover:text-primary-font hover:underline focus:outline-none focus:underline"
                    >
                      {post.author.name}
                    </Link>
                    <span>·</span>
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </p>
                </div>
              </>
            )}
          </div>
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 rounded-full"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  disabled={deletePostMutation.isPending}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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

        <div className="flex items-center justify-between px-1 gap-4 md:gap-6 pt-2 border-t border-border">
          <div className="flex items-center gap-4 md:gap-6">
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
              {userLiked ? (
                <BiSolidLike className="w-5 h-5 scale-90 md:scale-100" />
              ) : (
                <BiLike className="w-5 h-5 scale-90 md:scale-100" />
              )}
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
              {userDisliked ? (
                <BiSolidDislike className="w-5 h-5 scale-90 md:scale-100" />
              ) : (
                <BiDislike className="w-5 h-5 scale-90 md:scale-100" />
              )}
              <span className="font-semibold">{dislikeCount}</span>
            </button>
            <button
              onClick={() => {
                if (isMobile) {
                  // Store post data in sessionStorage for the post-id page
                  sessionStorage.setItem(
                    `post-${post.id}`,
                    JSON.stringify(post),
                  );
                  router.push(`/discuss/${post.id}`);
                } else {
                  setIsExpanded(!isExpanded);
                }
              }}
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
          <button
            onClick={() => {
              // Store post data in sessionStorage for the post-id page
              sessionStorage.setItem(`post-${post.id}`, JSON.stringify(post));
              router.push(`/discuss/${post.id}`);
            }}
            className="flex mr-1 items-center gap-2 text-sm text-muted-foreground hover:text-primary-font transition-colors"
          >
            <Forward className="w-5 h-5 scale-90 md:scale-95" />
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

            {/* Comments List */}
            <div
              className={`pb-2 pr-1 ${
                scrollableComments
                  ? "max-h-[400px] md:max-h-[500px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30"
                  : ""
              }`}
            >
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

      {/* Edit Post Dialog */}
      <EditPost
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        postId={postId}
        initialContent={post.content}
        onSuccess={() => {
          // Post will be refetched automatically due to query invalidation
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        isPending={deletePostMutation.isPending}
        variant="destructive"
      />
    </Card>
  );
}

// Helper function to map PostResponse to frontend Post type
export function mapPostResponse(post: PostResponse): Post {
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
    groupId: post.group_id ?? null,
    groupName: post.group_name ?? null,
    groupIconUrl: post.group_icon_url ?? null,
  };
}
