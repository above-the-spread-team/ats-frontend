import Image from "next/image";
import { getOptimizedLogo } from "@/lib/cloudinary";

interface PreviewImageProps {
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  variant?: "grid" | "header";
  className?: string;
}

/**
 * Team logos preview component showing two team logos with diagonal slash separator
 * Used for match preview news articles
 */
export default function PreviewImage({
  homeTeamLogo,
  awayTeamLogo,
  variant = "grid",
  className = "",
}: PreviewImageProps) {
  if (!homeTeamLogo || !awayTeamLogo) {
    return null;
  }

  // Grid variant: smaller logos for list/grid views
  if (variant === "grid") {
    return (
      <div
        className={`w-full overflow-hidden h-full flex items-center justify-evenly gap-10 md:gap-10 p-2 relative ${className}`}
      >
        {/* Left side background (diagonal split matching 30deg slash) */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-primary/50 via-primary to-primary/70 "
          style={{ clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }}
        ></div>
        {/* Right side background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-active/50 via-primary-active to-primary-active/70"
          style={{ clipPath: "polygon(60% 0, 100% 0, 100% 100%, 40% 100%)" }}
        ></div>

        <div className="relative w-12 h-12 md:w-20 md:h-20 z-10">
          <Image
            src={getOptimizedLogo(homeTeamLogo, 64)}
            alt="Home team"
            fill
            className="object-contain"
            unoptimized
          />
        </div>

        <div className="relative w-12 h-12 md:w-20 md:h-20 z-10">
          <Image
            src={getOptimizedLogo(awayTeamLogo, 64)}
            alt="Away team"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    );
  }

  // Header variant: larger logos for detail pages/headers
  return (
    <div
      className={`w-full h-full flex items-center justify-center gap-16 md:gap-40 pt-2 relative ${className}`}
    >
      {/* Left side background (diagonal split matching 45deg slash) */}
      <div
        className="absolute inset-0 bg-gradient-to-tr from-primary/50 via-primary to-primary/70"
        style={{ clipPath: "polygon(0 0, 55% 0, 45% 100%, 0 100%)" }}
      ></div>
      {/* Right side background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary-active/50 via-primary-active to-primary-active/70"
        style={{ clipPath: "polygon(55% 0, 100% 0, 100% 100%, 45% 100%)" }}
      ></div>
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="relative w-20 h-20 md:w-28 md:h-28">
          <Image
            src={getOptimizedLogo(homeTeamLogo, 128)}
            alt="Home team"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="relative w-20 h-20 md:w-28 md:h-28">
          <Image
            src={getOptimizedLogo(awayTeamLogo, 128)}
            alt="Away team"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
