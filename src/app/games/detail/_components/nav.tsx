"use client";

import { useRouter, usePathname } from "next/navigation";
import { Users, BarChart3, Activity, User, TrendingUp } from "lucide-react";

type TabType = "headtohead" | "lineups" | "statistics" | "events" | "players";

interface FixtureNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  fixtureId: string;
}

export default function FixtureNav({
  activeTab,
  setActiveTab,
  fixtureId,
}: FixtureNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: "headtohead" as TabType, label: "H2H", icon: TrendingUp },
    { id: "lineups" as TabType, label: "Lineups", icon: Users },
    { id: "statistics" as TabType, label: "Statistics", icon: BarChart3 },
    { id: "events" as TabType, label: "Events", icon: Activity },
    { id: "players" as TabType, label: "Players", icon: User },
  ];

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Update URL with tab parameter
    const params = new URLSearchParams();
    params.set("id", fixtureId);
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
            className={`flex items-center gap-2 px-2 md:px-4 py-1.5 md:py-2 border-b-2 transition-colors whitespace-nowrap ${
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
