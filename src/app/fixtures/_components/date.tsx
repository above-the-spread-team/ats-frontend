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
        isToday ? "bg-blue-500" : "bg-red-500"
      } flex flex-col justify-center items-center px-2 py-1 rounded-md`}
    >
      <p>{day}</p>
      <p>{dayNumber}</p>
    </div>
  );
}
