"use client";

import { useState, useEffect } from "react";

/**
 * Shared hook for detecting mobile screen size (below 768px / md breakpoint)
 * Uses a single resize listener with debouncing for better performance
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on mount (use true as initial state to prevent hydration mismatch)
    checkMobile();

    // Debounce resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return isMobile;
}
