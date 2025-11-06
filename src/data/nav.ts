import { FaCalendarAlt, FaHome } from "react-icons/fa";
import { IoBarChart, IoNewspaper, IoChatbubbles } from "react-icons/io5";
import { IconType } from "react-icons";
import { FaPeopleGroup } from "react-icons/fa6";
import { PiRankingFill } from "react-icons/pi";
import { CgMoreO } from "react-icons/cg";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export const phoneNavItems: NavItem[] = [
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
    label: "Discover",
    href: "/discover",
    icon: CgMoreO,
  },
];

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
    label: "Tables",
    href: "/tables",
    icon: IoBarChart,
  },
  {
    label: "Stats",
    href: "/stats",
    icon: PiRankingFill,
  },
  {
    label: "Teams",
    href: "/teams",
    icon: FaPeopleGroup,
  },
];
