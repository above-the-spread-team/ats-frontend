"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/common/tag";
import { useNews } from "@/services/fastapi/news";
import type { NewsResponse } from "@/type/fastapi/news";
import { cn } from "@/lib/utils";
import HomeFailToLoad from "./home-fail-to-load";

function getFirstTag(news: NewsResponse) {
  return news.tags && news.tags.length > 0 ? news.tags[0].name : "Expert";
}

function ExpertAvatar({
  avatarUrl,
  name,
  className,
}: {
  avatarUrl: string | null;
  name: string | null;
  className?: string;
}) {
  const displayName = name || "Expert";

  return (
    <div
      className={cn(
        "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm ring-2 ring-amber-300/60 md:h-10 md:w-10",
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={displayName}
          fill
          className="object-cover"
          sizes="48px"
          unoptimized
        />
      ) : (
        <UserRound className="h-4 w-4 md:h-5 md:w-5" />
      )}
    </div>
  );
}

export default function HomeExpert() {
  const {
    data: expertData,
    isLoading,
    error,
  } = useNews(1, 4, undefined, "expert_perspective");

  if (isLoading) {
    return (
      <section className="w-full">
        <div className="px-2 mb-1.5">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-1 rounded-lg border border-border bg-card p-2 shadow-sm ">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-start gap-2 rounded-lg p-1.5"
            >
              <Skeleton className="h-10 w-10 rounded-full md:h-12 md:w-12" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full">
        <Link
          href="/news?tab=expert"
          className="text-sm px-2 block mb-1.5 text-primary-font hover:underline font-semibold"
        >
          <h2 className="text-lg md:text-xl font-bold">Expert Perspectives</h2>
        </Link>
        <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
          <HomeFailToLoad message="Failed to load expert perspectives" />
        </div>
      </section>
    );
  }

  const experts =
    expertData?.items?.filter((item) => item.is_published).slice(0, 4) ?? [];

  if (experts.length === 0) return null;

  return (
    <section className="w-full">
      <Link
        href="/news?tab=expert"
        className="text-sm px-2 block mb-1.5 text-primary-font hover:underline font-semibold"
      >
        <h2 className="text-base md:text-lg font-bold">Our Picks</h2>
      </Link>
      <div className="rounded-lg border border-border bg-card shadow-md overflow-hidden">
        <div className="grid divide-y divide-border md:divide-x md:divide-y-0">
          {experts.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.id}`}
              className="group flex items-center gap-2.5 px-3 py-1 transition-colors hover:bg-muted"
            >
              <ExpertAvatar
                avatarUrl={article.expert_avatar_url}
                name={article.expert_name}
              />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {article.expert_name || "Expert"}
                  </span>
                  <Tag
                    name={getFirstTag(article)}
                    variant="small"
                    className="!py-[2px]"
                  />
                </div>
                <h3 className="line-clamp-1 text-sm font-bold text-foreground transition-colors group-hover:text-primary-font">
                  {article.title}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {article.content_preview ?? ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
