"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import Header from "@/components/layout/header";
import Nav from "@/components/layout/nav";
import ConditionalFooter from "@/components/layout/conditional-footer";
import BodyOverflowHandler from "@/components/layout/body-overflow-handler";
import MobileNav from "@/components/layout/mobile-nax";
import DiscussMobileHeader from "@/components/layout/discuss-mobile-header";
import { SidebarProvider } from "@/app/(features)/discuss/_contexts/sidebar-context";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useMobile();

  // Stabilize isDiscussPage so we don't flip to the wrong header when pathname
  // is briefly undefined during client-side navigation or hydration
  const isDiscussPageRef = useRef(pathname != null && pathname.startsWith("/discuss"));
  if (pathname != null) {
    isDiscussPageRef.current = pathname.startsWith("/discuss");
  }
  const isDiscussPage = isDiscussPageRef.current;

  // Show discuss mobile header on mobile when in discuss section
  const showDiscussMobileHeader = isDiscussPage && isMobile;

  // On discuss: use fixed viewport so header can never be cut or disappear during navigation
  const wrapperClass = isDiscussPage
    ? "overflow-x-hidden antialiased flex flex-col h-dvh max-h-dvh md:h-screen md:max-h-screen"
    : "overflow-x-hidden antialiased pb-10 md:pb-0";

  const content = (
    <div className={wrapperClass}>
      <BodyOverflowHandler />
      {/* Header row: never shrink so it can't be cut */}
      {!isDiscussPage ? (
        <header className="flex-shrink-0">
          <Header />
        </header>
      ) : (
        <header className="flex-shrink-0 relative min-h-12 md:min-h-14">
          <div
            className={cn(
              "transition-opacity duration-200 ease-in-out",
              showDiscussMobileHeader
                ? "opacity-0 pointer-events-none absolute inset-x-0 top-0"
                : "opacity-100",
            )}
          >
            <Header />
          </div>
          <div
            className={cn(
              "transition-opacity duration-200 ease-in-out",
              !showDiscussMobileHeader
                ? "opacity-0 pointer-events-none absolute inset-x-0 top-0"
                : "opacity-100",
            )}
          >
            <DiscussMobileHeader />
          </div>
        </header>
      )}
      <Nav />
      <main className={cn(isDiscussPage && "flex-1 min-h-0 flex flex-col overflow-hidden")}>
        {children}
      </main>
      {!isDiscussPage && <ConditionalFooter />}
      <MobileNav />
    </div>
  );

  // Wrap with SidebarProvider if it's a discuss page
  if (isDiscussPage) {
    return <SidebarProvider>{content}</SidebarProvider>;
  }

  return content;
}
