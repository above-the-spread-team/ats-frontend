import { useTranslations } from "next-intl";
import type { FaqItem } from "@/type/fastapi/news";

/**
 * Always-visible Q&A (no accordion): the FAQPage structured data on the page must match
 * text a visitor can actually read.
 */
export default function ArticleFaq({ items }: { items?: FaqItem[] }) {
  const t = useTranslations("articles");
  if (!items || items.length === 0) return null;
  return (
    <section aria-labelledby="article-faq-heading" className="pt-4 border-t border-border">
      <h2
        id="article-faq-heading"
        className="text-lg md:text-xl font-bold text-foreground mb-3"
      >
        {t("faqHeading")}
      </h2>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i}>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {item.question}
            </h3>
            <p className="leading-7 text-base text-muted-foreground">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
