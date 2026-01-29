"use client";

import { useRef, useEffect } from "react";
import Sidebar from "./_components/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollProvider, useScroll } from "./_contexts/scroll-context";

function DiscussLayoutContent({ children }: { children: React.ReactNode }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { setScrollElement } = useScroll();

  useEffect(() => {
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
  }, [setScrollElement]);

  return (
    <div className="flex flex-row h-[calc(100vh-80px)] overflow-hidden">
      <div className="w-60 md:w-64 xl:w-72 h-full flex-shrink-0">
        <ScrollArea className="h-[calc(100vh-77px)] md:h-[calc(100vh-70px)]">
          <Sidebar />
        </ScrollArea>
      </div>
      <div className="flex-1 h-full flex flex-col min-w-0">
        <div ref={scrollContainerRef} className="h-full">
          <ScrollArea className="h-full mx-0.5">
            <div className="pt-4 pb-8 px-2 md:px-4">{children}</div>
          </ScrollArea>
        </div>
      </div>
    </div>
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
