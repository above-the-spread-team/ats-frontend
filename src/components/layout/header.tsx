import { ThemeToggle } from "@/components/common/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  return (
    <div className="flex justify-between  items-center px-4 md:px-6 h-12 md:h-14  bg-primary">
      <Link
        href="/"
        className="cursor-pointer gap-2 flex flex-row justify-center items-center "
      >
        <Image
          src="/images/logo.png"
          alt="Above The Spread"
          width={600}
          height={600}
          className="w-8"
        />
        <Image
          src="/images/ats-full.png"
          alt="Above The Spread"
          width={600}
          height={600}
          className="w-48 max-h-8 mt-2 hidden md:block "
        />
        <Image
          src="/images/ats.png"
          alt="Above The Spread"
          width={600}
          height={600}
          className="w-14 max-h-8  mt-1 block md:hidden "
        />
      </Link>
      <Link href="/" className="cursor-pointer md:hidden "></Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-white/20 transition-all">
          <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
          <AvatarFallback className="bg-primary-active text-white text-sm font-semibold">
            ATS
          </AvatarFallback>
        </Avatar> */}
        <Link
          href="/login"
          className="text-mygray font-bold text-sm hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
