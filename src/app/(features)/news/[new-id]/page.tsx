"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FullPage from "@/components/common/full-page";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle, Heart, Calendar, User } from "lucide-react";
import { useNewsById } from "@/services/fastapi/news";
import NoData from "@/components/common/no-data";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params["new-id"] ? parseInt(params["new-id"] as string) : null;

  const {
    data: news,
    isLoading,
    error,
  } = useNewsById(newsId && !isNaN(newsId) ? newsId : 0);

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

  const getCategoryColor = (tagName: string) => {
    const colors: Record<string, string> = {
      "Premier League": "bg-purple-500",
      "La Liga": "bg-orange-500",
      "Serie A": "bg-blue-500",
      "Champions League": "bg-indigo-600",
      "Europa League": "bg-orange-600",
      "Transfer News": "bg-green-500",
      International: "bg-red-500",
    };
    return colors[tagName] || "bg-gray-500";
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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </div>
        </div>
      </FullPage>
    );
  }

  return (
    <FullPage>
      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Article Content */}
        <Card className="overflow-hidden">
          {/* Featured Image */}
          {news.image_url && (
            <div className="relative w-full h-64 md:h-96 bg-muted">
              <Image
                src={news.image_url}
                alt={news.title}
                fill
                className="object-cover"
              />
              {news.tags && news.tags.length > 0 && (
                <div className="absolute top-4 left-4">
                  <span
                    className={`${getCategoryColor(
                      news.tags[0].name
                    )} text-white text-sm font-bold px-3 py-1.5 rounded-full`}
                  >
                    {news.tags[0].name}
                  </span>
                </div>
              )}
            </div>
          )}

          <CardContent className="p-6 md:p-8">
            {/* Article Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-4xl font-bold mb-4">
                {news.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b">
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
                {news.comment_count > 0 && (
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{news.comment_count} comments</span>
                  </div>
                )}
                {news.reaction_count > 0 && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{news.reaction_count} reactions</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {news.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/discuss?tag=${tag.id}`}
                      className={`${getCategoryColor(
                        tag.name
                      )} text-white text-xs font-semibold px-2 py-1 rounded-full hover:opacity-80 transition-opacity`}
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="prose prose-sm md:prose-base max-w-none">
              <div
                className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />
            </div>

            {/* Footer Actions */}
            <div className="mt-8 pt-6 border-t flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Published {formatRelativeDate(news.created_at)}</span>
                {news.updated_at !== news.created_at && (
                  <span>• Updated {formatRelativeDate(news.updated_at)}</span>
                )}
              </div>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </FullPage>
  );
}
