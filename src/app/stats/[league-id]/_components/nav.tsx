"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Trophy, Users } from "lucide-react";
type TabType = "standings" | "leaders" | "teams";

interface StatsNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  leagueId: string;
  season: number;
}

export default function StatsNav({
  activeTab,
  setActiveTab,
  leagueId,
  season,
}: StatsNavProps) {
  const router = useRouter();

  const tabs = [
    { id: "standings" as TabType, label: "Standings", icon: BarChart3 },
    { id: "leaders" as TabType, label: "Leaders", icon: Trophy },
    { id: "teams" as TabType, label: "Teams", icon: Users },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Update URL with tab parameter
    const params = new URLSearchParams();
    params.set("season", season.toString());
    params.set("tab", tab);
    router.push(`/stats/${leagueId}?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 border-b border-border overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-2 px-2 md:px-4  py-1.5 md:py-2 border-b-2 transition-colors whitespace-nowrap ${
              isActive
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm md:text-base">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
