"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/data/nav";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-primary border-t border-primary-active z-50">
      <div className="grid grid-cols-4 h-12">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center pt-1 justify-center gap-1 transition-all duration-300 ${
                isActive
                  ? "text-white bg-primary-active"
                  : "text-mygray hover:text-white/80"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""}`} />
              <span className="text-xs scale-90 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
