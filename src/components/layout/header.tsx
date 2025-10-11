import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function Header() {
  return (
    <div className="flex justify-between  items-center px-6 h-12 bg-primary">
      <Image
        src="/images/ats-full.svg"
        alt="Above The Spread"
        width={100}
        height={100}
        className="w-48 mt-1 hidden md:block"
      />
      <Image
        src="/images/ats.svg"
        alt="Above The Spread"
        width={100}
        height={100}
        className="w-14 mt-1 md:hidden"
      />

      <ThemeToggle />
    </div>
  );
}
