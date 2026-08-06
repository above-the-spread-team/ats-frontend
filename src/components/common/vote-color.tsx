"use client";

import { useTranslations } from "next-intl";

interface VoteColorProps {
  className?: string;
  textClassName?: string;
}

const VOTE_COLOR_ITEMS: { labelKey: "home" | "draw" | "away"; color: string }[] = [
  { labelKey: "home", color: "bg-vote-blue" },
  { labelKey: "draw", color: "bg-vote-yellow" },
  { labelKey: "away", color: "bg-vote-red" },
];

export default function VoteColor({
  className = "",
  textClassName = "text-muted-foreground",
}: VoteColorProps) {
  const t = useTranslations("common");
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {VOTE_COLOR_ITEMS.map((item) => (
        <span
          key={item.labelKey}
          className={`inline-flex items-center gap-1 text-[11px] ${textClassName}`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${item.color}`}
            aria-hidden
          />
          {t(item.labelKey)}
        </span>
      ))}
    </div>
  );
}
