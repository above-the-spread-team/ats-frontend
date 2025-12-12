import Image from "next/image";
import type { FixtureTeam } from "@/type/footballapi/fixture";

function getInitials(text: string | null | undefined, fallback = "??") {
  if (!text) return fallback;
  const trimmed = text.trim();
  if (!trimmed) return fallback;
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface TeamInfoProps {
  team: FixtureTeam;
  orientation: "home" | "away";
  className?: string;
  nameClassName?: string;
  logoClassName?: string;
  isDetail?: boolean;
}

export default function TeamInfo({
  team,
  orientation,
  className = "",
  nameClassName = "text-xs md:text-base font-semibold",
  logoClassName = "w-6 h-6 md:w-7 md:h-7 object-contain",
  isDetail = false,
}: TeamInfoProps) {
  const isHome = orientation === "home";

  const logo = team.logo ? (
    <Image
      src={team.logo}
      alt={team.name}
      width={isDetail ? 80 : 30}
      height={isDetail ? 80 : 30}
      className={`${logoClassName} ${isHome ? "" : "rounded-md"}`}
    />
  ) : (
    <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
      {getInitials(team.name)}
    </div>
  );

  return (
    <div
      className={`flex items-center gap-2 flex-col md:flex-row  ${
        isHome
          ? "flex-col-reverse text-center md:justify-end md:text-right"
          : "text-center md:justify-start md:text-left"
      } ${className}`}
    >
      {isHome ? (
        <>
          <p className={nameClassName}>{team.name}</p>
          {logo}
        </>
      ) : (
        <>
          {logo}
          <p className={nameClassName}>{team.name}</p>
        </>
      )}
    </div>
  );
}
