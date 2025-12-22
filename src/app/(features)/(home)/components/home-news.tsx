"use client";

import { mockNews } from "@/data/news-mock";
import Link from "next/link";

export default function HomeNews() {
  // Get top 5 news items
  const topNews = mockNews.slice(0, 5);

  const formatDate = (dateString: string) => {
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
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Premier League": "bg-purple-500",
      "La Liga": "bg-orange-500",
      "Serie A": "bg-blue-500",
      "Champions League": "bg-indigo-600",
      "Europa League": "bg-orange-600",
      "Transfer News": "bg-green-500",
      International: "bg-red-500",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="w-full">
      <Link
        href="/news"
        className="text-sm px-2 block mb-2 text-primary-font hover:underline font-semibold"
      >
        <h2 className="text-lg md:text-xl font-bold">Latest News</h2>
      </Link>
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="divide-y divide-border">
          {topNews.map((article) => (
            <Link
              key={article.id}
              href={article.url}
              className="block p-3 hover:bg-muted/30 transition-colors group"
            >
              <div className="flex items-start gap-2">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Category Badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-semibold text-white ${getCategoryColor(
                          article.category
                        )}`}
                      >
                        {article.category}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {article.source}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                    {article.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
