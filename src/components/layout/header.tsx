import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  return (
    <div className="flex justify-between  items-center px-4 md:px-6 h-12 bg-primary">
      <Link href="/" className="cursor-pointer hidden md:block">
        <Image
          src="/images/ats-full.svg"
          alt="Above The Spread"
          width={400}
          height={400}
          className="w-48 mt-1 "
        />
      </Link>
      <Link href="/" className="cursor-pointer md:hidden ">
        <Image
          src="/images/ats.svg"
          alt="Above The Spread"
          width={200}
          height={200}
          className="w-14 mt-1 "
        />
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-white/20 transition-all">
          <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
          <AvatarFallback className="bg-primary-active text-white text-sm font-semibold">
            ATS
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
