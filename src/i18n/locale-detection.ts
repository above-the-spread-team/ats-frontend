import { routing } from "./routing";

type AppLocale = (typeof routing.locales)[number];

// Region fallback only — "en" is the global default, so English-speaking
// countries never need an entry here.
const COUNTRY_TO_LOCALE: Record<string, AppLocale> = {
  CN: "zh-CN",
  TW: "zh-TW",
  HK: "zh-TW",
  MO: "zh-TW",
  JP: "ja",
};

// Maps a BCP 47 language tag to a supported locale. Chinese needs script-level
// handling: bare "zh" and Hans regions read Simplified; Hant regions read
// Traditional.
export function mapLanguageTag(tag: string): AppLocale | undefined {
  const lower = tag.trim().toLowerCase();
  if (lower === "en" || lower.startsWith("en-")) return "en";
  if (lower === "ja" || lower.startsWith("ja-")) return "ja";
  if (lower === "zh" || lower.startsWith("zh-")) {
    return /^zh-(hant|tw|hk|mo)/.test(lower) ? "zh-TW" : "zh-CN";
  }
  return undefined;
}

// Considers only the top-weighted (primary) language: browsers append en with
// low q-values almost universally, so matching against the full list would
// make any region fallback unreachable.
export function primaryLanguageLocale(
  acceptLanguage: string | null,
): AppLocale | undefined {
  if (!acceptLanguage) return undefined;

  let bestTag: string | undefined;
  let bestQ = -1;
  for (const part of acceptLanguage.split(",")) {
    const [tag, ...params] = part.split(";");
    const trimmed = tag.trim();
    if (!trimmed || trimmed === "*") continue;
    let q = 1;
    for (const param of params) {
      const [key, value] = param.split("=");
      if (key.trim().toLowerCase() === "q") {
        const parsed = Number.parseFloat(value);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    if (q > bestQ) {
      bestQ = q;
      bestTag = trimmed;
    }
  }

  return bestTag ? mapLanguageTag(bestTag) : undefined;
}

export function countryLocale(
  country: string | null | undefined,
): AppLocale | undefined {
  if (!country) return undefined;
  return COUNTRY_TO_LOCALE[country.toUpperCase()];
}
