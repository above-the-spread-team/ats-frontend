"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";
import { useTags } from "@/services/fastapi/tags";
import type { TagSummary, TagType } from "@/type/fastapi/tags";

interface NewsFilterProps {
  selectedTagIds: number[];
  onTagIdsChange: (tagIds: number[]) => void;
}

const TAG_TYPE_ORDER: TagType[] = ["league", "team", "player", "topic"];

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "League",
  team: "Team",
  player: "Player",
  topic: "Topic",
};

const TAG_TYPE_BADGE: Record<TagType, string> = {
  league: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
  team: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/25",
  player:
    "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
  topic: "bg-primary-font/10 text-primary-font border-primary-font/25",
};

export default function NewsFilter({
  selectedTagIds,
  onTagIdsChange,
}: NewsFilterProps) {
  const { data: tagsData, isLoading } = useTags(100);

  const tagsByType = useMemo(() => {
    const grouped: Record<TagType, TagSummary[]> = {
      league: [],
      team: [],
      player: [],
      topic: [],
    };
    (tagsData?.items ?? []).forEach((tag) => {
      if (grouped[tag.type]) grouped[tag.type].push(tag);
    });
    return grouped;
  }, [tagsData]);

  const allTagsFlat = useMemo(
    () => Object.values(tagsByType).flat(),
    [tagsByType],
  );

  const getSelectedTagForType = (type: TagType) =>
    allTagsFlat.find((t) => t.type === type && selectedTagIds.includes(t.id)) ??
    null;

  const handleTagToggle = (tag: TagSummary) => {
    if (selectedTagIds.includes(tag.id)) {
      // Deselect
      onTagIdsChange(selectedTagIds.filter((id) => id !== tag.id));
      return;
    }

    const SPORT_TYPES = new Set<TagType>(["league", "team", "player"]);
    const isSport = SPORT_TYPES.has(tag.type);

    // Selecting any sport tag clears all other sport tags (league/team/player mutually exclusive).
    // Selecting a topic only clears the previous topic.
    const next = selectedTagIds.filter((id) => {
      const t = allTagsFlat.find((t2) => t2.id === id);
      if (!t) return false;
      return isSport ? !SPORT_TYPES.has(t.type) : t.type !== tag.type;
    });

    onTagIdsChange([...next, tag.id]);
  };

  const hasAnyTags = Object.values(tagsByType).some((t) => t.length > 0);
  const selectedCount = selectedTagIds.length;

  if (isLoading) {
    return (
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-24 animate-pulse rounded-full bg-muted"
          />
        ))}
      </div>
    );
  }

  if (!hasAnyTags) return null;

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {TAG_TYPE_ORDER.map((type) => {
          const tags = tagsByType[type];
          if (tags.length === 0) return null;

          const selectedTag = getSelectedTagForType(type);
          const hasSelection = selectedTag !== null;

          return (
            <DropdownMenu key={type}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={[
                    "gap-1 rounded-full transition-all !ring-0",
                    hasSelection
                      ? "bg-primary-font text-white border-primary-font hover:bg-primary-font/90 hover:text-white"
                      : "bg-primary text-white border-primary hover:bg-primary-active hover:text-white data-[state=open]:bg-primary-active",
                  ].join(" ")}
                >
                  <span className="max-w-[100px] truncate">
                    {hasSelection ? selectedTag!.name : TAG_TYPE_LABELS[type]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-56 max-h-[360px] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {TAG_TYPE_LABELS[type]}
                  <span className="ml-1 font-normal normal-case">
                    (select one)
                  </span>
                </div>
                {tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag.id}
                    checked={selectedTagIds.includes(tag.id)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  >
                    {tag.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>

      {/* Selected tag chips */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTagIds.map((tagId) => {
            const tag = allTagsFlat.find((t) => t.id === tagId);
            if (!tag) return null;
            return (
              <button
                key={tagId}
                onClick={() => handleTagToggle(tag)}
                className={[
                  "inline-flex items-center gap-1.5 h-7 text-xs font-medium px-2.5 rounded-full border transition-opacity hover:opacity-80",
                  TAG_TYPE_BADGE[tag.type],
                ].join(" ")}
              >
                <span className="uppercase text-[10px] font-bold opacity-60">
                  {TAG_TYPE_LABELS[tag.type]}
                </span>
                {tag.name}
                <X className="h-3 w-3 flex-shrink-0" strokeWidth={2.5} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
