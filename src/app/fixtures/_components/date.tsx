"use client";

interface DateCardProps {
  date: Date;
  day: string;
  isToday: boolean;
  isSelected: boolean;
}

export default function DateCard({
  date,
  day,
  isToday,
  isSelected,
}: DateCardProps) {
  const dayNumber = date.getDate();

  return (
    <div
      className={`${
        isSelected ? "bg-primary text-white" : ""
      } flex flex-col w-12 justify-center items-center mx-1 py-1 rounded-lg transition-colors duration-150`}
    >
      <p className="text-xs font-medium">{isToday ? "Today" : day}</p>
      <p className="text-sm font-semibold">{dayNumber}</p>
    </div>
  );
}
