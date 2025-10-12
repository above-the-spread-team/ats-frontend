import Image from "next/image";
import { mockNews } from "@/data/news-mock";

export default function News() {
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
      year: "numeric",
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

  // Split news into featured (first article) and regular news
  const [featuredArticle, ...regularNews] = mockNews;

  return (
    <div className="min-h-screen bg-background p-2 md:p-6 pb-20 md:pb-6">
      <h1 className="text-lg md:text-2xl font-bold mb-3 md:mb-6 px-1 md:px-0">
        Latest Football News
      </h1>

      {/* Featured Article */}
      <div className="mb-4 md:mb-8">
        <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
          <div className="relative h-40 md:h-80 bg-muted">
            <Image
              src={featuredArticle.image}
              alt={featuredArticle.title}
              fill
              className="object-contain p-6 md:p-16"
            />
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <span
                className={`${getCategoryColor(
                  featuredArticle.category
                )} text-white text-xs font-bold px-2 md:px-3 py-1 rounded-full`}
              >
                {featuredArticle.category}
              </span>
            </div>
          </div>
          <div className="p-3 md:p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="font-semibold truncate">
                {featuredArticle.source}
              </span>
              <span className="flex-shrink-0">•</span>
              <span className="flex-shrink-0">
                {formatDate(featuredArticle.publishedAt)}
              </span>
            </div>
            <h2 className="text-base md:text-2xl font-bold mb-2 md:mb-3 line-clamp-2 md:line-clamp-none">
              {featuredArticle.title}
            </h2>
            <p className="text-xs md:text-base text-muted-foreground mb-2 md:mb-4 line-clamp-2 md:line-clamp-3">
              {featuredArticle.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate mr-2">
                By {featuredArticle.author}
              </span>
              <button className="text-primary font-semibold text-xs md:text-sm hover:underline flex-shrink-0">
                Read More →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Regular News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {regularNews.map((article) => (
          <div
            key={article.id}
            className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="relative h-28 md:h-40 bg-muted">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-contain p-4 md:p-8"
              />
              <div className="absolute top-2 left-2">
                <span
                  className={`${getCategoryColor(
                    article.category
                  )} text-white text-xs font-bold px-2 py-0.5 md:py-1 rounded-full`}
                >
                  {article.category}
                </span>
              </div>
            </div>
            <div className="p-2.5 md:p-4">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                <span className="font-semibold truncate max-w-[60px] md:max-w-none">
                  {article.source}
                </span>
                <span className="flex-shrink-0">•</span>
                <span className="flex-shrink-0">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
              <h3 className="font-bold text-xs md:text-base mb-1.5 md:mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3 line-clamp-2">
                {article.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground truncate mr-2 max-w-[140px]">
                  By {article.author}
                </span>
                <button className="text-primary font-semibold text-xs hover:underline flex-shrink-0">
                  Read →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
