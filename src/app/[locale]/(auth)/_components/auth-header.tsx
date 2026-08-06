import Link from "next/link";
import Image from "next/image";
export default function AuthHeader() {
  return (
    <div className=" absolute  z-10 top-0 left-0 flex items-center justify-start py-2 px-4 h-auto ">
      <Link
        href="/"
        className="cursor-pointer  flex  items-center gap-2 text-primary-font "
      >
        {/* <ChevronLeft className="w-6 h-6" /> */}
        <Image
          src="/images/logo.png"
          alt="logo"
          width={50}
          height={50}
          className="w-8 h-8"
        />
        <Image
          src="/images/ats-full.png"
          alt="logo"
          width={200}
          height={200}
          className="mt-2 w-48 max-h-6"
        />
      </Link>
    </div>
  );
}
