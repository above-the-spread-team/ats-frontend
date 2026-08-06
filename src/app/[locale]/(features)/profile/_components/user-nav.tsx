"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { User, Users, FileText, Bell, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProfileTabId =
  | "user-info"
  | "groups"
  | "posts"
  | "notifications"
  | "predictions";

interface NavItem {
  id: ProfileTabId;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  selfOnly?: boolean;
}

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
  const t = useTranslations("profile");

  const items: NavItem[] = useMemo(
    () =>
      ([
        { id: "user-info" as const, label: t("info"), shortLabel: t("info"), icon: User },
        { id: "groups" as const, label: t("groups"), shortLabel: t("groups"), icon: Users },
        { id: "posts" as const, label: t("posts"), shortLabel: t("posts"), icon: FileText },
        { id: "predictions" as const, label: t("predictions"), shortLabel: t("picks"), icon: Target },
        { id: "notifications" as const, label: t("notifications"), shortLabel: t("notifications"), icon: Bell, selfOnly: true },
      ] as NavItem[]).filter((item) => (showNotifications ? true : !item.selfOnly)),
    [t, showNotifications],
  );

  return (
    <nav
      aria-label={t("sectionAriaLabel")}
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
