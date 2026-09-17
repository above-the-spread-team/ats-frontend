import type {
  GeneralNewsContent,
  MatchPreviewContent,
  ExpertPerspectiveContent,
  ExpertPick,
  FaqItem,
  NewsSource,
  SeoFields,
  ParsedNewsContent,
} from "@/type/fastapi/news";

function coerceStringArray(value: unknown): string[] {
  if (value == null) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map((item) =>
      String(item),
    );
  }
  return [String(value)];
}

function coerceSources(value: unknown): NewsSource[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        item != null && typeof item === "object",
    )
    .map((item) => ({
      title: String(item.title ?? ""),
      url: String(item.url ?? ""),
    }))
    .filter((source) => source.title || source.url);
}

// Guard against generation bugs that leaked the `expert_pick` object into
// `paragraphs` as raw JSON text (seen in production expert articles, Jun–Aug 2026).
const LEAK_PATTERNS = [
  /^\s*[[{]/,
  /expert_pick/,
  /"(team|confidence|reasons|key_stats)"\s*:/,
  /^\s*(team|confidence|reasons|key_stats)\s*[:{]?\s*$/,
];

function isLeakedJson(paragraph: string): boolean {
  return LEAK_PATTERNS.some((re) => re.test(paragraph));
}

function coerceParagraphs(value: unknown): string[] {
  return coerceStringArray(value).filter(
    (paragraph) => paragraph.trim().length > 0 && !isLeakedJson(paragraph),
  );
}

// SEO block (meta_description / key_takeaways / faq) — optional on every content type.
function coerceSeoFields(parsed: Record<string, unknown>): SeoFields {
  const meta =
    typeof parsed.meta_description === "string"
      ? parsed.meta_description.trim()
      : "";

  const takeaways = Array.isArray(parsed.key_takeaways)
    ? parsed.key_takeaways
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && !isLeakedJson(item))
    : [];

  const faq: FaqItem[] = Array.isArray(parsed.faq)
    ? parsed.faq
        .filter(
          (item): item is Record<string, unknown> =>
            item != null && typeof item === "object",
        )
        .map((item) => ({
          question: typeof item.question === "string" ? item.question.trim() : "",
          answer: typeof item.answer === "string" ? item.answer.trim() : "",
        }))
        .filter((item) => item.question && item.answer)
    : [];

  return {
    meta_description: meta || null,
    key_takeaways: takeaways,
    faq,
  };
}

function coerceExpertPick(value: unknown): ExpertPick | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const pick = value as Record<string, unknown>;
  const team = typeof pick.team === "string" ? pick.team.trim() : "";
  const confidence = String(pick.confidence ?? "").toLowerCase();
  if (!team || team.toLowerCase() === "unknown") return null;
  if (confidence !== "high" && confidence !== "medium" && confidence !== "low") {
    return null;
  }
  const clean = (list: unknown) =>
    Array.isArray(list)
      ? list
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => item.length > 0 && !isLeakedJson(item))
      : [];
  return {
    team,
    confidence,
    reasons: clean(pick.reasons),
    key_stats: clean(pick.key_stats),
  };
}

function normalizeGeneralNews(
  parsed: Record<string, unknown>,
): GeneralNewsContent | null {
  if (!Array.isArray(parsed.events)) return null;

  const events = parsed.events
    .filter(
      (item): item is Record<string, unknown> =>
        item != null && typeof item === "object",
    )
    .map((event) => ({
      headline: String(event.headline ?? ""),
      paragraphs: coerceStringArray(event.paragraphs),
      sources: coerceSources(event.sources),
    }))
    .filter((event) => event.headline || event.paragraphs.length > 0);

  if (events.length === 0) return null;

  return {
    type: "general_news",
    league: String(parsed.league ?? ""),
    date: String(parsed.date ?? ""),
    events,
    ...coerceSeoFields(parsed),
  };
}

function normalizeMatchPreview(
  parsed: Record<string, unknown>,
): MatchPreviewContent | null {
  if (!Array.isArray(parsed.paragraphs)) return null;

  const paragraphs = coerceParagraphs(parsed.paragraphs);
  if (paragraphs.length === 0) return null;

  return {
    type: "match_preview",
    paragraphs,
    betting_tips: coerceStringArray(parsed.betting_tips),
    sources: coerceSources(parsed.sources),
    ...coerceSeoFields(parsed),
  };
}

function normalizeExpertPerspective(
  parsed: Record<string, unknown>,
): ExpertPerspectiveContent | null {
  if (!Array.isArray(parsed.paragraphs)) return null;

  const paragraphs = coerceParagraphs(parsed.paragraphs);
  if (paragraphs.length === 0) return null;

  return {
    type: "expert_perspective",
    paragraphs,
    expert_pick: coerceExpertPick(parsed.expert_pick),
    sources: coerceSources(parsed.sources),
    ...coerceSeoFields(parsed),
  };
}

function isMatchPreviewType(type: unknown): boolean {
  return type === "match_preview" || type === "preview";
}

function isGeneralNewsType(type: unknown): boolean {
  return type === "general_news";
}

function isExpertPerspectiveType(type: unknown): boolean {
  return type === "expert_perspective";
}

/**
 * Safely parse news.content from JSON.
 * Normalizes legacy/alternate type values (e.g. "preview" → match_preview).
 * Returns null for old markdown content or invalid JSON.
 */
export function parseNewsContent(content: string): ParsedNewsContent | null {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return null;

    const type = parsed.type;

    if (isGeneralNewsType(type) || (Array.isArray(parsed.events) && !parsed.paragraphs)) {
      return normalizeGeneralNews(parsed);
    }

    if (isExpertPerspectiveType(type)) {
      return normalizeExpertPerspective(parsed);
    }

    if (
      isMatchPreviewType(type) ||
      (Array.isArray(parsed.paragraphs) && !parsed.events)
    ) {
      return normalizeMatchPreview(parsed);
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
  } else if (parsed.type === "expert_perspective" || parsed.type === "match_preview") {
    text = parsed.paragraphs[0] ?? "";
  } else {
    text = "";
  }

  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

/** First body paragraph (or lead headline) — the fallback source for a meta description. */
export function getLeadText(parsed: ParsedNewsContent | null): string {
  if (!parsed) return "";
  if (parsed.type === "general_news") {
    const first = parsed.events[0];
    return first?.paragraphs?.[0] ?? first?.headline ?? "";
  }
  return parsed.paragraphs[0] ?? "";
}
