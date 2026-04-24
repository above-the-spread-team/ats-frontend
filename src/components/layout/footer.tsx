"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/data/nav";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-primary-active text-white  hidden md:block">
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-white hover:opacity-90 transition"
          >
            <Image
              src="/images/logo.png"
              alt="Above The Spread"
              width={48}
              height={48}
              className="w-10 h-10"
            />
            <div>
              <p className="text-lg font-semibold tracking-wide">
                Above The Spread
              </p>
              <p className="text-xs text-white/70">
                Intelligence for the modern sports fan
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3 text-sm font-medium">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative rounded-full px-3 py-1 transition text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  <span
                    className={`absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-white/10 via-white/80 to-white/10 opacity-0 transition-all duration-300 ${
                      isActive ? "w-[70%] opacity-100" : ""
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-xs text-white/60 text-center md:text-left">
          <p>
            © {new Date().getFullYear()} Above The Spread. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
