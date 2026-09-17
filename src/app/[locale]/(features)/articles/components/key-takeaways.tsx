import { useTranslations } from "next-intl";

/** LLM-written standalone summary sentences — the part AI answers and snippets quote. */
export default function KeyTakeaways({ items }: { items?: string[] }) {
  const t = useTranslations("articles");
  if (!items || items.length === 0) return null;
  return (
    <section
      aria-labelledby="key-takeaways-heading"
      className="rounded-xl border border-border bg-muted/40 p-4"
    >
      <h2
        id="key-takeaways-heading"
        className="text-sm font-semibold text-primary-font uppercase tracking-wide mb-2"
      >
        {t("keyTakeaways")}
      </h2>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm md:text-base text-foreground"
          >
            <span className="mt-2 h-2 w-2 rounded-full bg-primary-font flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
