"use client";

import { useRouter, usePathname } from "next/navigation";
import { Users, BarChart3 } from "lucide-react";

type TabType = "statistics" | "squad";

interface TeamNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  leagueId: string;
  teamId: string;
  season: number;
}

export default function TeamNav({
  activeTab,
  setActiveTab,
  leagueId,
  teamId,
  season,
}: TeamNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: "statistics" as TabType, label: "Statistics", icon: BarChart3 },
    { id: "squad" as TabType, label: "Squad", icon: Users },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Update URL with tab parameter
    const params = new URLSearchParams();
    params.set("season", season.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
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
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
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
