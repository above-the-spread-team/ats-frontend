"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, X } from "lucide-react";
import { useTags } from "@/services/fastapi/tags";
import type { TagSummary, TagType } from "@/type/fastapi/tags";

interface TagFilterProps {
  selectedTagIds: number[];
  onTagIdsChange: (tagIds: number[]) => void;
}

const TAG_TYPE_ORDER: TagType[] = ["league", "team", "player", "topic"];

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "Leagues",
  team: "Teams",
  player: "Players",
  topic: "Topics",
};

export default function TagFilter({
  selectedTagIds,
  onTagIdsChange,
}: TagFilterProps) {
  // Fetch all tags (with pagination if needed)
  const { data: tagsData, isLoading } = useTags(1, 100);

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
    <div className="mb-4  flex justify-between items-center gap-2">
      {/* Show selected tags as chips */}
      <div className="">
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="rounded-full">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter by tags</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-56 max-h-[400px] overflow-y-auto rounded-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [scrollbar-width:thin] [scrollbar-color:hsl(var(--muted-foreground)/0.2)_transparent]"
        >
          {TAG_TYPE_ORDER.map((type, index) => {
            const tags = tagsByType[type];
            if (tags.length === 0) return null;

            return (
              <div key={type}>
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{TAG_TYPE_LABELS[type]}</DropdownMenuLabel>
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
                </DropdownMenuGroup>
                {index < TAG_TYPE_ORDER.length - 1 && <DropdownMenuSeparator />}
              </div>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
