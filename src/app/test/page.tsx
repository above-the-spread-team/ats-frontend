"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MediaStackArticle {
  author: string | null;
  title: string;
  description: string;
  url: string;
  source: string;
  image: string | null;
  category: string;
  language: string;
  country: string;
  published_at: string;
}

interface MediaStackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: MediaStackArticle[];
}

export default function TestPage() {
  const [data, setData] = useState<MediaStackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState("");
  const [categories, setCategories] = useState("sports");
  const [languages, setLanguages] = useState("en");
  const [limit, setLimit] = useState("100");

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (keywords) params.append("keywords", keywords);
      if (categories) params.append("categories", categories);
      if (languages) params.append("languages", languages);
      if (limit) params.append("limit", limit);

      const response = await fetch(`/api/mediastack?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch news");
      }

      const result = (await response.json()) as MediaStackResponse;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">MediaStack News API Test</h1>
        <p className="text-muted-foreground mb-4">
          Test the MediaStack API to see what news data is available
        </p>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Search Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="keywords"
                  className="block text-sm font-medium mb-2"
                >
                  Keywords
                </label>
                <input
                  id="keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., football, Premier League"
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div>
                <label
                  htmlFor="categories"
                  className="block text-sm font-medium mb-2"
                >
                  Categories
                </label>
                <select
                  id="categories"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">All</option>
                  <option value="general">General</option>
                  <option value="business">Business</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="health">Health</option>
                  <option value="science">Science</option>
                  <option value="sports">Sports</option>
                  <option value="technology">Technology</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="languages"
                  className="block text-sm font-medium mb-2"
                >
                  Languages
                </label>
                <select
                  id="languages"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                  <option value="de">German</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="limit"
                  className="block text-sm font-medium mb-2"
                >
                  Limit (max 100)
                </label>
                <input
                  id="limit"
                  type="number"
                  min="1"
                  max="100"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={fetchNews} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Fetch News"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && data && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>
                Total: {data.pagination.total} | Showing:{" "}
                {data.pagination.count} | Limit: {data.pagination.limit} |
                Offset: {data.pagination.offset}
              </CardDescription>
            </CardHeader>
          </Card>

          {data.data && data.data.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((article, index) => (
                <Card
                  key={index}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      {article.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full md:w-48 h-32 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded">
                            {article.category}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {article.source}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {article.country.toUpperCase()}
                          </span>
                          {article.language && (
                            <span className="text-xs text-muted-foreground">
                              {article.language.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors"
                          >
                            {article.title}
                          </a>
                        </h3>
                        {article.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div>
                            {article.author && (
                              <span>By {article.author} • </span>
                            )}
                            <span>{formatDate(article.published_at)}</span>
                          </div>
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Read more →
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No news articles found
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
