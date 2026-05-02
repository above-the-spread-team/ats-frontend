import { FaCalendarAlt, FaHome } from "react-icons/fa";
import { IoBarChart, IoNewspaper, IoChatbubbles } from "react-icons/io5";
import { GiTrophyCup } from "react-icons/gi";
import { IconType } from "react-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: FaHome,
  },
  {
    label: "Games",
    href: "/games",
    icon: FaCalendarAlt,
  },
  {
    label: "World Cup",
    href: "/world-cup/prediction",
    icon: GiTrophyCup,
  },

  {
    label: "News",
    href: "/news",
    icon: IoNewspaper,
  },
  {
    label: "Discuss",
    href: "/discuss",
    icon: IoChatbubbles,
  },
  {
    label: "Stats",
    href: "/stats",
    icon: IoBarChart,
  },
];

export const mobileNavItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: FaHome,
  },
  {
    label: "Games",
    href: "/games",
    icon: FaCalendarAlt,
  },
  {
    label: "News",
    href: "/news",
    icon: IoNewspaper,
  },
  {
    label: "Discuss",
    href: "/discuss",
    icon: IoChatbubbles,
  },
  {
    label: "Stats",
    href: "/stats",
    icon: IoBarChart,
  },
];
