import { FaCalendarAlt, FaHome, FaLightbulb } from "react-icons/fa";
import { IoBarChart, IoNewspaper, IoChatbubbles } from "react-icons/io5";

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
    label: "Our Picks",
    href: "/our-picks",
    icon: FaLightbulb,
  },

  {
    label: "Articles",
    href: "/articles?tab=news",
    icon: IoNewspaper,
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
    label: "Articles",
    href: "/news?tab=news",
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
