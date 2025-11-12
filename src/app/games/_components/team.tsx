import Image from "next/image";
import type { FixtureTeam } from "@/type/fixture";

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
}

export default function TeamInfo({
  team,
  orientation,
  className = "",
  nameClassName = "text-xs md:text-base font-semibold",
}: TeamInfoProps) {
  const isHome = orientation === "home";

  const logo = team.logo ? (
    <Image
      src={team.logo}
      alt={team.name}
      width={100}
      height={100}
      className={`w-6 h-6 md:w-7 md:h-7 object-contain ${
        isHome ? "" : "rounded-md"
      }`}
    />
  ) : (
    <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-secondary/40 text-[10px] font-semibold uppercase text-muted-foreground">
      {getInitials(team.name)}
    </div>
  );

  return (
    <div
      className={`flex items-center gap-2 ${
        isHome ? "justify-end text-right" : "justify-start text-left"
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
