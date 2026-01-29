"use client";

import { useRef, useEffect, useState } from "react";
import Sidebar from "./_components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollProvider, useScroll } from "./_contexts/scroll-context";
import { useSidebar } from "./_contexts/sidebar-context";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function DiscussLayoutContent({ children }: { children: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { setScrollElement } = useScroll();
  const { isOpen, closeSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(true);

  // Detect screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      closeSidebar();
    }
  }, [isMobile, isOpen, closeSidebar]);

  useEffect(() => {
    // Only set up scroll element on desktop (md+)
    if (isMobile) return;

    // Find the ScrollArea viewport element after mount
    const findViewport = () => {
      if (scrollContainerRef.current) {
        // Find the viewport element inside the ScrollArea
        const viewport = scrollContainerRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        ) as HTMLElement;
        if (viewport) {
          setScrollElement(viewport);
          return true;
        }
      }
      return false;
    };

    // Try immediately, then retry after a short delay if needed
    if (!findViewport()) {
      const timeoutId = setTimeout(() => {
        findViewport();
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [setScrollElement, isMobile]);

  return (
    <>
      <div className="flex flex-row h-[calc(100vh-80px)] overflow-hidden">
        {/* Desktop Sidebar - always visible */}
        {!isMobile && (
          <div className="w-60 md:w-64 xl:w-72 h-full flex-shrink-0">
            <ScrollArea className="h-[calc(100vh-65px)]">
              <Sidebar />
            </ScrollArea>
          </div>
        )}
        <div className="flex-1 h-full flex flex-col min-w-0">
          {/* Desktop view - with ScrollArea */}
          {!isMobile && (
            <div ref={scrollContainerRef} className="h-full">
              <ScrollArea className="h-full px-2">
                <div className="pt-4 pb-8 px-2">{children}</div>
              </ScrollArea>
            </div>
          )}
          {/* Mobile view - no ScrollArea */}
          {isMobile && (
            <div className="h-full overflow-y-auto">
              <div className="pt-4 pb-8 px-2">{children}</div>
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
              "fixed top-0 left-0 h-full  bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto",
              isOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <Sidebar />
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
