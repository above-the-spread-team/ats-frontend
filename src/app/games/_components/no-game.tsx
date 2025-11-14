import { IoFootball } from "react-icons/io5";
export default function NoGame({ date }: { date: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="text-4xl md:text-5xl text-primary">
        <IoFootball />
      </div>
      <h2 className="text-base md:text-lg font-semibold text-foreground">
        No fixtures scheduled
      </h2>
      <p className="max-w-md text-xs md:text-sm text-center text-muted-foreground">
        We have no events to show on this date{" "}
        <span className="font-semibold">{date}</span>.
      </p>
    </div>
  );
}
