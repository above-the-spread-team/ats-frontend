import Image from "next/image";

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="/images/homepage.jpg"
        alt="Homepage Background"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex justify-center text-xl md:text-3xl font-bold items-center h-full text-white">
        Home Page
      </div>
    </div>
  );
}
