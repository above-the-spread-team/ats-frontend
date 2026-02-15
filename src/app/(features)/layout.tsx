"use client";

import { usePathname } from "next/navigation";
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
  const isDiscussPage = pathname?.startsWith("/discuss");
  const isMobile = useMobile();

  // Show discuss mobile header on mobile when in discuss section
  const showDiscussMobileHeader = isDiscussPage && isMobile;

  const content = (
    <div className="overflow-x-hidden antialiased pb-10 md:pb-0">
      <BodyOverflowHandler />
      {/* Smooth crossfade between desktop and discuss-mobile header when on /discuss */}
      {!isDiscussPage ? (
        <Header />
      ) : (
        <div className="relative min-h-12 md:min-h-14">
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
        </div>
      )}
      <Nav />
      {children}
      <ConditionalFooter />
      <MobileNav />
    </div>
  );

  // Wrap with SidebarProvider if it's a discuss page
  if (isDiscussPage) {
    return <SidebarProvider>{content}</SidebarProvider>;
  }

  return content;
}
