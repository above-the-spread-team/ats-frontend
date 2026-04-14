import Image from "next/image";

type FixtureDualTeamIconSize = "sm" | "md" | "responsive";

export function FixtureDualTeamIcon({
  homeTeamLogo,
  awayTeamLogo,
  homeTeamName,
  awayTeamName,
  fallbackName,
  size = "md",
}: {
  homeTeamLogo: string | null | undefined;
  awayTeamLogo: string | null | undefined;
  homeTeamName?: string;
  awayTeamName?: string;
  fallbackName?: string | null;
  size?: FixtureDualTeamIconSize;
}) {
  const namesFromFallback = (() => {
    if (!fallbackName) return null;
    const normalized = fallbackName.replace(/\s+vs\.?\s+/i, "|");
    const [left, right] = normalized.split("|");
    return {
      home: left?.trim() || "HM",
      away: right?.trim() || "AW",
    };
  })();

  const homeFallback = (homeTeamName ?? namesFromFallback?.home ?? "HM")
    .slice(0, 2)
    .toUpperCase();
  const awayFallback = (awayTeamName ?? namesFromFallback?.away ?? "AW")
    .slice(0, 2)
    .toUpperCase();

  const circle =
    size === "sm"
      ? "w-8 h-8"
      : size === "responsive"
        ? "w-8 h-8 md:w-10 md:h-10"
        : "w-10 h-10";
  const overlap =
    size === "sm" ? "-ml-3" : size === "responsive" ? "-ml-3 md:-ml-4" : "-ml-4";
  const textSize =
    size === "sm"
      ? "text-[9px]"
      : size === "responsive"
        ? "text-[9px] md:text-[10px]"
        : "text-[10px]";

  return (
    <div className="relative flex items-center pr-1 flex-shrink-0" aria-hidden>
      <div
        className={`relative z-[2] ${circle} rounded-full overflow-hidden ring-2 ring-border/50`}
      >
        {homeTeamLogo ? (
          <Image
            src={homeTeamLogo}
            alt=""
            fill
            className="object-contain object-center"
            sizes="40px"
          />
        ) : (
          <span
            className={`absolute inset-0 flex items-center justify-center ${textSize} font-bold text-muted-foreground bg-muted`}
          >
            {homeFallback}
          </span>
        )}
      </div>
      <div
        className={`relative ${circle} rounded-full overflow-hidden ${overlap} ring-2 ring-border/50`}
      >
        {awayTeamLogo ? (
          <Image
            src={awayTeamLogo}
            alt=""
            fill
            className="object-contain object-center"
            sizes="40px"
          />
        ) : (
          <span
            className={`absolute inset-0 flex items-center justify-center ${textSize} font-bold text-muted-foreground bg-muted`}
          >
            {awayFallback}
          </span>
        )}
      </div>
    </div>
  );
}
