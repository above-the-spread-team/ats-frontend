"use client";

import type React from "react";

import {
  NAV_ITEMS,
  type ProfileTabId,
  UserNav,
} from "@/app/(features)/profile/_components/user-nav";
import { Skeleton } from "@/components/ui/skeleton";

export interface ProfileShellProps {
  title: string;
  activeTab: ProfileTabId;
  onTabChange: (tab: ProfileTabId) => void;
  children: React.ReactNode;
  /** When false, self-only tabs are hidden (e.g. notifications on public profiles). Default true. */
  showNotifications?: boolean;
}

function getNavSkeletonItems(showNotifications: boolean | undefined) {
  const show = showNotifications ?? true;
  return show ? NAV_ITEMS : NAV_ITEMS.filter((item) => !item.selfOnly);
}

export function ProfilePageSkeleton({
  title,
  showNotifications,
}: {
  title: string;
  showNotifications?: boolean;
}) {
  const items = getNavSkeletonItems(showNotifications);
  return (
    <div className="container mx-auto space-y-4 px-2 md:px-4 max-w-6xl py-3 md:py-4">
      <h1 className="text-lg md:text-xl font-bold text-primary-title">
        {title}
      </h1>

      <div className="flex flex-col md:flex-row">
        <div className="flex flex-row md:flex-col h-fit justify-between w-full gap-0 md:w-40 bg-card border border-border/60 rounded-t-2xl md:rounded-r-none md:rounded-l-2xl overflow-hidden">
          {items.map((item) => (
            <Skeleton key={item.id} className="m-2 h-10 rounded-lg" />
          ))}
        </div>

        <div className="min-h-[700px] rounded-b-2xl rounded-t-none md:rounded-2xl md:rounded-tl-none w-full border border-border/60 border-l-0 bg-card p-4">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function ProfileShell({
  title,
  activeTab,
  onTabChange,
  children,
  showNotifications,
}: ProfileShellProps) {
  return (
    <div className="container mx-auto space-y-4 px-2 md:px-4 max-w-6xl py-3 md:py-4">
      {/* Header */}
      <h1 className="text-lg md:text-xl font-bold text-primary-title">
        {title}
      </h1>

      {/* Main content */}
      <div className="flex flex-col md:flex-row">
        <UserNav
          activeTab={activeTab}
          onTabChange={onTabChange}
          showNotifications={showNotifications}
        />

        {/* Right side Content - render panel by activeTab */}
        <div
          id={`profile-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`profile-tab-${activeTab}`}
          tabIndex={0}
          className="min-h-[700px] w-full rounded-b-2xl rounded-t-none md:rounded-2xl md:rounded-tl-none border border-border/60 border-l-0 bg-card p-4"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
