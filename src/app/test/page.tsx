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

interface NewsSource {
  name: string;
  icon?: string;
  authors?: string[];
}

interface NewsResult {
  position: number;
  title: string;
  source?: NewsSource;
  link: string;
  thumbnail?: string;
  thumbnail_small?: string;
  date: string;
  iso_date?: string;
}

interface MenuLink {
  title: string;
  topic_token?: string;
  publication_token?: string;
  section_token?: string;
  serpapi_link?: string;
}

interface SearchMetadata {
  id?: string;
  status?: string;
  json_endpoint?: string;
  created_at?: string;
  processed_at?: string;
  google_news_url?: string;
  raw_html_file?: string;
  total_time_taken?: number;
}

interface SerpApiResponse {
  search_metadata?: SearchMetadata;
  search_parameters: {
    engine: string;
    q?: string;
    gl?: string;
    hl?: string;
    topic_token?: string;
    publication_token?: string;
    section_token?: string;
    story_token?: string;
    so?: string;
    kgmid?: string;
  };
  news_results?: NewsResult[];
  menu_links?: MenuLink[];
  error?: string;
}

export default function Test() {
  const [data, setData] = useState<SerpApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("Premier League");
  const [gl, setGl] = useState("uk"); // Country code (e.g., uk for United Kingdom)
  const [hl, setHl] = useState("en"); // Language code

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        engine: "google_news",
        q: query,
        gl: gl,
        hl: hl,
      });
      const response = await fetch(`/api/serpapi?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch news");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []); // Fetch on initial load

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleMenuLinkClick = async (link: MenuLink) => {
    if (!link.serpapi_link) return;

    setLoading(true);
    setError(null);
    try {
      // Extract the full URL and make a request
      const url = new URL(link.serpapi_link);
      const params = new URLSearchParams(url.search);
      params.set("api_key", ""); // Will be added by API route

      // Build our API route URL
      const apiParams = new URLSearchParams();
      if (params.get("engine")) apiParams.set("engine", params.get("engine")!);
      if (params.get("q")) apiParams.set("q", params.get("q")!);
      if (params.get("gl")) apiParams.set("gl", params.get("gl")!);
      if (params.get("hl")) apiParams.set("hl", params.get("hl")!);
      if (params.get("topic_token"))
        apiParams.set("topic_token", params.get("topic_token")!);
      if (params.get("publication_token"))
        apiParams.set("publication_token", params.get("publication_token")!);
      if (params.get("section_token"))
        apiParams.set("section_token", params.get("section_token")!);

      const response = await fetch(`/api/serpapi?${apiParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch news");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SerpAPI Google News Test</h1>
        <p className="text-muted-foreground mb-4">
          Testing SerpAPI for Google News articles
        </p>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <input
            type="text"
            placeholder="Search query (e.g., Premier League)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-3 py-2 border rounded-md flex-1 min-w-[200px]"
          />
          <input
            type="text"
            placeholder="Country code (e.g., uk, us, fr)"
            value={gl}
            onChange={(e) => setGl(e.target.value)}
            className="px-3 py-2 border rounded-md w-32"
          />
          <input
            type="text"
            placeholder="Language (e.g., en, es, fr)"
            value={hl}
            onChange={(e) => setHl(e.target.value)}
            className="px-3 py-2 border rounded-md w-32"
          />
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

      {data && !loading && (
        <div className="space-y-4">
          {/* Search Metadata */}
          {data.search_metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Search Metadata</CardTitle>
                <CardDescription>
                  Status: {data.search_metadata.status || "N/A"} | Engine:{" "}
                  {data.search_parameters.engine} | Query:{" "}
                  {data.search_parameters.q || "N/A"} | Country:{" "}
                  {data.search_parameters.gl || "N/A"} | Language:{" "}
                  {data.search_parameters.hl || "N/A"}
                  {data.search_metadata.total_time_taken &&
                    ` | Time: ${data.search_metadata.total_time_taken}s`}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {/* Menu Links */}
          {data.menu_links && data.menu_links.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Menu Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.menu_links.map((link, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleMenuLinkClick(link)}
                      disabled={loading}
                    >
                      {link.title}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main News Results */}
          {data.news_results && data.news_results.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">News Results</h2>
              <div className="grid gap-4">
                {data.news_results.map((article, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">
                            <a
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline text-primary"
                            >
                              {article.title}
                            </a>
                          </CardTitle>
                          <CardDescription className="text-sm mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {article.source?.icon && (
                                <img
                                  src={article.source.icon}
                                  alt={article.source?.name || "Source"}
                                  className="w-4 h-4"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              )}
                              <span>
                                {article.source?.name || "Unknown Source"}
                              </span>
                              {article.source?.authors &&
                                article.source.authors.length > 0 && (
                                  <span className="text-muted-foreground">
                                    • {article.source.authors.join(", ")}
                                  </span>
                                )}
                              <span>• {article.date || "N/A"}</span>
                              {article.iso_date && (
                                <span className="text-muted-foreground">
                                  • {formatDate(article.iso_date)}
                                </span>
                              )}
                            </div>
                          </CardDescription>
                        </div>
                        {article.thumbnail && (
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Read full article →
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {(!data.news_results || data.news_results.length === 0) && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No news results found
              </CardContent>
            </Card>
          )}

          {/* Raw JSON Data */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Raw API Response</CardTitle>
              <CardDescription>
                Full JSON data returned by the API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                {JSON.stringify(data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
