"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaUsers } from "react-icons/fa";

import { RiCalendarScheduleFill } from "react-icons/ri";
import { PiRanking } from "react-icons/pi";
import { IoNewspaperOutline } from "react-icons/io5";
import { MdSportsSoccer } from "react-icons/md";

const tabs = [
  {
    label: "Prediction",
    href: "/world-cup/prediction",
    icon: MdSportsSoccer,
    exact: false,
  },
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
        className="flex w-full items-center md:items-end md:justify-center gap-0.5 md:gap-1 overflow-x-auto scrollbar-none"
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
                  relative flex min-w-0 flex-1 flex-col md:flex-none md:flex-shrink-0
                  md:flex-row items-center justify-center gap-0.5 md:gap-1.5
                  px-1 sm:px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold
                  text-center whitespace-normal md:whitespace-nowrap transition-colors duration-200
                  ${
                    isActive
                      ? "text-primary-font"
                      : "text-muted-foreground hover:text-foreground"
                  }
                `}
            >
              <Icon className="w-4 h-4 md:w-3.5 md:h-3.5 flex-shrink-0" />
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
