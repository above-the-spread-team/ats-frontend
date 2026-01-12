import Image from "next/image";
import { getOptimizedLogo } from "@/lib/cloudinary";

interface PreviewImageProps {
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  variant?: "grid" | "header";
  className?: string;
}

/**
 * Team logos preview component showing two team logos with VS separator
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
        className={`w-full h-full flex items-center justify-center gap-2 md:gap-4 p-2 ${className}`}
      >
        <div className="relative w-12 h-12 md:w-16 md:h-16">
          <Image
            src={getOptimizedLogo(homeTeamLogo, 64)}
            alt="Home team"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
        <span className="text-sm md:text-lg font-bold text-muted-foreground">
          VS
        </span>
        <div className="relative w-12 h-12 md:w-16 md:h-16">
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
      className={`w-full h-full flex items-center justify-center gap-8 md:gap-16 p-6 ${className}`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 md:w-32 md:h-32">
          <Image
            src={getOptimizedLogo(homeTeamLogo, 128)}
            alt="Home team"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>
      <div className="text-2xl md:text-4xl font-bold text-muted-foreground">
        VS
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 md:w-32 md:h-32">
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
