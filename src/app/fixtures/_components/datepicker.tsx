"use client";

import * as React from "react";
import DateCard from "./date";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IoCalendar } from "react-icons/io5";

export default function Datepicker() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 21);

  const dates: Date[] = [];
  for (let i = 0; i <= 70; i++) {
    // 20 + 40 + 1 = 61 dates
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(date);
  }

  const todayString = today.toDateString();

  const getDayAbbreviation = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const getMonthYear = (date: Date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const [currentMonthYear, setCurrentMonthYear] = React.useState(() =>
    getMonthYear(today)
  );

  // State for selected date - default to today
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);

  // Add debouncing to prevent rapid updates
  const [lastUpdateTime, setLastUpdateTime] = React.useState(0);
  const updateTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Function to find the most visible date based on scroll position
  const updateCurrentMonthYear = React.useCallback(() => {
    const carousel =
      document.querySelector('[data-orientation="horizontal"]') ||
      document.querySelector(".carousel") ||
      document.querySelector('[role="region"]');

    if (!carousel) {
      return;
    }

    const carouselRect = carousel.getBoundingClientRect();
    const centerX = carouselRect.left + carouselRect.width / 2;

    // Find the date card closest to the center
    const dateCards = document.querySelectorAll("[data-date-card]");

    if (dateCards.length === 0) {
      return;
    }

    let closestCard = null;
    let minDistance = Infinity;

    dateCards.forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenterX - centerX);

      // Only consider cards that are significantly visible (at least 50% visible)
      const visibilityRatio =
        Math.min(
          cardRect.width,
          carouselRect.width - Math.max(0, cardRect.left - carouselRect.left)
        ) / cardRect.width;

      if (distance < minDistance && visibilityRatio > 0.5) {
        minDistance = distance;
        closestCard = card;
      }
    });

    if (closestCard) {
      const dateIndex = parseInt(
        (closestCard as HTMLElement).getAttribute("data-date-index") || "0"
      );
      const date = dates[dateIndex];
      if (date) {
        const newMonthYear = getMonthYear(date);

        // Debounce updates to prevent flickering
        const now = Date.now();
        if (now - lastUpdateTime > 150) {
          // Only update if 150ms have passed
          setCurrentMonthYear(newMonthYear);
          setLastUpdateTime(now);
        } else {
          // Clear existing timeout and set a new one
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            setCurrentMonthYear(newMonthYear);
            setLastUpdateTime(Date.now());
          }, 150);
        }
      }
    }
  }, [dates, lastUpdateTime]);

  // Set up automatic updates using multiple approaches
  React.useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let intersectionObserver: IntersectionObserver;

    const setupObservers = () => {
      // Method 1: Periodic updates (fallback) - reduced frequency
      intervalId = setInterval(updateCurrentMonthYear, 300);

      // Method 2: Intersection Observer for date cards (more precise)
      intersectionObserver = new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          // Find the most visible entry with higher threshold
          let maxVisibility = 0.6; // Require at least 60% visibility
          let bestEntry: IntersectionObserverEntry | undefined;

          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              entry.intersectionRatio > maxVisibility
            ) {
              maxVisibility = entry.intersectionRatio;
              bestEntry = entry;
            }
          });

          if (bestEntry) {
            const target = bestEntry.target as HTMLElement;
            const dateIndex = parseInt(
              target.getAttribute("data-date-index") || "0"
            );
            const date = dates[dateIndex];
            if (date) {
              const newMonthYear = getMonthYear(date);

              // Debounce intersection observer updates too
              const now = Date.now();
              if (now - lastUpdateTime > 200) {
                // Longer debounce for intersection observer
                setCurrentMonthYear(newMonthYear);
                setLastUpdateTime(now);
              }
            }
          }
        },
        {
          root: null, // Use viewport as root
          threshold: [0.6, 0.7, 0.8, 0.9, 1.0], // Higher thresholds for more stability
        }
      );

      // Observe all date cards
      const dateCards = document.querySelectorAll("[data-date-card]");
      dateCards.forEach((card) => {
        intersectionObserver.observe(card);
      });
    };

    // Method 3: Mutation Observer to detect when carousel content changes
    const mutationObserver = new MutationObserver(() => {
      // Re-observe date cards if they change
      if (intersectionObserver) {
        intersectionObserver.disconnect();
        const dateCards = document.querySelectorAll("[data-date-card]");
        dateCards.forEach((card) => {
          intersectionObserver.observe(card);
        });
      }
    });

    // Start observing
    const carouselContainer =
      document.querySelector('[data-orientation="horizontal"]') ||
      document.querySelector(".carousel") ||
      document.querySelector('[role="region"]');

    if (carouselContainer) {
      mutationObserver.observe(carouselContainer, {
        childList: true,
        subtree: true,
      });
    }

    // Delay setup to ensure DOM is ready
    const timeoutId = setTimeout(setupObservers, 100);

    // Initial call
    updateCurrentMonthYear();

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      intersectionObserver?.disconnect();
      mutationObserver.disconnect();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateCurrentMonthYear, dates]);

  return (
    <div className="flex justify-center items-center flex-col gap-4 w-full">
      <div className="w-full max-w-4xl px-4 flex justify-between items-end">
        <p>Today</p>
        <p className="text-2xl font-bold">{currentMonthYear}</p>
        <IoCalendar className="w-5 h-5 text-primary" />
      </div>
      <Carousel
        className="w-full max-w-4xl"
        opts={{
          dragFree: true,
          containScroll: "trimSnaps",
          slidesToScroll: 6,
          startIndex: 3,
        }}
      >
        {/* margin right to make the selecteddate center */}
        <CarouselContent className="mr-10">
          {dates.map((date, index) => (
            <CarouselItem key={index} className="pl-1 basis-auto">
              <div
                data-date-card
                data-date-index={index}
                onClick={() => setSelectedDate(date)}
                className="cursor-pointer"
              >
                <DateCard
                  date={date}
                  day={getDayAbbreviation(date)}
                  isToday={date.toDateString() === todayString}
                  isSelected={
                    date.toDateString() === selectedDate.toDateString()
                  }
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
