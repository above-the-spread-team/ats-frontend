"use client";

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

interface SeasonSelectProps {
  leagueId?: string;
  season: number;
  activeTab?: TabType;
}

export default function SeasonSelect({ season, activeTab }: SeasonSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSeasonChange = (newSeason: string) => {
    const seasonNum = parseInt(newSeason, 10);
    // Get current search params and update only the season
    const params = new URLSearchParams(searchParams.toString());
    params.set("season", seasonNum.toString());

    // Preserve the tab parameter if it exists in the URL
    // If no tab in URL but activeTab is provided and not "standings", set it
    if (!searchParams.get("tab") && activeTab && activeTab !== "standings") {
      params.set("tab", activeTab);
    }

    // Use current pathname to preserve the route structure (works for both league and team pages)
    router.push(`${pathname}?${params.toString()}`);
  };

  // Use calculateSeason to get the current season year
  const currentSeasonYear = calculateSeason();
  const seasons = Array.from({ length: 5 }, (_, i) => {
    const year = currentSeasonYear - i;
    return { value: year.toString(), label: `${year}/${year + 1}` };
  });

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
