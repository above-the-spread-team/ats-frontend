"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import FullPage from "@/components/common/full-page";

// Server pages throw when the backend / data provider is down (instead of rendering a
// "not found" UI with HTTP 200), so crawlers see a 5xx and retry rather than dropping the URL.
export default function FeaturesError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <FullPage center>
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <p className="text-destructive mb-4">{t("somethingWentWrong")}</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-full border border-input px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            {t("tryAgain")}
          </button>
          <Link href="/" className="text-primary-font font-semibold hover:underline">
            {t("goToHome")}
          </Link>
        </div>
      </div>
    </FullPage>
  );
}
