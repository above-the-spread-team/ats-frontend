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

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDiscussPage = pathname?.startsWith("/discuss");
  const isMobile = useMobile();

  // Hide Header and Nav on mobile when in discuss section
  const shouldHideHeaderNav = isDiscussPage && isMobile;

  const content = (
    <div className="overflow-x-hidden antialiased pb-10 md:pb-0">
      <BodyOverflowHandler />
      {!shouldHideHeaderNav ? <Header /> : <DiscussMobileHeader />}
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
