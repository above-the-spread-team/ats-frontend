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

export default function Datepicker() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);

  const dates: Date[] = [];
  for (let i = 0; i <= 70; i++) {
    // 30 + 40 + 1 = 71 dates
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

  return (
    <div className="flex justify-center items-center flex-col gap-4 w-full">
      <p className="text-2xl font-bold">{getMonthYear(today)}</p>
      <Carousel className="w-full max-w-4xl">
        <CarouselContent className="-ml-1">
          {dates.map((date, index) => (
            <CarouselItem key={index} className="pl-1 basis-auto">
              <DateCard
                date={date}
                day={getDayAbbreviation(date)}
                isToday={date.toDateString() === todayString}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
