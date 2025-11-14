"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/nav";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex justify-center items-center px-6 h-8 bg-primary-active">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2  h-8 px-6 transition-all duration-300 cursor-pointer ${
              isActive
                ? "bg-primary text-white/80"
                : "text-mygray hover:bg-neutral-800/30 hover:text-white/80"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "scale-110" : ""}`} />
            <p className={`text-sm font-bold`}>{item.label}</p>
          </Link>
        );
      })}
    </nav>
  );
}
