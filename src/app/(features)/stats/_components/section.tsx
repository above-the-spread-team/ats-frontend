"use client";

import { LucideIcon } from "lucide-react";
import type { LeagueResponseItem } from "@/type/footballapi/league";

interface SectionProps {
  title: string;
  icon: LucideIcon;
  count: number;
  leagues: LeagueResponseItem[];
  renderLeagueCard: (league: LeagueResponseItem) => React.ReactNode;
}

export default function Section({
  title,
  icon: Icon,
  count,
  leagues,
  renderLeagueCard,
}: SectionProps) {
  if (leagues.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        <h3 className="md:text-base font-bold text-foreground">{title}</h3>
        <span className="px-2 py-0.5 bg-mygray/20 rounded-full text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
        {leagues.map((league) => renderLeagueCard(league))}
      </div>
    </>
  );
}
