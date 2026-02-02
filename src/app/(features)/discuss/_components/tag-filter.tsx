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
import { ChevronDown, X, Calendar, ArrowUp } from "lucide-react";
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

const TAG_TYPE_ORDER: TagType[] = ["league", "team", "player", "topic"];

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "Leagues",
  team: "Teams",
  player: "Players",
  topic: "Topics",
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
  // Fetch all tags (with pagination if needed)
  const { data: tagsData, isLoading } = useTags(100);

  // Group tags by type
  const tagsByType = useMemo(() => {
    const tags = tagsData?.items || [];
    const grouped: Record<TagType, TagSummary[]> = {
      league: [],
      team: [],
      player: [],
      topic: [],
    };

    tags.forEach((tag) => {
      if (grouped[tag.type]) {
        grouped[tag.type].push(tag);
      }
    });

    return grouped;
  }, [tagsData]);

  const handleTagToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onTagIdsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagIdsChange([...selectedTagIds, tagId]);
    }
  };

  // Get selected tags count for display
  const selectedCount = selectedTagIds.length;

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  // Always show the filter component (at least date range filter), even if no tags

  const selectedDateRangeLabel = dateRange
    ? DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)?.label
    : "All time";

  const selectedSortLabel = sortBy
    ? SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label
    : "Newest";

  return (
    <div className="mb-4 flex flex-col items-start gap-2">
      {/* Separate dropdown menus for each tag type */}
      <div className="flex flex-wrap gap-2">
        {/* Date Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="rounded-full bg-primary !ring-0 text-white hover:bg-primary-active hover:text-white data-[state=open]:bg-primary-active"
          >
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" />
              <span>{selectedDateRangeLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-2xl">
            <DropdownMenuCheckboxItem
              checked={!dateRange}
              onCheckedChange={(checked) => {
                if (checked) {
                  onDateRangeChange(undefined);
                }
              }}
            >
              All time
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {DATE_RANGE_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={dateRange === option.value}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onDateRangeChange(option.value);
                  } else {
                    onDateRangeChange(undefined);
                  }
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            className="rounded-full bg-primary !ring-0 text-white hover:bg-primary-active hover:text-white data-[state=open]:bg-primary-active"
          >
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowUp className="h-4 w-4" />
              <span>{selectedSortLabel}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 rounded-2xl">
            <DropdownMenuCheckboxItem
              checked={!sortBy}
              onCheckedChange={(checked) => {
                if (checked) {
                  onSortByChange(undefined);
                }
              }}
            >
              Newest
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={sortBy === option.value}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSortByChange(option.value);
                  } else {
                    onSortByChange(undefined);
                  }
                }}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {TAG_TYPE_ORDER.filter(
          (type) => type !== "player" && type !== "team" && type !== "topic",
        ).map((type) => {
          const tags = tagsByType[type];
          if (tags.length === 0) return null;

          return (
            <DropdownMenu key={type}>
              <DropdownMenuTrigger
                asChild
                className="rounded-full bg-primary !ring-0 text-white hover:bg-primary-active hover:text-white data-[state=open]:bg-primary-active"
              >
                <Button variant="outline" size="sm" className="gap-1">
                  <span>{TAG_TYPE_LABELS[type]}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56 max-h-[400px] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.2)_transparent]"
              >
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={tag.id}
                      checked={isSelected}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    >
                      {tag.name}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
      {/* Show selected tags, date range, and sort as chips */}
      {(selectedCount > 0 || dateRange || sortBy) && (
        <div className="flex flex-wrap gap-1.5">
          {/* Sort chip */}
          {sortBy && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSortByChange(undefined)}
              className="h-7 gap-1.5 text-xs rounded-full"
            >
              <ArrowUp className="h-3 w-3" />
              {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label ||
                sortBy}
              <X className="h-3 w-3" strokeWidth={2.5} />
            </Button>
          )}
          {/* Date range chip */}
          {dateRange && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDateRangeChange(undefined)}
              className="h-7 gap-1.5 text-xs rounded-full"
            >
              <Calendar className="h-3 w-3" />
              {DATE_RANGE_OPTIONS.find((opt) => opt.value === dateRange)
                ?.label || dateRange}
              <X className="h-3 w-3" strokeWidth={2.5} />
            </Button>
          )}
          {/* Tag chips */}
          {selectedTagIds.map((tagId) => {
            const tag = Object.values(tagsByType)
              .flat()
              .find((t) => t.id === tagId);
            if (!tag) return null;

            return (
              <Button
                key={tagId}
                variant="secondary"
                size="sm"
                onClick={() => handleTagToggle(tagId)}
                className="h-7 gap-1.5 text-xs rounded-full"
              >
                {tag.name}
                <X className="h-3 w-3" strokeWidth={2.5} />
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
