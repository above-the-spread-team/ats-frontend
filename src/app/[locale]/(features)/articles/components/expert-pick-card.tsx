import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ExpertPick } from "@/type/fastapi/news";

const CONFIDENCE_STYLES: Record<ExpertPick["confidence"], string> = {
  high: "bg-emerald-600 text-white",
  medium: "bg-amber-500 text-white",
  low: "bg-muted-foreground text-white",
};

function PickList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The expert's structured verdict: side, confidence, reasons and the stats behind it. */
export default function ExpertPickCard({
  pick,
  expertName,
}: {
  pick?: ExpertPick | null;
  expertName?: string | null;
}) {
  const t = useTranslations("articles.expertPick");
  if (!pick) return null;
  return (
    <section
      aria-labelledby="expert-pick-heading"
      className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 space-y-3"
    >
      <h2
        id="expert-pick-heading"
        className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide"
      >
        {expertName ? t("heading", { expert: expertName }) : t("headingGeneric")}
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-lg md:text-xl font-bold text-foreground">{pick.team}</p>
        <span
          className={cn(
            "text-xs font-bold px-3 py-1 rounded-full",
            CONFIDENCE_STYLES[pick.confidence],
          )}
        >
          {t("confidenceLabel")}: {t(`confidence.${pick.confidence}`)}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <PickList title={t("reasons")} items={pick.reasons} />
        <PickList title={t("keyStats")} items={pick.key_stats} />
      </div>
    </section>
  );
}
