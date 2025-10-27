"use client";

interface DateCardProps {
  date: Date;
  day: string;
  isToday: boolean;
}

export default function DateCard({ date, day, isToday }: DateCardProps) {
  const dayNumber = date.getDate();

  return (
    <div
      className={`${
        isToday ? "bg-primary text-white" : ""
      } flex flex-col w-12 justify-center items-center mx-1 py-1 rounded-lg transition-colors duration-150`}
    >
      <p className="text-xs font-medium">{isToday ? "Today" : day}</p>
      <p className="text-sm font-semibold">{dayNumber}</p>
    </div>
  );
}
