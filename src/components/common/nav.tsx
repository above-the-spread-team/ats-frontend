"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { LucideIcon } from "lucide-react";

export interface NavTab<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon | null;
  count?: number;
}

export interface NavProps<T extends string = string> {
  tabs: NavTab<T>[];
  activeTab: T;
  setActiveTab: (tab: T) => void;
  // URL handling
  basePath?: string;
  preserveParams?: boolean;
  additionalParams?: Record<string, string>;
  // Styling
  className?: string;
  containerClassName?: string;
  hideIconOnMobile?: boolean;
  showIconAlways?: boolean;
  justify?: "start" | "between" | "evenly" | "center";
}

export default function Nav<T extends string = string>({
  tabs,
  activeTab,
  setActiveTab,
  basePath,
  preserveParams = false,
  additionalParams = {},
  className = "",
  containerClassName = "",
  hideIconOnMobile = false,
  showIconAlways = false,
  justify = "start",
}: NavProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = (tab: T) => {
    setActiveTab(tab);

    let params: URLSearchParams;
    if (preserveParams) {
      params = new URLSearchParams(searchParams.toString());
    } else {
      params = new URLSearchParams();
    }

    // Add additional params
    Object.entries(additionalParams).forEach(([key, value]) => {
      params.set(key, value);
    });

    // Set tab param
    params.set("tab", tab);

    // Determine the path to navigate to
    const targetPath = basePath || pathname;
    router.push(`${targetPath}?${params.toString()}`);
  };

  const justifyClass = {
    start: "justify-start",
    between: "justify-between",
    evenly: "justify-evenly",
    center: "justify-center",
  }[justify];

  return (
    <div
      className={`flex gap-2 border-b border-border overflow-x-auto ${containerClassName}`}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const showIcon = showIconAlways || (!hideIconOnMobile && Icon);

        return (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex   justify-center min-w-[59px] md:min-w-[84px] items-center  md:px-4 py-1 md:py-2 border-b-2 transition-colors whitespace-nowrap ${justifyClass} ${className} ${
              isActive
                ? "border-primary-font text-primary-font font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {showIcon && Icon && (
              <Icon
                className={`w-4 h-4 ${
                  hideIconOnMobile ? "hidden md:block" : ""
                }`}
              />
            )}
            <span className="text-base">{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
