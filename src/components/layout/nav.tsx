"use client";

import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { navItems } from "@/data/nav";

export default function Nav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav className="hidden md:flex justify-center items-center px-6 h-8 bg-primary-active">
      {navItems.map((item) => {
        const Icon = item.icon;
        const itemPathname = item.href.split("?")[0];
        const isActive =
          itemPathname === "/"
            ? pathname === "/"
            : pathname === itemPathname ||
              pathname.startsWith(`${itemPathname}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2  h-8 px-6 transition-all duration-300 cursor-pointer ${
              isActive
                ? "bg-primary text-white"
                : "text-mygray hover:bg-neutral-800/30 hover:text-white/80"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "scale-110" : ""}`} />
            <p className={`text-sm font-bold`}>{t(item.label)}</p>
          </Link>
        );
      })}
    </nav>
  );
}
