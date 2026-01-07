import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.SERP_API_KEY || "";

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      {
        error: "Missing API key. Please set SERP_API_KEY in .env",
      },
      { status: 500 }
    );
  }

  try {
    const q = req.nextUrl.searchParams.get("q") || "";
    const gl = req.nextUrl.searchParams.get("gl") || "";
    const hl = req.nextUrl.searchParams.get("hl") || "";
    const engine = req.nextUrl.searchParams.get("engine") || "google_news";
    const topic_token = req.nextUrl.searchParams.get("topic_token") || "";
    const publication_token =
      req.nextUrl.searchParams.get("publication_token") || "";
    const section_token = req.nextUrl.searchParams.get("section_token") || "";
    const story_token = req.nextUrl.searchParams.get("story_token") || "";
    const so = req.nextUrl.searchParams.get("so") || "";
    const kgmid = req.nextUrl.searchParams.get("kgmid") || "";

    // Build params - engine is required for google_news
    const params = new URLSearchParams({
      engine,
      api_key: API_KEY,
      output: "json",
    });

    // Add query if provided (optional for google_news when using advanced params)
    if (q) params.append("q", q);

    // Add localization params
    if (gl) params.append("gl", gl);
    if (hl) params.append("hl", hl);

    // Add advanced Google News parameters
    if (topic_token) params.append("topic_token", topic_token);
    if (publication_token)
      params.append("publication_token", publication_token);
    if (section_token) params.append("section_token", section_token);
    if (story_token) params.append("story_token", story_token);
    if (so) params.append("so", so);
    if (kgmid) params.append("kgmid", kgmid);

    const url = `https://serpapi.com/search.json?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `SerpAPI failed with status ${response.status}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("SerpAPI Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error occurred while fetching news",
      },
      { status: 500 }
    );
  }
}
