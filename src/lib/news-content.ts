import type {
  ParsedNewsContent,
} from "@/type/fastapi/news";

/**
 * Safely parse news.content from JSON.
 * Returns null for old markdown content or invalid JSON.
 */
export function parseNewsContent(content: string): ParsedNewsContent | null {
  try {
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== "object") return null;

    // Explicit type field takes precedence
    if (parsed.type === "general_news" || parsed.type === "match_preview") {
      return parsed as ParsedNewsContent;
    }

    // Structural fallback for records stored without a type field
    if (Array.isArray(parsed.paragraphs)) {
      return { ...parsed, type: "match_preview" } as ParsedNewsContent;
    }
    if (Array.isArray(parsed.events)) {
      return { ...parsed, type: "general_news" } as ParsedNewsContent;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract a plain-text preview snippet from news content (used in list views).
 * Falls back gracefully for old markdown content.
 */
export function getNewsPreview(content: string, maxLength = 150): string {
  const parsed = parseNewsContent(content);

  if (!parsed) {
    // Old markdown — strip common syntax and truncate
    const plain = content
      .replace(/#{1,6}\s/g, "")
      .replace(/[*_`>[\]()]/g, "")
      .trim();
    return plain.length > maxLength
      ? plain.substring(0, maxLength) + "..."
      : plain;
  }

  let text = "";
  if (parsed.type === "general_news") {
    const first = parsed.events[0];
    text = first?.paragraphs?.[0] ?? first?.headline ?? "";
  } else {
    text = parsed.paragraphs[0] ?? "";
  }

  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}
