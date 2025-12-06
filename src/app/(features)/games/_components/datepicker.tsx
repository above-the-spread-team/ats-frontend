"use client";

import * as React from "react";
import DateCard from "./date";
import Calendar from "./calendar";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { IoCalendar } from "react-icons/io5";
import { Button } from "@/components/ui/button";

interface DatepickerProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

export default function Datepicker({
  selectedDate,
  setSelectedDate,
}: DatepickerProps) {
  const today = useMemo(() => new Date(), []);

  // State for showing calendar
  const [showCalendar, setShowCalendar] = useState(false);

  // Generate date range based on selected date
  const generateDateRange = useCallback((centerDate: Date) => {
    const startDate = new Date(centerDate);
    startDate.setDate(centerDate.getDate() - 21);

    const dates: Date[] = [];
    for (let i = 0; i <= 70; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const [dates, setDates] = useState(() => generateDateRange(selectedDate));

  // Carousel ref to control scroll position
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [carouselApi, setCarouselApi] = useState<any>(null);

  // Track previous selectedDate to detect external changes (e.g., from URL)
  const prevSelectedDateRef = useRef<Date>(selectedDate);
  const isInternalChangeRef = useRef(false);

  // Function to scroll to index 3 (center position)
  const scrollToCenter = useCallback(() => {
    if (!carouselApi) return;

    // Always scroll to index 3
    carouselApi.scrollTo(3);
  }, [carouselApi]);

  // Effect to scroll to center when carousel API is ready on initial mount
  useEffect(() => {
    if (carouselApi) {
      // Scroll to center after a short delay to ensure DOM is ready
      setTimeout(() => {
        scrollToCenter();
      }, 100);
    }
  }, [carouselApi, scrollToCenter]);

  // Effect to handle date changes from external sources (e.g., URL parameter)
  useEffect(() => {
    // Check if selectedDate changed from an external source
    const prevDateString = prevSelectedDateRef.current.toDateString();
    const currentDateString = selectedDate.toDateString();

    if (prevDateString !== currentDateString && !isInternalChangeRef.current) {
      // Always generate new date range centered on the selected date when coming from URL
      const newDates = generateDateRange(selectedDate);
      setDates(newDates);

      // Scroll to center after a short delay to ensure DOM is updated
      setTimeout(() => {
        scrollToCenter();
      }, 150);

      // Update the ref
      prevSelectedDateRef.current = selectedDate;
    }

    // Reset the internal change flag
    isInternalChangeRef.current = false;
  }, [selectedDate, generateDateRange, scrollToCenter]);

  // Function to select today and scroll to center
  const selectToday = useCallback(() => {
    setSelectedDate(today);
    const newDates = generateDateRange(today);
    setDates(newDates);

    // Scroll to center after a short delay to ensure DOM is updated
    setTimeout(() => {
      scrollToCenter();
    }, 100);
  }, [today, generateDateRange, scrollToCenter, setSelectedDate]);

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

  const [currentMonthYear, setCurrentMonthYear] = useState(
    getMonthYear(selectedDate)
  );

  // Add debouncing to prevent rapid updates
  const lastUpdateTimeRef = useRef(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to find the most visible date based on scroll position
  const updateCurrentMonthYear = useCallback(() => {
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
        if (now - lastUpdateTimeRef.current > 150) {
          // Only update if 150ms have passed
          setCurrentMonthYear(newMonthYear);
          lastUpdateTimeRef.current = now;
        } else {
          // Clear existing timeout and set a new one
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          updateTimeoutRef.current = setTimeout(() => {
            setCurrentMonthYear(newMonthYear);
            lastUpdateTimeRef.current = Date.now();
          }, 150);
        }
      }
    }
  }, [dates]);

  // Set up automatic updates using multiple approaches
  useEffect(() => {
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
              if (now - lastUpdateTimeRef.current > 200) {
                // Longer debounce for intersection observer
                setCurrentMonthYear(newMonthYear);
                lastUpdateTimeRef.current = now;
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
    <div className="flex justify-center items-center flex-col gap-1 md:gap-2  py-1 md:py-2 w-full">
      <div className="w-full max-w-4xl px-4 flex justify-between items-center">
        {selectedDate.toDateString() !== todayString ? (
          <Button
            onClick={selectToday}
            className="   h-6 w-12 md:text-base font-bold rounded-xl"
          >
            <p className="text-xs scale-95">Today</p>
          </Button>
        ) : (
          <div className="w-12"></div>
        )}
        <p className="text-md md:text-lg text-primary-title font-bold ">
          {currentMonthYear}
        </p>
        <button
          onClick={() => setShowCalendar(true)}
          className="p-1.5 hover:bg-icon-hover rounded-xl transition-colors"
        >
          <IoCalendar className="w-5 h-5 text-primary" />
        </button>
      </div>
      <div className="relative w-full max-w-4xl">
        {/* Left gradient overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />

        {/* Right gradient overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <Carousel
          setApi={setCarouselApi}
          className="w-full"
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
                  onClick={() => {
                    isInternalChangeRef.current = true;
                    setSelectedDate(date);
                  }}
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
          <CarouselPrevious className="hidden lg:flex " />
          <CarouselNext className="hidden lg:flex " />
        </Carousel>
      </div>
      {/* Calendar Modal */}
      {showCalendar && (
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={(newDate) => {
            isInternalChangeRef.current = true;
            setSelectedDate(newDate);
            const newDates = generateDateRange(newDate);
            setDates(newDates);

            // Scroll to center the selected date after a short delay to ensure DOM is updated
            setTimeout(() => {
              scrollToCenter();
            }, 100);
          }}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </div>
  );
}
