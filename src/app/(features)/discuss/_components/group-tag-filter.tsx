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

interface GroupTagFilterProps {
  selectedTagIds: number[];
  onTagIdsChange: (tagIds: number[]) => void;
}

const TAG_TYPE_ORDER: TagType[] = ["league"]; // Only league tags for groups

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "Leagues",
  team: "Teams",
  player: "Players",
  topic: "Topics",
};

export default function GroupTagFilter({
  selectedTagIds,
  onTagIdsChange,
}: GroupTagFilterProps) {
  // Fetch all tags
  const { data: tagsData, isLoading } = useTags(100);

  // Group tags by type (only league tags for groups)
  const tagsByType = useMemo(() => {
    const tags = tagsData?.items || [];
    const grouped: Record<TagType, TagSummary[]> = {
      league: [],
      team: [],
      player: [],
      topic: [],
    };

    tags.forEach((tag) => {
      // Only include league tags
      if (tag.type === "league" && grouped[tag.type]) {
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

  // Check if there are any tags
  const hasAnyTags = Object.values(tagsByType).some((tags) => tags.length > 0);

  // Get selected tags count for display
  const selectedCount = selectedTagIds.length;

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  if (!hasAnyTags) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col items-start gap-2">
      {/* Tag filter dropdown */}
      <div className="flex flex-wrap gap-2">
        {TAG_TYPE_ORDER.map((type) => {
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
                  {selectedCount > 0 && (
                    <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                      {selectedCount}
                    </span>
                  )}
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

      {/* Show selected tags as chips */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
