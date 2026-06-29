import Image from "next/image";
import { User, Quote } from "lucide-react";
import { getOptimizedLogo } from "@/lib/cloudinary";
import { getTagColor } from "@/data/league-theme";
import { cn } from "@/lib/utils";

interface ExpertPerspectiveImageProps {
  homeTeamLogo: string | null;
  awayTeamLogo: string | null;
  expertName: string | null;
  expertAvatarUrl: string | null;
  variant?: "grid" | "header";
  tagName?: string;
  className?: string;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - percent / 100)));
  const g = Math.max(
    0,
    Math.floor(((num >> 8) & 0x00ff) * (1 - percent / 100)),
  );
  const b = Math.max(0, Math.floor((num & 0x0000ff) * (1 - percent / 100)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(
    255,
    Math.floor((num >> 16) + (255 - (num >> 16)) * (percent / 100)),
  );
  const g = Math.min(
    255,
    Math.floor(
      ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * (percent / 100),
    ),
  );
  const b = Math.min(
    255,
    Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * (percent / 100)),
  );
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function ExpertAvatar({
  avatarUrl,
  name,
  size = "sm",
  className,
}: {
  avatarUrl: string | null;
  name: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-[72px] h-[72px]",
  };
  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-8 w-8",
    xl: "h-9 w-9",
  };
  const imageSizes = { sm: 28, md: 40, lg: 64, xl: 72 };
  const avatarClassName = cn(
    sizeClasses[size],
    "rounded-full object-cover ring-2 ring-amber-400/80 dark:ring-amber-500/70 shadow-md",
    className,
  );

  return avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={name || "Expert"}
      width={imageSizes[size]}
      height={imageSizes[size]}
      className={avatarClassName}
      unoptimized
    />
  ) : (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-amber-300/60 dark:ring-amber-600/50 shadow-md",
        className,
      )}
    >
      <User className={`${iconSizes[size]} text-white`} />
    </div>
  );
}

function TeamLogoBadge({
  logo,
  alt,
  variant = "grid",
}: {
  logo: string;
  alt: string;
  variant?: "grid" | "header";
}) {
  const containerClasses =
    variant === "header"
      ? "h-12 w-12 md:h-16 md:w-16"
      : "h-12 w-12 md:h-16 md:w-16";
  const logoSize = variant === "header" ? 64 : 48;

  return (
    <div className={`relative z-10 ${containerClasses}`}>
      <Image
        src={getOptimizedLogo(logo, logoSize)}
        alt={alt}
        fill
        className="object-contain"
        unoptimized
      />
    </div>
  );
}

/**
 * Preview card image for expert perspective articles.
 * Shows team logos with diagonal split when available, otherwise a portrait-style expert header.
 */
export default function ExpertPerspectiveImage({
  homeTeamLogo,
  awayTeamLogo,
  expertName,
  expertAvatarUrl,
  variant = "grid",
  tagName,
  className = "",
}: ExpertPerspectiveImageProps) {
  const hasTeams = Boolean(homeTeamLogo && awayTeamLogo);
  const leagueColor = tagName ? getTagColor(tagName) : "#d97706";
  const darkColor = darkenColor(leagueColor, 20);
  const darkerColor = darkenColor(leagueColor, 90);
  const lightColor = lightenColor(leagueColor, 40);
  const lighterColor = lightenColor(leagueColor, 90);

  if (hasTeams) {
    const isHeader = variant === "header";

    return (
      <div
        className={cn(
          "relative h-full w-full overflow-hidden",
          isHeader && "flex flex-col",
          className,
        )}
      >
        {/* Diagonal league-color split — same language as PreviewImage */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top right, ${darkerColor}, ${darkColor}, ${leagueColor})`,
            clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom right, ${lightColor}, white, ${lighterColor})`,
            clipPath: "polygon(60% 0, 100% 0, 100% 100%, 40% 100%)",
          }}
        />

        {/* Warm amber wash for expert branding */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-amber-500/10 dark:from-amber-950/50 dark:to-amber-600/5" />

        {/* Team logos + VS — centered in header, top-aligned in grid */}
        <div
          className={cn(
            "relative z-10 flex  items-center justify-center gap-3 md:gap-5",
            isHeader
              ? "min-h-0 flex-1 mt-10 md:mt-20"
              : "absolute mt-12 inset-x-0 top-0 ",
          )}
        >
          <TeamLogoBadge
            logo={homeTeamLogo!}
            alt="Home team"
            variant={variant}
          />
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-amber-500/90 font-black tracking-wider text-white shadow-md ring-2 ring-white/40 dark:ring-white/20",
              isHeader
                ? "h-7 w-7 text-[10px] md:h-8 md:w-8"
                : "h-7 w-7 text-[10px]",
            )}
          >
            VS
          </div>
          <TeamLogoBadge
            logo={awayTeamLogo!}
            alt="Away team"
            variant={variant}
          />
        </div>

        {/* Expert info strip */}
        <div
          className={cn(
            "relative z-10 bg-gradient-to-t from-black/70 via-black/40 to-transparent",
            isHeader
              ? "shrink-0 px-4 pb-2.5 pt-3 md:px-5 md:pb-3 md:pt-4"
              : "absolute inset-x-0 bottom-0 px-3 pb-2.5 pt-8",
          )}
        >
          <div className="flex items-center gap-2 md:gap-3">
            <ExpertAvatar
              avatarUrl={expertAvatarUrl}
              name={expertName}
              size={isHeader ? "lg" : "sm"}
              className={
                isHeader
                  ? "h-8 w-8 md:h-16 md:w-16 [&_svg]:h-4 [&_svg]:w-4 md:[&_svg]:h-8 md:[&_svg]:w-8"
                  : undefined
              }
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "font-semibold uppercase tracking-widest text-amber-300/90",
                  isHeader ? "text-[10px] md:text-xs" : "text-[10px]",
                )}
              >
                Expert Perspective
              </p>
              <p
                className={cn(
                  "truncate font-bold text-white",
                  isHeader ? "text-sm md:text-lg" : "text-xs md:text-sm",
                )}
              >
                {expertName || "Expert"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No team logos — portrait-style expert header
  const avatarSize = variant === "header" ? "xl" : "md";

  if (variant === "header") {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 dark:from-amber-950 dark:via-orange-950/80 dark:to-amber-900" />
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-600/20" />
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-orange-300/25 blur-3xl dark:bg-orange-700/15" />
        <Quote
          className="absolute right-6 top-1/2 h-28 w-28 -translate-y-1/2 text-amber-400/15 dark:text-amber-500/10"
          strokeWidth={1}
        />

        <div className="relative flex h-full items-center gap-3 px-4 md:gap-6 md:px-8">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-60 blur-sm md:-inset-1.5" />
            <div className="relative rounded-full ring-2 ring-white/80 dark:ring-amber-900/60 md:ring-4">
              <ExpertAvatar
                avatarUrl={expertAvatarUrl}
                name={expertName}
                size="xl"
                className="h-11 w-11 md:h-[72px] md:w-[72px] [&_svg]:h-5 [&_svg]:w-5 md:[&_svg]:h-9 md:[&_svg]:w-9"
              />
            </div>
          </div>
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 md:mb-1 md:text-xs">
              Expert Perspective
            </p>
            <p className="truncate text-base font-bold text-amber-900 dark:text-amber-100 md:text-2xl">
              {expertName || "Expert"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {/* Layered amber gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200 dark:from-amber-950 dark:via-orange-950/80 dark:to-amber-900" />
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-300/30 blur-2xl dark:bg-amber-600/20" />
      <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-orange-300/25 blur-2xl dark:bg-orange-700/15" />

      {/* Decorative quote watermark */}
      <Quote
        className="absolute right-4 top-1/2 h-20 w-20 -translate-y-1/2 text-amber-400/15 dark:text-amber-500/10"
        strokeWidth={1}
      />

      {/* Expert portrait */}
      <div className="relative flex h-full flex-col items-center justify-center gap-2 px-4">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-60 blur-sm" />
          <div className="relative rounded-full ring-4 ring-white/80 dark:ring-amber-900/60">
            <ExpertAvatar
              avatarUrl={expertAvatarUrl}
              name={expertName}
              size={avatarSize}
            />
          </div>
        </div>
        <p className="mt-1 max-w-[80%] truncate text-center text-sm font-bold text-amber-900 dark:text-amber-100 md:text-base">
          {expertName || "Expert"}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600/70 dark:text-amber-400/60">
          Perspective
        </p>
      </div>
    </div>
  );
}
