import { cookies } from "next/headers";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

// The /maintenance route sits outside [locale], so there is no locale param.
// The best signal available is the NEXT_LOCALE cookie the locale switcher and
// next-intl middleware maintain; fall back to the default locale.
export async function getMaintenanceLocale(): Promise<string> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  return hasLocale(routing.locales, cookieLocale)
    ? cookieLocale
    : routing.defaultLocale;
}
