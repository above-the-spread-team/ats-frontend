"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Lock, X, Calendar, ArrowUp } from "lucide-react";
import { useTags } from "@/services/fastapi/tags";
import type { TagSummary, TagType } from "@/type/fastapi/tags";
import type { PostDateFilter, PostSortOption } from "@/type/fastapi/posts";

interface TagFilterProps {
  selectedTagIds: number[];
  onTagIdsChange: (tagIds: number[]) => void;
  dateRange?: PostDateFilter;
  onDateRangeChange: (dateRange: PostDateFilter | undefined) => void;
  sortBy?: PostSortOption;
  onSortByChange: (sortBy: PostSortOption | undefined) => void;
}

const SPORT_TYPES = new Set<TagType>(["league", "team", "player"]);

const TAG_TYPE_ORDER: TagType[] = ["league"];

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "League",
  team: "Team",
  player: "Player",
  topic: "Topic",
};

const TAG_TYPE_BADGE: Record<TagType, string> = {
  league: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25",
  team:   "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/25",
  player: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25",
  topic:  "bg-primary-font/10 text-primary-font border-primary-font/25",
};

const DATE_RANGE_OPTIONS: { value: PostDateFilter; label: string }[] = [
  { value: "24h", label: "Last 24 hrs" },
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
];

const SORT_OPTIONS: { value: PostSortOption; label: string }[] = [
  { value: "most_liked", label: "Most liked" },
  { value: "most_disliked", label: "Most disliked" },
  { value: "most_commented", label: "Most commented" },
];

export default function TagFilter({
  selectedTagIds,
  onTagIdsChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  onSortByChange,
}: TagFilterProps) {
  const { data: tagsData, isLoading } = useTags(100);

  const tagsByType = useMemo(() => {
    const grouped: Record<TagType, TagSummary[]> = {
      league: [], team: [], player: [], topic: [],
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

  // Which sport category is currently active?
  const activeSportType = useMemo<TagType | null>(() => {
    for (const id of selectedTagIds) {
      const tag = allTagsFlat.find((t) => t.id === id);
      if (tag && SPORT_TYPES.has(tag.type)) return tag.type;
    }
    return null;
  }, [selectedTagIds, allTagsFlat]);

  const handleTagToggle = (tag: TagSummary) => {
    const isSport = SPORT_TYPES.has(tag.type);

    if (selectedTagIds.includes(tag.id)) {
      // Deselect
      onTagIdsChange(selectedTagIds.filter((id) => id !== tag.id));
    } else if (isSport) {
      // Replace any existing sport tag; keep topic
      const topicIds = selectedTagIds.filter((id) => {
        const t = allTagsFlat.find((t2) => t2.id === id);
        return t?.type === "topic";
      });
      onTagIdsChange([...topicIds, tag.id]);
    } else {
      // Topic: replace existing topic; keep sport tag
      const sportIds = selectedTagIds.filter((id) => {
        const t = allTagsFlat.find((t2) => t2.id === id);
        return t && SPORT_TYPES.has(t.type);
      });
      onTagIdsChange([...sportIds, tag.id]);
    }
  };

  const isTypeDisabled = (type: TagType) =>
    SPORT_TYPES.has(type) && activeSportType !== null && activeSportType !== type;

  const getSelectedTagForType = (type: TagType) =>
    allTagsFlat.find(
      (t) => t.type === type && selectedTagIds.includes(t.id),
    ) ?? null;

  const selectedDateRangeLabel = dateRange
    ? DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label
    : "All time";

  const selectedSortLabel = sortBy
    ? SORT_OPTIONS.find((o) => o.value === sortBy)?.label
    : "Newest";

  if (isLoading) {
    return (
      <div className="mb-4 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
    );
  }

  const hasChips = selectedTagIds.length > 0 || !!dateRange || !!sortBy;

  return (
    <div className="mb-4 flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {/* Date Range */}
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="rounded-full bg-primary !ring-0 text-white hover:bg-primary-active hover:text-white data-[state=open]:bg-primary-active"
          >
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{selectedDateRangeLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 rounded-2xl">
            <DropdownMenuCheckboxItem
              checked={!dateRange}
              onCheckedChange={(checked) => { if (checked) onDateRangeChange(undefined); }}
            >
              All time
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {DATE_RANGE_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={dateRange === opt.value}
                onCheckedChange={(checked) =>
                  onDateRangeChange(checked ? opt.value : undefined)
                }
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="rounded-full bg-primary !ring-0 text-white hover:bg-primary-active hover:text-white data-[state=open]:bg-primary-active"
          >
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowUp className="h-3.5 w-3.5" />
              <span>{selectedSortLabel}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 rounded-2xl">
            <DropdownMenuCheckboxItem
              checked={!sortBy}
              onCheckedChange={(checked) => { if (checked) onSortByChange(undefined); }}
            >
              Newest
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={sortBy === opt.value}
                onCheckedChange={(checked) =>
                  onSortByChange(checked ? opt.value : undefined)
                }
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sport + Topic tag dropdowns */}
        {TAG_TYPE_ORDER.map((type) => {
          const tags = tagsByType[type];
          if (tags.length === 0) return null;

          const disabled = isTypeDisabled(type);
          const selectedTag = getSelectedTagForType(type);
          const hasSelection = selectedTag !== null;

          return (
            <DropdownMenu key={type}>
              <DropdownMenuTrigger asChild disabled={disabled}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className={[
                    "gap-1 rounded-full transition-all !ring-0",
                    disabled
                      ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-border"
                      : hasSelection
                      ? "bg-primary-font text-white border-primary-font hover:bg-primary-font/90 hover:text-white"
                      : "bg-primary text-white border-primary hover:bg-primary-active hover:text-white data-[state=open]:bg-primary-active",
                  ].join(" ")}
                >
                  {disabled && <Lock className="h-3 w-3 flex-shrink-0" />}
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
                  {type !== "topic" && (
                    <span className="ml-1 font-normal normal-case">(select one)</span>
                  )}
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

      {/* Hint when a sport type is locked */}
      {activeSportType && (
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Deselect <strong>{getSelectedTagForType(activeSportType)?.name}</strong> to switch sport category.
        </p>
      )}

      {/* Active filter chips */}
      {hasChips && (
        <div className="flex flex-wrap gap-1.5">
          {sortBy && (
            <button
              onClick={() => onSortByChange(undefined)}
              className="inline-flex items-center gap-1.5 h-7 text-xs font-medium px-2.5 rounded-full border bg-muted text-muted-foreground border-border hover:opacity-80 transition-opacity"
            >
              <ArrowUp className="h-3 w-3" />
              {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
          {dateRange && (
            <button
              onClick={() => onDateRangeChange(undefined)}
              className="inline-flex items-center gap-1.5 h-7 text-xs font-medium px-2.5 rounded-full border bg-muted text-muted-foreground border-border hover:opacity-80 transition-opacity"
            >
              <Calendar className="h-3 w-3" />
              {DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label}
              <X className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
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
