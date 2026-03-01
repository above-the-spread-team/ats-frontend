"use client";

import { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateSeason } from "@/lib/utils";

type TabType = "standings" | "leaders" | "teams";

export type SeasonOption = { year: number };

interface SeasonSelectProps {
  leagueId?: string;
  season: number;
  activeTab?: TabType;
  /** When provided (e.g. from team seasons API), options are built from these years (sorted desc). */
  availableSeasons?: SeasonOption[] | null;
}

export default function SeasonSelect({
  leagueId,
  season,
  activeTab,
  availableSeasons,
}: SeasonSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSeasonChange = (newSeason: string) => {
    const seasonNum = parseInt(newSeason, 10);
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", seasonNum.toString());
    if (!searchParams.get("tab") && activeTab && activeTab !== "standings") {
      params.set("tab", activeTab);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const isTournamentStyle =
    leagueId && parseInt(leagueId, 10) === 1; // World Cup

  const seasonOptions = useMemo(() => {
    const toOption = (year: number) => ({
      value: year.toString(),
      label: isTournamentStyle ? `${year}` : `${year}/${year + 1}`,
    });
    if (availableSeasons?.length) {
      const sorted = [...availableSeasons].sort((a, b) => b.year - a.year);
      const options = sorted.map((s) => toOption(s.year));
      const hasSelected = options.some((o) => o.value === season.toString());
      if (!hasSelected && !Number.isNaN(season)) {
        options.unshift(toOption(season));
        options.sort((a, b) => Number(b.value) - Number(a.value));
      }
      return options;
    }
    const currentSeasonYear = calculateSeason();
    return Array.from({ length: 5 }, (_, i) =>
      toOption(currentSeasonYear - i),
    );
  }, [availableSeasons, leagueId, isTournamentStyle, season]);

  const seasons = seasonOptions;

  return (
    <div className="flex items-center justify-end gap-2">
      <label
        htmlFor="season-select"
        className="text-sm font-medium text-muted-foreground"
      >
        Season:
      </label>
      <Select value={season.toString()} onValueChange={handleSeasonChange}>
        <SelectTrigger
          id="season-select"
          className="w-[100px] md:w-[120px] rounded-xl  font-medium  ring-1 ring-mygray"
        >
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl p-1 bg-primary-active text-mygray">
          {seasons.map((seasonOption) => (
            <SelectItem
              key={seasonOption.value}
              value={seasonOption.value}
              className="rounded-xl font-medium "
            >
              {seasonOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
