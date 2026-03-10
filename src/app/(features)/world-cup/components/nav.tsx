"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCalendarAlt, FaUsers } from "react-icons/fa";
import { IoBarChart, IoNewspaper } from "react-icons/io5";
import { GiTrophyCup } from "react-icons/gi";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { PiRanking, PiRankingFill } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";

const tabs = [
  {
    label: "Fixtures",
    href: "/world-cup",
    icon: RiCalendarScheduleFill,
    exact: true,
  },

  {
    label: "Ranking",
    href: "/world-cup/ranking",
    icon: PiRanking,
    exact: false,
  },
  {
    label: "News",
    href: "/world-cup/news",
    icon: IoNewspaperOutline,
    exact: false,
  },
  { label: "Teams", href: "/world-cup/teams", icon: FaUsers, exact: false },
];

export default function WorldCupNav() {
  const pathname = usePathname();

  return (
    <div className="container mx-auto bg-background/95 backdrop-blur-sm border-b border-border">
      <nav
        className="flex justify-center items-end gap-0.5 md:gap-1 overflow-x-auto scrollbar-none"
        aria-label="World Cup sections"
      >
        {tabs.map(({ label, href, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`
                  relative flex items-center gap-1.5 px-2 sm:px-4 py-3 text-sm font-semibold
                  whitespace-nowrap transition-colors duration-200 flex-shrink-0
                  ${
                    isActive
                      ? "text-primary-font"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
              {/* Active underline */}
              <span
                className={`
                    absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-200
                    ${isActive ? "bg-primary-font opacity-100" : "opacity-0"}
                  `}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
