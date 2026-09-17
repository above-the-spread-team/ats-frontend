import type { TagHub, TagResponse } from "@/type/fastapi/tags";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function serverGet<T>(
  url: string,
  revalidate: number
): Promise<{ data: T | null; status: number }> {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate },
    });
    if (!response.ok) return { data: null, status: response.status };
    return { data: (await response.json()) as T, status: response.status };
  } catch {
    return { data: null, status: 0 };
  }
}

/** Tag by id; `lang` adds translated_name. `status` separates a missing tag from an outage. */
export async function serverFetchTag(tagId: number, lang?: string) {
  const query = lang && lang !== "en" ? `?lang=${lang}` : "";
  return serverGet<TagResponse>(`${BACKEND_URL}/api/v1/tags/${tagId}${query}`, 300);
}

/** League/team tags that have published articles (hub index pages, sitemap, llms.txt). */
export async function serverFetchTagHubs(lang?: string): Promise<TagHub[]> {
  const query = lang && lang !== "en" ? `?lang=${lang}` : "";
  const { data } = await serverGet<TagHub[]>(
    `${BACKEND_URL}/api/v1/tags/hubs${query}`,
    3600
  );
  return data ?? [];
}
