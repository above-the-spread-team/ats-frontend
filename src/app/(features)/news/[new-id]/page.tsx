"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FullPage from "@/components/common/full-page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import {
  useNewsById,
  useNewsComments,
  useLikeNews,
  useDislikeNews,
} from "@/services/fastapi/news";
import NoData from "@/components/common/no-data";
import { getOptimizedNewsImage } from "@/lib/cloudinary";
import PreviewImage from "../components/preview-image";
import type { NewsResponse } from "@/type/fastapi/news";
import { Tag } from "@/components/common/tag";
import CreateNewsComment from "../_components/create-news-comment";
import NewsCommentItem, {
  mapNewsCommentResponse,
} from "../_components/news-comment-item";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params["new-id"] ? parseInt(params["new-id"] as string) : null;

  const {
    data: news,
    isLoading,
    error,
  } = useNewsById(newsId && !isNaN(newsId) ? newsId : 0);

  // Fetch comments for this news article
  const {
    data: commentsData,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useNewsComments(newsId && !isNaN(newsId) ? newsId : null, 1, 20, false);

  const likeNewsMutation = useLikeNews();
  const dislikeNewsMutation = useDislikeNews();

  // Use news prop directly - React Query will update it automatically via cache
  const userLiked = news?.user_reaction === true;
  const userDisliked = news?.user_reaction === false;
  const likeCount = news?.likes ?? 0;
  const dislikeCount = news?.dislikes ?? 0;
  const reactionCount = news?.reaction_count ?? 0;

  // Scroll to top when news ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [newsId]);

  const handleLikeNews = async () => {
    if (!newsId) return;
    try {
      await likeNewsMutation.mutateAsync(newsId);
      // State will be updated automatically via React Query cache
    } catch (error) {
      console.error("Error liking news:", error);
    }
  };

  const handleDislikeNews = async () => {
    if (!newsId) return;
    try {
      await dislikeNewsMutation.mutateAsync(newsId);
      // State will be updated automatically via React Query cache
    } catch (error) {
      console.error("Error disliking news:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if news is a match preview (has team logos)
  const isMatchPreview = (news: NewsResponse) => {
    return !!(news.home_team_logo && news.away_team_logo);
  };

  if (isLoading) {
    return (
      <FullPage>
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </FullPage>
    );
  }

  if (error || !news) {
    return (
      <FullPage center>
        <div className="container mx-auto max-w-4xl px-4">
          <NoData
            message="News article not found"
            helpText={
              error instanceof Error
                ? error.message
                : "The article you're looking for doesn't exist or has been removed."
            }
          />
          <div className="mt-6 text-center">
            <Button onClick={() => router.push("/news")} variant="outline">
              <ArrowLeft className=" h-4 w-4" />
              Back to News
            </Button>
          </div>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage>
      <div className="container mx-auto max-w-4xl px-2  mb-8">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="my-2 text-primary-font rounded-full hover:text-foreground"
        >
          <ChevronLeft className=" h-4 w-4" />
          Back
        </Button>

        {/* Article Content */}
        <Card className="overflow-hidden">
          {/* Featured Image or Match Preview Header */}
          {isMatchPreview(news) ? (
            <div className="relative w-full h-48 md:h-48 ">
              <PreviewImage
                homeTeamLogo={news.home_team_logo}
                awayTeamLogo={news.away_team_logo}
                variant="header"
                tagName={
                  news.tags && news.tags.length > 0
                    ? news.tags[0].name
                    : undefined
                }
              />
              {/* Category Badge */}
              {news.tags && news.tags.length > 0 && (
                <div className="absolute hidden md:block top-2 left-2 md:top-3 md:left-3">
                  <Tag name={news.tags[0].name} variant="large" />
                </div>
              )}
              {/* Match Preview Badge */}
              <div className="absolute top-2 right-2 md:top-3 md:right-3">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  Match Preview
                </span>
              </div>
            </div>
          ) : news.image_url ? (
            // General News: Backend uploads images to Cloudinary
            // Frontend adds transformations (width, format, quality) to Cloudinary URLs
            <div className="relative w-full h-64 md:h-96 bg-muted">
              <Image
                src={getOptimizedNewsImage(news.image_url, 1600)} // 1600px for detail page (full-width display)
                alt={news.title}
                fill
                className="object-cover"
                unoptimized // Cloudinary handles optimization, so Next.js Image optimization is disabled
              />
              {news.tags && news.tags.length > 0 && (
                <div className="absolute top-4 left-4">
                  <Tag name={news.tags[0].name} variant="large" />
                </div>
              )}
            </div>
          ) : null}

          <CardContent className="p-4 md:p-6">
            {/* Article Header */}
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl font-bold mb-4">
                {news.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap justify-between items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
                <div className="">
                  {news.author && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{news.author.username}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(news.created_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    onClick={() => {
                      document
                        .getElementById("comments-section")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="flex items-center hover:text-primary-font transition-colors cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5 mr-1.5" />
                    <span>{news.comment_count} </span>
                    <span className="ml-1 md:block hidden">comments</span>
                  </div>

                  {/* News Reactions */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleLikeNews}
                      disabled={
                        likeNewsMutation.isPending ||
                        dislikeNewsMutation.isPending
                      }
                      className={`flex items-center gap-1 text-sm hover:text-heart-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        userLiked ? "text-heart" : "text-muted-foreground"
                      }`}
                      aria-label={
                        userLiked ? "Unlike this news" : "Like this news"
                      }
                    >
                      {userLiked ? (
                        <BiSolidLike className="h-5 w-5" />
                      ) : (
                        <BiLike className="h-5 w-5" />
                      )}
                      <span>{likeCount}</span>
                    </button>
                    <button
                      onClick={handleDislikeNews}
                      disabled={
                        likeNewsMutation.isPending ||
                        dislikeNewsMutation.isPending
                      }
                      className={`flex items-center gap-1 text-sm hover:text-heart-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        userDisliked ? "text-heart" : "text-muted-foreground"
                      }`}
                      aria-label={
                        userDisliked ? "Remove dislike" : "Dislike this news"
                      }
                    >
                      {userDisliked ? (
                        <BiSolidDislike className="h-5 w-5" />
                      ) : (
                        <BiDislike className="h-5 w-5" />
                      )}
                      <span>{dislikeCount}</span>
                    </button>
                  </div>
                  {/* Link to Fixture Detail if Match Preview */}
                  {isMatchPreview(news) && news.fixture_id && (
                    <Link
                      href={`/games/detail?id=${news.fixture_id}`}
                      className="flex items-center gap-2 text-primary-font hover:underline  ml-auto"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Fixture</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {news.tags.map((tag) => (
                    <Tag
                      key={tag.id}
                      name={tag.name}
                      variant="medium"
                      href={`/discuss?tag=${tag.id}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary-font prose-a:no-underline hover:prose-a:underline prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ ...props }) => (
                    // hidden title
                    <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-xl font-bold mb-2 mt-4" {...props} />
                  ),
                  h4: ({ ...props }) => (
                    <h4 className="text-lg font-bold mb-2 mt-3" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="mb-4 leading-relaxed" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul
                      className="list-disc list-inside mb-4 space-y-2"
                      {...props}
                    />
                  ),
                  ol: ({ ...props }) => (
                    <ol
                      className="list-decimal list-inside mb-4 space-y-2"
                      {...props}
                    />
                  ),
                  li: ({ ...props }) => <li className="ml-4" {...props} />,
                  strong: ({ ...props }) => (
                    <strong className="font-bold" {...props} />
                  ),
                  em: ({ ...props }) => <em className="italic" {...props} />,
                  a: ({ ...props }) => (
                    <a
                      className=" hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    />
                  ),
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground"
                      {...props}
                    />
                  ),
                  code: ({
                    inline,
                    ...props
                  }: React.ComponentPropsWithoutRef<"code"> & {
                    inline?: boolean;
                  }) =>
                    inline ? (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      />
                    ) : (
                      <code
                        className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto my-4"
                        {...props}
                      />
                    ),
                  pre: ({ ...props }) => (
                    <pre
                      className="bg-muted p-4 rounded-lg overflow-x-auto my-4"
                      {...props}
                    />
                  ),
                }}
              >
                {news.content}
              </ReactMarkdown>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="hidden md:block">Published {formatRelativeDate(news.created_at)}</span>
                {news.updated_at !== news.created_at && (
                  <span>• Updated {formatRelativeDate(news.updated_at)}</span>
                )}
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="text-primary-font rounded-full "
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card id="comments-section" className="mt-4 scroll-mt-4">
          <CardContent className="p-4 md:p-6">
            <div className="mb-3">
              <h2 className="text-xl font-bold mb-3">Comments</h2>
              {/* Create Comment Form */}
              <CreateNewsComment
                newsId={newsId!}
                onSuccess={() => refetchComments()}
              />
            </div>

            {/* Comments List */}
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
                    newsId={newsId!}
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
      </div>
    </FullPage>
  );
}
