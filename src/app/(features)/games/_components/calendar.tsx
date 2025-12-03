"use client";

import * as React from "react";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  onClose,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate.getMonth()
  );
  const [currentYear, setCurrentYear] = React.useState(
    selectedDate.getFullYear()
  );

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

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get the first day of the month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateSelect(newDate);
    onClose();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-3xl shadow-2xl p-3 pb-4 w-[360px] max-w-sm animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div className="w-10"></div>
          <div className="flex justify-between gap-2 items-center ">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2  rounded-full transition-colors text-foreground hover:bg-icon-hover"
            >
              <ChevronLeft className="w-5 h-5 text-primary" />
            </button>

            <h2 className="text-md font-bold  w-40 text-center text-primary">
              {months[currentMonth]} {currentYear}
            </h2>

            <button
              onClick={() => navigateMonth("next")}
              className="p-2  rounded-full transition-colors text-foreground hover:bg-icon-hover"
            >
              <ChevronRight className="w-5 h-5 text-primary" />
            </button>
          </div>
          {/* exit button */}
          <button
            onClick={onClose}
            className="p-2  rounded-full transition-colors text-foreground hover:bg-icon-hover"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 grid-rows-6 gap-3 h-60">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`aspect-square flex items-center justify-center text-sm cursor-pointer rounded-xl transition-all duration-200 ${
                day === null
                  ? ""
                  : isSelected(day)
                  ? "bg-primary text-white font-semibold shadow-md scale-105"
                  : isToday(day)
                  ? "bg-accent text-accent-foreground border-2 border-primary font-semibold"
                  : "hover:bg-icon-hover"
              }`}
              onClick={() => day && handleDateClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
