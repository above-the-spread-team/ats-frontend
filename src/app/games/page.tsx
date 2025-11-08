"use client";
import LoadingFull from "@/components/common/loading-full";
import Datepicker from "./_components/datepicker";
import React from "react";
export default function Fixtures() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date>(today);
  return (
    <div className="container mx-auto ">
      <Datepicker
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <div className="">{selectedDate.toISOString().split("T")[0]}</div>
    </div>
  );
}
