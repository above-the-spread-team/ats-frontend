"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AskLoginFeature {
  icon: React.ElementType;
  label: string;
}

interface AskLoginProps {
  title?: string;
  description?: string;
  features?: AskLoginFeature[];
  ctaLabel?: string;
  /** Show a secondary back-link below the CTA */
  backHref?: string;
  backLabel?: string;
  /** Extra classes on the outermost card wrapper (e.g. max-width) */
  className?: string;
}

/**
 * Reusable login gate card.
 * Drop it inside a `relative` container that already has
 * blurred content and a gradient fade, then position it with
 * `absolute` utility classes from the parent.
 */
export default function AskLogin({
  title,
  description,
  features = [],
  ctaLabel,
  backHref,
  backLabel,
  className,
}: AskLoginProps) {
  const t = useTranslations("worldCupVotePopup");
  const ct = useTranslations("common");
  return (
    <div
      className={cn(
        "w-full bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden",
        className,
      )}
    >
      {/* Top accent stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-primary-font/50 via-primary-font to-primary-font/50" />

      <div className="px-5 py-6 sm:px-8 sm:py-8 text-center space-y-5">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-font/10 ring-4 ring-primary-font/10 flex items-center justify-center">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary-font" />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-font rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
          </div>
        </div>

        {/* Heading & description */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {title ?? t("membersOnly")}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {description ?? t("signInToAccess")}
          </p>
        </div>

        {/* Feature pills */}
        {features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {features.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-primary-font bg-primary-font/8 border border-primary-font/20 px-2.5 py-1 rounded-full"
              >
                <Icon className="w-3 h-3 flex-shrink-0" />
                {label}
              </span>
            ))}
          </div>
        )}

        {/* CTA + optional back link */}
        <div className=" flex flex-col md:flex-row gap-2 ">
          <Link
            href="/login"
            className="block w-full py-2 bg-primary-font hover:bg-primary-font/90 text-white font-semibold text-sm  rounded-xl transition-all duration-150 hover:shadow-lg hover:shadow-primary-font/20 active:scale-[0.98] text-center"
          >
            {ctaLabel ?? ct("signIn")}
          </Link>
          {backHref && (
            <Link
              href={backHref}
              className="block w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors "
            >
              {backLabel ?? t("goBack")}
            </Link>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          {t("freeToJoin")}
        </p>
      </div>
    </div>
  );
}
