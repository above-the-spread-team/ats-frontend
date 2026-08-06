"use client";

import { createContext, useContext, useRef, ReactNode } from "react";

interface ScrollContextType {
  scrollToTop: () => void;
  setScrollElement: (element: HTMLElement | null) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const scrollElementRef = useRef<HTMLElement | null>(null);

  const setScrollElement = (element: HTMLElement | null) => {
    scrollElementRef.current = element;
  };

  const scrollToTop = () => {
    if (scrollElementRef.current) {
      const element = scrollElementRef.current;
      const startPosition = element.scrollTop;
      const startTime = performance.now();
      const duration = 800; // Duration in milliseconds (800ms = slower than default)

      // Easing function for smooth animation (ease-in-out)
      const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animateScroll = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        element.scrollTop = startPosition * (1 - easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    }
  };

  return (
    <ScrollContext.Provider value={{ scrollToTop, setScrollElement }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
}
