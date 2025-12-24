"use client";

import { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Theme } from "emoji-picker-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreatePost } from "@/services/fastapi/posts";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useTags, useAddTagsToPost } from "@/services/fastapi/tags";
import { cn } from "@/lib/utils";
import UserIcon from "@/components/common/user-icon";
import { Tag, X, Smile } from "lucide-react";
import type { TagType, TagResponse } from "@/type/fastapi/tags";

// Dynamic import to avoid SSR issues with emoji-picker-react
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface CreatePostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Only allow league tags for posts
const TAG_TYPE_ORDER: TagType[] = ["league"];

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "Leagues",
  team: "Teams",
  player: "Players",
  topic: "Topics",
};

export default function CreatePost({ open, onOpenChange }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { resolvedTheme } = useTheme();
  const createPostMutation = useCreatePost();
  const addTagsMutation = useAddTagsToPost();
  const { data: currentUser } = useCurrentUser();
  const { data: tagsData, isLoading: tagsLoading } = useTags(1, 100);

  // Map resolved theme to emoji-picker-react theme
  const emojiPickerTheme = useMemo<Theme>(() => {
    if (resolvedTheme === "dark") return Theme.DARK;
    if (resolvedTheme === "light") return Theme.LIGHT;
    return Theme.AUTO; // fallback for system theme
  }, [resolvedTheme]);

  // Group tags by type (only league tags for posts)
  const tagsByType = useMemo(() => {
    const tags = tagsData?.items || [];
    const grouped: Record<TagType, TagResponse[]> = {
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
      setSelectedTagIds(selectedTagIds.filter((id) => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    if (!textareaRef.current || !emojiData) return;

    // emoji-picker-react v4 structure: emojiData.emoji is the emoji character (e.g., '😀')
    const emojiString = emojiData.emoji;

    if (!emojiString) {
      console.error("Emoji data missing emoji property:", emojiData);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = content.substring(0, start);
    const textAfter = content.substring(end);

    const newContent = textBefore + emojiString + textAfter;
    setContent(newContent);

    // Close the dropdown menu
    setEmojiDropdownOpen(false);

    // Set cursor position after the inserted emoji
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emojiString.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      // Create the post first
      const newPost = await createPostMutation.mutateAsync({
        content: content.trim(),
        image_url: null,
      });

      // Add tags if any are selected
      if (selectedTagIds.length > 0) {
        await addTagsMutation.mutateAsync({
          postId: newPost.id,
          data: { tag_ids: selectedTagIds },
        });
      }

      setContent("");
      setSelectedTagIds([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
      // Error is handled by React Query, but we can show a toast here if needed
    }
  };

  const handleClose = () => {
    if (!createPostMutation.isPending && !addTagsMutation.isPending) {
      setContent("");
      setSelectedTagIds([]);
      onOpenChange(false);
    }
  };

  const isSubmitting =
    createPostMutation.isPending || addTagsMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[93%] px-2 py-4 md:p-4 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the community
          </DialogDescription>
        </DialogHeader>

        <div>
          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <UserIcon
                avatarUrl={currentUser.avatar_url}
                name={currentUser.username}
                size="large"
                variant="primary"
              />
              <div>
                <p className="text-sm font-semibold">{currentUser.username}</p>
              </div>
            </div>
          )}

          {/* Content Textarea */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="post-content"
                className="text-sm pl-2 font-medium text-foreground"
              >
                What&apos;s on your mind?
              </label>
              {/* Emoji Picker Button */}
              <DropdownMenu
                open={emojiDropdownOpen}
                onOpenChange={setEmojiDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting}
                    className="h-8 w-8 p-0"
                  >
                    <Smile className="scale-110" />
                    <span className="sr-only">Add emoji</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-auto p-0 border-0 shadow-lg bg-transparent"
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={emojiPickerTheme}
                    skinTonesDisabled={false}
                    previewConfig={{ showPreview: false }}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Textarea
              ref={textareaRef}
              id="post-content"
              placeholder="Write something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={8}
              className={cn(
                "flex w-full rounded-xl border border-input bg-card px-3 py-2 text-base shadow-sm transition-colors",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-font",
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
                "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:relative  [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40"
              )}
            />
          </div>

          {/* Tag Selection */}
          <div className="space-y-2">
            <label className="text-sm pl-2 font-medium text-foreground">
              Tags (optional)
            </label>
            <div className="space-y-2">
              {/* Selected tags as chips */}
              {selectedTagIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTagIds.map((tagId) => {
                    const tag = Object.values(tagsByType)
                      .flat()
                      .find((t) => t.id === tagId);
                    if (!tag) return null;

                    return (
                      <Button
                        key={tagId}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleTagToggle(tagId)}
                        disabled={isSubmitting}
                        className="h-7 gap-1.5 text-xs rounded-full"
                      >
                        {tag.name}
                        <X className="h-3 w-3" strokeWidth={2.5} />
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* Tag selector dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="rounded-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isSubmitting || tagsLoading}
                    className="gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    <span>Add tags</span>
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
                          <DropdownMenuLabel>
                            {TAG_TYPE_LABELS[type]}
                          </DropdownMenuLabel>
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
                        {index < TAG_TYPE_ORDER.length - 1 && (
                          <DropdownMenuSeparator />
                        )}
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {(createPostMutation.isError || addTagsMutation.isError) && (
            <p className="text-sm text-destructive">
              {createPostMutation.error instanceof Error
                ? createPostMutation.error.message
                : addTagsMutation.error instanceof Error
                ? addTagsMutation.error.message
                : "Failed to create post. Please try again."}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end px-4 gap-2 md:px-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
