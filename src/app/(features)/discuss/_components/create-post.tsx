"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import { useCreatePost, useModerationPoller } from "@/services/fastapi/posts";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useTags, useAddTagsToPost } from "@/services/fastapi/tags";
import { cn } from "@/lib/utils";
import UserIcon from "@/components/common/user-icon";
import EmojiPicker from "@/components/common/emoji-picker";
import {
  Tag,
  X,
  Smile,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { TagType, TagResponse } from "@/type/fastapi/tags";
import type { EmojiClickData } from "emoji-picker-react";

interface CreatePostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: number; // Optional group ID - if provided, post will be created in this group
}

// Only allow league tags for posts
const TAG_TYPE_ORDER: TagType[] = ["league"];

const TAG_TYPE_LABELS: Record<TagType, string> = {
  league: "Leagues",
  team: "Teams",
  player: "Players",
  topic: "Topics",
};

export default function CreatePost({
  open,
  onOpenChange,
  groupId,
}: CreatePostProps) {
  type ModerationPhase =
    | "idle"
    | "pending_moderation"
    | "approved"
    | "rejected"
    | "timed_out"
    | "rate_limited";

  const [content, setContent] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [moderationPhase, setModerationPhase] =
    useState<ModerationPhase>("idle");
  const [pendingPostId, setPendingPostId] = useState<number | null>(null);
  const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingFocusRef = useRef<{
    cursorPos: number;
    scrollTop: number;
  } | null>(null);
  const isSubmittingRef = useRef(false);
  const createPostMutation = useCreatePost();
  const addTagsMutation = useAddTagsToPost();
  const { data: currentUser } = useCurrentUser();
  const { data: tagsData, isLoading: tagsLoading } = useTags(100);
  const queryClient = useQueryClient();

  useModerationPoller(
    pendingPostId,
    moderationPhase === "pending_moderation",
    (status) => {
      setModerationPhase(status === "published" ? "approved" : "rejected");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    () => setModerationPhase("timed_out"),
  );

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

  // Handle focus restoration after dropdown closes
  useEffect(() => {
    if (!emojiDropdownOpen && pendingFocusRef.current && textareaRef.current) {
      let focusRestored = false;

      const restoreFocus = () => {
        if (focusRestored || !textareaRef.current || !pendingFocusRef.current) {
          return;
        }
        focusRestored = true;
        const { cursorPos, scrollTop } = pendingFocusRef.current;

        // Restore scroll position first to prevent jumping
        textareaRef.current.scrollTop = scrollTop;

        // Then focus and set cursor position
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPos, cursorPos);

        // Restore scroll position again after focus (in case browser scrolled)
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.scrollTop = scrollTop;
          }
        });

        pendingFocusRef.current = null;
      };

      // Intercept focus events to catch when Radix UI tries to focus the trigger button
      const handleFocusIn = (e: FocusEvent) => {
        if (focusRestored || !pendingFocusRef.current) {
          return;
        }

        const target = e.target as HTMLElement;
        // Check if focus is going to a button that's not the textarea
        // This likely means Radix UI is restoring focus to the trigger
        if (
          target &&
          target.tagName === "BUTTON" &&
          target !== textareaRef.current &&
          !target.closest('[role="dialog"]') // Don't intercept focus in dialogs
        ) {
          // Prevent the focus and restore to textarea instead
          e.preventDefault();
          e.stopImmediatePropagation();

          // Restore focus to textarea in the next tick
          requestAnimationFrame(() => {
            restoreFocus();
          });
        }
      };

      // Listen for focus events with capture phase to intercept early
      document.addEventListener("focusin", handleFocusIn, true);

      // Fallback: restore focus after Radix UI's animation completes
      const timeoutId = setTimeout(() => {
        if (!focusRestored) {
          restoreFocus();
        }
      }, 250);

      // Cleanup
      const cleanupTimeout = setTimeout(() => {
        document.removeEventListener("focusin", handleFocusIn, true);
        if (pendingFocusRef.current) {
          pendingFocusRef.current = null;
        }
      }, 600);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(cleanupTimeout);
        document.removeEventListener("focusin", handleFocusIn, true);
      };
    }
  }, [emojiDropdownOpen]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
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

    // Store scroll position before making changes
    const scrollTop = textarea.scrollTop;

    const newContent = textBefore + emojiString + textAfter;
    setContent(newContent);

    // Store cursor position and scroll position for focus restoration after dropdown closes
    const newCursorPos = start + emojiString.length;
    pendingFocusRef.current = { cursorPos: newCursorPos, scrollTop };

    // Close the dropdown menu - useEffect will handle focus restoration
    setEmojiDropdownOpen(false);
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default behavior and stop propagation to avoid Safari issues
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!content.trim() || isSubmittingRef.current) {
      return;
    }

    // Set submitting flag to prevent multiple submissions
    isSubmittingRef.current = true;

    try {
      // Create the post first
      const newPost = await createPostMutation.mutateAsync({
        content: content.trim(),
        image_url: null,
        group_id: groupId || null,
      });

      // Add tags if any are selected
      if (selectedTagIds.length > 0) {
        await addTagsMutation.mutateAsync({
          postId: newPost.id,
          data: { tag_ids: selectedTagIds },
        });
      }

      // Only close dialog and reset state if mutations succeeded
      setContent("");
      setSelectedTagIds([]);
      isSubmittingRef.current = false;
      if (newPost.moderation_status === "pending_moderation") {
        setPendingPostId(newPost.id);
        setModerationPhase("pending_moderation");
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      isSubmittingRef.current = false;
      if (
        error instanceof Error &&
        error.message.includes("Daily post limit")
      ) {
        setModerationPhase("rate_limited");
      }
    }
  };

  const handleClose = (open: boolean) => {
    // Prevent closing if currently submitting
    if (
      isSubmittingRef.current ||
      createPostMutation.isPending ||
      addTagsMutation.isPending
    ) {
      return;
    }

    if (!open) {
      setContent("");
      setSelectedTagIds([]);
      setModerationPhase("idle");
      setPendingPostId(null);
      onOpenChange(false);
    }
  };

  const isSubmitting =
    createPostMutation.isPending || addTagsMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[93%] px-2 py-4 md:p-4 sm:max-w-[600px]"
        // Prevent closing on outside click or escape during submission or moderation review
        onInteractOutside={(e: Event) => {
          if (
            isSubmittingRef.current ||
            createPostMutation.isPending ||
            addTagsMutation.isPending ||
            (moderationPhase !== "idle" && moderationPhase !== "rate_limited")
          ) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e: KeyboardEvent) => {
          if (
            isSubmittingRef.current ||
            createPostMutation.isPending ||
            addTagsMutation.isPending ||
            moderationPhase === "pending_moderation"
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the community
          </DialogDescription>
        </DialogHeader>

        {moderationPhase !== "idle" ? (
          <div
            className={cn(
              "mx-1 my-1 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-muted/20 px-4 py-8 text-center sm:gap-5 sm:px-8 sm:py-10 md:gap-6 md:px-10 md:py-12",
            )}
          >
            {/* Icon */}
            {moderationPhase === "pending_moderation" && (
              <div className="relative flex items-center justify-center">
                <div className="absolute h-14 w-14 animate-ping rounded-full bg-muted-foreground/10 sm:h-16 sm:w-16 md:h-20 md:w-20" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-muted sm:h-16 sm:w-16 md:h-20 md:w-20">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-font sm:h-7 sm:w-7 md:h-9 md:w-9" />
                </div>
              </div>
            )}
            {moderationPhase === "timed_out" && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted sm:h-16 sm:w-16 md:h-20 md:w-20">
                <Clock className="h-6 w-6 text-primary-font sm:h-7 sm:w-7 md:h-9 md:w-9" />
              </div>
            )}
            {moderationPhase === "approved" && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 ring-1 ring-green-500/30 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <CheckCircle2 className="h-6 w-6 text-green-500 sm:h-7 sm:w-7 md:h-9 md:w-9" />
              </div>
            )}
            {moderationPhase === "rejected" && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/30 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <XCircle className="h-6 w-6 text-red-500 sm:h-7 sm:w-7 md:h-9 md:w-9" />
              </div>
            )}
            {moderationPhase === "rate_limited" && (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <AlertCircle className="h-6 w-6 text-amber-500 sm:h-7 sm:w-7 md:h-9 md:w-9" />
              </div>
            )}

            {/* Text */}
            <div className="space-y-1.5">
              {moderationPhase === "pending_moderation" && (
                <>
                  <p className="text-sm font-semibold sm:text-base md:text-lg">
                    Reviewing your post...
                  </p>
                  <p className="text-xs text-muted-foreground sm:text-sm md:text-base">
                    This usually takes 10–15 seconds.
                  </p>
                </>
              )}
              {moderationPhase === "timed_out" && (
                <>
                  <p className="text-sm font-semibold sm:text-base md:text-lg">
                    Still reviewing...
                  </p>
                  <p className="text-xs text-muted-foreground sm:text-sm md:text-base">
                    You&apos;ll be notified in the app when it&apos;s ready.
                  </p>
                </>
              )}
              {moderationPhase === "approved" && (
                <>
                  <p className="text-sm font-semibold text-green-600 sm:text-base md:text-lg dark:text-green-400">
                    Post published!
                  </p>
                  <p className="text-xs text-muted-foreground sm:text-sm md:text-base">
                    Your post passed moderation and is now live.
                  </p>
                </>
              )}
              {moderationPhase === "rejected" && (
                <>
                  <p className="text-sm font-semibold text-red-600 sm:text-base md:text-lg dark:text-red-400">
                    Post rejected
                  </p>
                  <p className="mx-auto max-w-[240px] text-xs text-muted-foreground sm:max-w-xs sm:text-sm md:text-base">
                    Your post didn&apos;t meet our community guidelines and has
                    been removed. Please review our guidelines before posting
                    again.
                  </p>
                </>
              )}
              {moderationPhase === "rate_limited" && (
                <>
                  <p className="text-sm font-semibold text-amber-600 sm:text-base md:text-lg dark:text-amber-400">
                    Daily limit reached
                  </p>
                  <p className="mx-auto max-w-[240px] text-xs text-muted-foreground sm:max-w-xs sm:text-sm md:text-base">
                    You&apos;ve used all 7 posts for today. Your limit resets at
                    midnight UTC.
                  </p>
                </>
              )}
            </div>

            {/* Action button — hidden while actively polling */}
            {moderationPhase !== "pending_moderation" && (
              <Button
                type="button"
                variant={moderationPhase === "approved" ? "default" : "outline"}
                className="min-w-[90px] sm:min-w-[100px] md:min-w-[120px]"
                onClick={() => handleClose(false)}
              >
                {moderationPhase === "approved"
                  ? "Done"
                  : moderationPhase === "rate_limited"
                    ? "Got it"
                    : "Dismiss"}
              </Button>
            )}
          </div>
        ) : (
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
                  <p className="text-sm font-semibold">
                    {currentUser.username}
                  </p>
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
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
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
                rows={6}
                className={cn(
                  "flex w-full rounded-xl border border-input bg-card px-3 py-2 text-base shadow-sm transition-colors",
                  "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-font",
                  "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
                  "min-h-[120px] sm:min-h-[160px] md:min-h-[200px]",
                  "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:relative  [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
                )}
              />
            </div>
            {(createPostMutation.isError || addTagsMutation.isError) && (
              <p className="text-sm px-1 py-1 text-red-500">
                {createPostMutation.error instanceof Error
                  ? createPostMutation.error.message
                  : addTagsMutation.error instanceof Error
                    ? addTagsMutation.error.message
                    : "Failed to create post. Please try again."}
              </p>
            )}

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
                              const isSelected = selectedTagIds.includes(
                                tag.id,
                              );
                              return (
                                <DropdownMenuCheckboxItem
                                  key={tag.id}
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleTagToggle(tag.id)
                                  }
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
          </div>
        )}

        {moderationPhase === "idle" && (
          <DialogFooter className="flex flex-row justify-end px-4 gap-2 md:px-2">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isSubmitting) {
                  handleClose(false);
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
