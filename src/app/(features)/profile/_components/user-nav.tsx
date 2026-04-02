"use client";

import { User, Users, FileText, Bell, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileTabId =
  | "user-info"
  | "groups"
  | "posts"
  | "notifications"
  | "predictions";

export const NAV_ITEMS: {
  id: ProfileTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  /** When true, tab is only visible on own profile (like notifications). */
  selfOnly?: boolean;
}[] = [
  { id: "user-info", label: "User info", shortLabel: "Info", icon: User },
  { id: "groups", label: "Groups", shortLabel: "Group", icon: Users },
  { id: "posts", label: "Posts", shortLabel: "Post", icon: FileText },
  {
    id: "predictions",
    label: "Predictions",
    shortLabel: "Picks",
    icon: Target,
  },
  {
    id: "notifications",
    label: "Notifications",
    shortLabel: "Notification",
    icon: Bell,
    selfOnly: true,
  },
];

export interface UserNavProps {
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  /** When false, self-only tabs (notifications, predictions) are hidden. Default true. */
  showNotifications?: boolean;
}

export function UserNav({
  activeTab,
  onTabChange,
  showNotifications = true,
}: UserNavProps) {
  const items = showNotifications
    ? NAV_ITEMS
    : NAV_ITEMS.filter((item) => !item.selfOnly);

  return (
    <nav
      aria-label="Profile sections"
      role="tablist"
      className="flex flex-row md:flex-col h-fit justify-start md:justify-start w-full md:w-40 gap-0 bg-card border border-border/60 rounded-t-2xl md:rounded-r-none md:rounded-l-2xl overflow-hidden md:overflow-visible md:sticky md:top-24 z-10"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            id={`profile-tab-${item.id}`}
            aria-controls={isActive ? `profile-panel-${item.id}` : undefined}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-center text-xs transition-colors min-w-0 md:flex-none md:flex-row md:justify-start md:gap-2 md:px-4 md:py-3 md:text-left md:text-sm first:rounded-tl-2xl last:rounded-tr-2xl md:first:rounded-tr-none md:last:rounded-tr-none md:first:rounded-tl-2xl md:last:rounded-bl-2xl",
              isActive
                ? "bg-primary text-white font-semibold border-b-4 border-b-primary-hero md:border-b-0 md:border-r-4 md:border-r-primary-hero"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-b-2 border-transparent md:border-b-0 md:border-l-2 md:border-l-transparent",
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0 md:h-4 md:w-4" />
            {item.shortLabel ? (
              <span className="md:hidden leading-none">{item.shortLabel}</span>
            ) : null}
            <span className="hidden md:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
