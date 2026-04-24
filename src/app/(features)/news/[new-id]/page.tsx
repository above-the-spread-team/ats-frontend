"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FullPage from "@/components/common/full-page";
import NewsContentRenderer from "../components/news-content-renderer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MessageCircle,
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  Newspaper,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import AskLogin from "@/components/common/ask-login";
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi";
import {
  useNewsById,
  useNewsComments,
  useLikeNews,
  useDislikeNews,
} from "@/services/fastapi/news";
import { useCurrentUser } from "@/services/fastapi/oauth";
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

  const { data: currentUser, isLoading: isAuthLoading } = useCurrentUser();
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
  }, [news?.user_reaction, news?.likes, news?.dislikes]);

  const userLiked = optimistic?.liked ?? (news?.user_reaction === true);
  const userDisliked = optimistic?.disliked ?? (news?.user_reaction === false);
  const likeCount = optimistic?.likeCount ?? (news?.likes ?? 0);
  const dislikeCount = optimistic?.dislikeCount ?? (news?.dislikes ?? 0);

  // Scroll to top when news ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [newsId]);

  const handleLikeNews = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!newsId) return;

    setOptimistic(
      userLiked
        ? { liked: false, disliked: false, likeCount: likeCount - 1, dislikeCount }
        : userDisliked
          ? { liked: true, disliked: false, likeCount: likeCount + 1, dislikeCount: dislikeCount - 1 }
          : { liked: true, disliked: false, likeCount: likeCount + 1, dislikeCount },
    );

    try {
      await likeNewsMutation.mutateAsync(newsId);
    } catch (error) {
      setOptimistic(null);
      console.error("Error liking news:", error);
      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
    }
  };

  const handleDislikeNews = async () => {
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (!newsId) return;

    setOptimistic(
      userDisliked
        ? { liked: false, disliked: false, likeCount, dislikeCount: dislikeCount - 1 }
        : userLiked
          ? { liked: false, disliked: true, likeCount: likeCount - 1, dislikeCount: dislikeCount + 1 }
          : { liked: false, disliked: true, likeCount, dislikeCount: dislikeCount + 1 },
    );

    try {
      await dislikeNewsMutation.mutateAsync(newsId);
    } catch (error) {
      setOptimistic(null);
      console.error("Error disliking news:", error);
      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
      }
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
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
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

  // While resolving session, show a neutral skeleton
  if (isAuthLoading) {
    return (
      <FullPage>
        <div className="container mx-auto max-w-4xl px-4 py-6 space-y-4">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </FullPage>
    );
  }

  // Not authenticated — show blurred preview + login gate
  if (!currentUser) {
    return (
      <FullPage>
        <div className="container mx-auto max-w-4xl px-4 py-4 mb-8">
          {/* Back button still works */}
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4 text-primary-font rounded-full hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Blurred article preview */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="blur-[3px] pointer-events-none select-none space-y-4">
              <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
              <div className="bg-card rounded-xl border border-border p-5 sm:p-8 space-y-4">
                <Skeleton className="h-7 w-3/4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="pt-2 space-y-2.5">
                  {[
                    " w-full",
                    " w-full",
                    " w-5/6",
                    " w-full",
                    " w-4/5",
                    " w-full",
                    " w-3/4",
                  ].map((w, i) => (
                    <Skeleton key={i} className={`h-4${w}`} />
                  ))}
                </div>
                <div className="pt-2 space-y-2.5">
                  {[" w-full", " w-5/6", " w-full"].map((w, i) => (
                    <Skeleton key={i} className={`h-4${w}`} />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute inset-x-0 bottom-0 h-48 sm:h-64 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none" />

            {/* Login gate */}
            <div className="absolute inset-x-0 top-24 md:top-36 flex justify-center pb-6 sm:pb-10 px-4">
              <AskLogin
                description="Sign in to read full articles, join discussions, and access exclusive football analysis."
                features={[
                  { icon: Newspaper, label: "Full articles" },
                  { icon: BookOpen, label: "In-depth analysis" },
                  { icon: MessageSquare, label: "Comment & discuss" },
                ]}
                ctaLabel="Sign in to read"
                backHref="/news"
                backLabel="← Back to News"
                className="max-w-sm sm:max-w-md"
              />
            </div>
          </div>
        </div>
      </FullPage>
    );
  }

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
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }}
                    className="flex items-center hover:text-primary-font  transition-colors cursor-pointer"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    <span>{news.comment_count} </span>
                    <span className="ml-1 md:block hidden">comments</span>
                  </div>

                  {/* News Reactions */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={handleLikeNews}
                      className={`flex items-center gap-1 text-sm hover:text-heart-hover transition-colors ${
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
                      className={`flex items-center gap-1 text-sm hover:text-heart-hover transition-colors ${
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
            {news.content && <NewsContentRenderer content={news.content} />}

            {/* Footer Actions */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="hidden md:block">
                  Published {formatRelativeDate(news.created_at)}
                </span>
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
