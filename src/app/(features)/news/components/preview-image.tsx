import Image from "next/image";
import { getOptimizedLogo } from "@/lib/cloudinary";
import { getTagColor } from "@/data/league-theme";

interface PreviewImageProps {
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  variant?: "grid" | "header";
  className?: string;
  tagName?: string;
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
  const g = Math.max(
    0,
    Math.floor(((num >> 8) & 0x00ff) * (1 - percent / 100))
  );
  const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    Math.floor((num >> 16) + (255 - (num >> 16)) * (percent / 100))
  );
  const g = Math.min(
    255,
    Math.floor(
      ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * (percent / 100)
    )
  );
  const b = Math.min(
    255,
    Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * (percent / 100))
  );
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
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
  tagName,
}: PreviewImageProps) {
  if (!homeTeamLogo || !awayTeamLogo) {
    return null;
  }

  // Get league color or default to gray
  const leagueColor = tagName ? getTagColor(tagName) : "#64648F";
  const darkColor = darkenColor(leagueColor, 50);
  const darkerColor = darkenColor(leagueColor, 20);
  const lightColor = lightenColor(leagueColor, 50);
  const lighterColor = lightenColor(leagueColor, 90);

  // Grid variant: smaller logos for list/grid views
  if (variant === "grid") {
    return (
      <div
        className={`w-full overflow-hidden h-full flex items-center justify-evenly gap-10 md:gap-10 pt-4 relative ${className}`}
      >
        {/* Left side background (diagonal split matching 30deg slash) */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top right, ${darkerColor}, ${darkColor}, ${leagueColor})`,
            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)",
          }}
        ></div>
        {/* Right side background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom right, ${lightColor}, white, ${lighterColor})`,
            clipPath: "polygon(60% 0, 100% 0, 100% 100%, 40% 100%)",
          }}
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
      className={`w-full h-full flex items-center justify-center gap-16 md:gap-40 pt-2 md:pt-4 relative ${className}`}
    >
      {/* Left side background (diagonal split matching 30deg slash) */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top right, ${darkerColor}, ${darkColor}, ${leagueColor})`,
          clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)",
        }}
      ></div>
      {/* Right side background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${lightColor}, white, ${lighterColor})`,
          clipPath: "polygon(60% 0, 100% 0, 100% 100%, 40% 100%)",
        }}
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
