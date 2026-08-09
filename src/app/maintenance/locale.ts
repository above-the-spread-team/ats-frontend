import { cookies, headers } from "next/headers";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { countryLocale, primaryLanguageLocale } from "@/i18n/locale-detection";

// The /maintenance route sits outside [locale], so there is no locale param.
// Mirror the middleware's detection order: NEXT_LOCALE cookie, then the
// browser's primary language, then the visitor's region, then the default.
export async function getMaintenanceLocale(): Promise<string> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (hasLocale(routing.locales, cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return (
    primaryLanguageLocale(headerStore.get("accept-language")) ??
    countryLocale(headerStore.get("x-vercel-ip-country")) ??
    routing.defaultLocale
  );
}
