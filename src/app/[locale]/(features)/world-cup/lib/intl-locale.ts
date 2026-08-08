/** Maps app locales to BCP 47 locales for `toLocale*` / `Intl` formatting. */
const INTL_LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  "zh-TW": "zh-TW",
  "zh-CN": "zh-CN",
  ja: "ja-JP",
};

export function toIntlLocale(locale: string): string {
  return INTL_LOCALE_MAP[locale] ?? locale;
}
