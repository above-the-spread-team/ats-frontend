import { FaCalendarAlt, FaHome, FaLightbulb, FaTrophy } from "react-icons/fa";
import { IoBarChart, IoNewspaper, IoChatbubbles } from "react-icons/io5";

import { IconType } from "react-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export const navItems: NavItem[] = [
  {
    label: "nav.home",
    href: "/",
    icon: FaHome,
  },
  {
    label: "nav.games",
    href: "/games",
    icon: FaCalendarAlt,
  },
  {
    label: "nav.ourPicks",
    href: "/our-picks",
    icon: FaLightbulb,
  },

  {
    label: "nav.news",
    href: "/news",
    icon: IoNewspaper,
  },
  {
    label: "nav.discuss",
    href: "/discuss",
    icon: IoChatbubbles,
  },
  {
    label: "nav.stats",
    href: "/stats",
    icon: IoBarChart,
  },
];

export const mobileNavItems: NavItem[] = [
  {
    label: "nav.home",
    href: "/",
    icon: FaHome,
  },
  {
    label: "nav.games",
    href: "/games",
    icon: FaCalendarAlt,
  },
  {
    label: "nav.articles",
    href: "/articles?tab=news",
    icon: IoNewspaper,
  },
  {
    label: "nav.discuss",
    href: "/discuss",
    icon: IoChatbubbles,
  },
  {
    label: "nav.stats",
    href: "/stats",
    icon: IoBarChart,
  },
];
