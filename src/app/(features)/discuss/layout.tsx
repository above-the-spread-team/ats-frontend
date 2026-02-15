"use client";

import { useRef, useEffect, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Sidebar from "./_components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollProvider, useScroll } from "./_contexts/scroll-context";
import { useSidebar } from "./_contexts/sidebar-context";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

function DiscussLayoutContent({ children }: { children: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const { setScrollElement, scrollToTop } = useScroll();
  const { isOpen, closeSidebar } = useSidebar();
  const isMobile = useMobile();
  const pathname = usePathname();
  const router = useRouter();

  const showBackToDiscuss =
    typeof pathname === "string" && pathname.startsWith("/discuss/");

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      closeSidebar();
    }
  }, [isMobile, isOpen, closeSidebar]);

  useLayoutEffect(() => {
    // Only set up scroll element on desktop (md+)
    let attempts = 0;
    let rafId: number | null = null;

    const targetRef = isMobile ? mobileContainerRef : scrollContainerRef;

    const findViewport = () => {
      if (targetRef.current) {
        // Find the viewport element inside the ScrollArea
        const viewport = targetRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        ) as HTMLElement | null;
        if (viewport) {
          setScrollElement(viewport);
          return true;
        }
      }
      return false;
    };

    const loop = () => {
      attempts += 1;
      if (findViewport() || attempts > 30) {
        if (attempts > 30) {
          // Log once to help debugging if viewport never appears
          // (should be rare; increases robustness on slow devices)
          // eslint-disable-next-line no-console
          console.warn("Discuss layout: failed to find ScrollArea viewport");
        }
        return;
      }
      rafId = requestAnimationFrame(loop);
    };

    // Try immediately then start RAF loop
    if (!findViewport()) loop();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [setScrollElement, isMobile]);

  // Scroll to top on pathname change (navigate between pages)
  useEffect(() => {
    // small delay to allow ScrollArea viewport detection to run
    const id = setTimeout(() => {
      try {
        scrollToTop();
      } catch (_e) {
        // ignore if scroll context not ready
      }
    }, 50);
    return () => clearTimeout(id);
  }, [scrollToTop, pathname]);

  return (
    <>
      <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
        {/* Desktop Sidebar - always visible */}
        {!isMobile && (
          <div className="w-60 md:w-64 xl:w-72 h-full flex-shrink-0">
            <ScrollArea className="h-full">
              <Sidebar />
            </ScrollArea>
          </div>
        )}
        <div className="flex-1 min-h-0 flex flex-col min-w-0">
          {/* Desktop view - with ScrollArea */}
          {!isMobile && (
            <div ref={scrollContainerRef} className="h-full">
              <ScrollArea className="h-full px-2">
                <div className="pt-4 pb-10 px-2">
                  {showBackToDiscuss && (
                    <div className="mb-3">
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/discuss")}
                        className="flex items-center gap-2 mb-2"
                      >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Back to Discussion
                        </span>
                      </Button>
                    </div>
                  )}
                  {children}
                </div>
              </ScrollArea>
            </div>
          )}
          {/* Mobile view - with ScrollArea */}
          {isMobile && (
            <div ref={mobileContainerRef} className="h-full w-full">
              <ScrollArea className="h-full ">
                <div className="pt-4 pb-40 px-2">
                  {showBackToDiscuss && (
                    <div className="mb-2">
                      <Button
                        variant="ghost"
                        onClick={() => router.push("/discuss")}
                        tabIndex={-1}
                        className="flex items-center gap-2 mb-2 focus:outline-none focus:ring-0"
                      >
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Back to Discussion
                        </span>
                      </Button>
                    </div>
                  )}
                  {children}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <>
          {/* Backdrop */}
          <div
            className={cn(
              "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
            onClick={closeSidebar}
          />
          {/* Sidebar Panel - slides in from left */}
          <div
            className={cn(
              "fixed top-0 left-0 h-full  bg-card  z-50 transform transition-transform duration-300 ease-in-out",
              isOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <ScrollArea className="h-[calc(100vh-20px)]  w-60 md:w-64 xl:w-72">
              <Sidebar />
            </ScrollArea>
          </div>
        </>
      )}
    </>
  );
}

export default function DiscussLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollProvider>
      <DiscussLayoutContent>{children}</DiscussLayoutContent>
    </ScrollProvider>
  );
}
