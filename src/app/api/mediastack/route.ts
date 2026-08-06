import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.MEDIASTACK_API_KEY || "";

export async function GET(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      {
        error: "Missing API key. Please set MEDIASTACK_API_KEY in .env",
      },
      { status: 500 }
    );
  }

  try {
    // Get query parameters
    const keywords = req.nextUrl.searchParams.get("keywords") || "";
    const countries = req.nextUrl.searchParams.get("countries") || "";
    const languages = req.nextUrl.searchParams.get("languages") || "en";
    const categories = req.nextUrl.searchParams.get("categories") || "";
    const limit = req.nextUrl.searchParams.get("limit") || "100";
    const sort = req.nextUrl.searchParams.get("sort") || "published_desc";
    const date = req.nextUrl.searchParams.get("date") || "";
    const sources = req.nextUrl.searchParams.get("sources") || "";
    const offset = req.nextUrl.searchParams.get("offset") || "0";

    // Build MediaStack API URL
    const params = new URLSearchParams({
      access_key: API_KEY,
      languages,
      limit,
      sort,
      offset,
    });

    // Add optional parameters if provided
    if (keywords) {
      params.append("keywords", keywords);
    }
    if (countries) {
      params.append("countries", countries);
    }
    if (categories) {
      params.append("categories", categories);
    }
    if (date) {
      params.append("date", date);
    }
    if (sources) {
      params.append("sources", sources);
    }

    const url = `https://api.mediastack.com/v1/news?${params.toString()}`;

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `MediaStack API failed with status ${response.status}: ${errorText}`
      );
    }

    const data = await response.json();

    // Check for API errors in response
    if (data.error) {
      throw new Error(data.error.info || "MediaStack API error");
    }

    // Log successful result
    console.log("✅ MediaStack API Success:", {
      keywords,
      countries,
      languages,
      categories,
      limit,
      sort,
      date,
      pagination: data.pagination,
      results: data.data?.length || 0,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("MediaStack API Error:", error);
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
