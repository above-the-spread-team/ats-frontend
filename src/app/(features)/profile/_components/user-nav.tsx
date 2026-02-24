"use client";

import { User, Users, FileText, Bell } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileTabId = "user-info" | "groups" | "posts" | "notifications";

export const NAV_ITEMS: {
  id: ProfileTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}[] = [
  { id: "user-info", label: "User info", shortLabel: "Info", icon: User },
  { id: "groups", label: "Groups", shortLabel: "Group", icon: Users },
  { id: "posts", label: "Posts", shortLabel: "Post", icon: FileText },
  { id: "notifications", label: "Notifications", shortLabel: "", icon: Bell },
];

export interface UserNavProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  /** When false, notifications tab is hidden (e.g. when viewing another user's profile). Default true. */
  showNotifications?: boolean;
}

export function UserNav({
  activeTab,
  onTabChange,
  showNotifications = true,
}: UserNavProps) {
  const items = showNotifications
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => item.id !== "notifications");

  return (
    <div className="flex flex-row md:flex-col h-fit justify-between w-fit gap-0 md:w-40 bg-card border border-border/60 rounded-t-2xl md:rounded-r-none md:rounded-l-2xl overflow-hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors",
              isActive
                ? "bg-primary/15 text-primary-font font-medium border-b-2 md:border-b-0 md:border-r-2 border-primary-font"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {item.shortLabel ? (
              <span className="md:hidden">{item.shortLabel}</span>
            ) : null}
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
