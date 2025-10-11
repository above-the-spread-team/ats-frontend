import { FaCalendarAlt } from "react-icons/fa";
import { IoBarChart, IoNewspaper } from "react-icons/io5";
import { IconType } from "react-icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconType;
}

export const navItems: NavItem[] = [
  {
    label: "Fixtures",
    href: "/fixtures",
    icon: FaCalendarAlt,
  },
  {
    label: "Tables",
    href: "/tables",
    icon: IoBarChart,
  },
  {
    label: "News",
    href: "/news",
    icon: IoNewspaper,
  },
];
