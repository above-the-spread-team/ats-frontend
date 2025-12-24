"use client";

import { useState, useEffect, useRef } from "react";
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
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpdatePost } from "@/services/fastapi/posts";
import { cn } from "@/lib/utils";
import EmojiPicker from "@/components/common/emoji-picker";
import { Smile } from "lucide-react";
import type { EmojiClickData } from "emoji-picker-react";

interface EditPostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  initialContent: string;
  onSuccess?: () => void;
}

export default function EditPost({
  open,
  onOpenChange,
  postId,
  initialContent,
  onSuccess,
}: EditPostProps) {
  const [content, setContent] = useState(initialContent);
  const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingFocusRef = useRef<{
    cursorPos: number;
    scrollTop: number;
  } | null>(null);
  const updatePostMutation = useUpdatePost();

  // Update content when initialContent changes (e.g., when dialog opens)
  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [initialContent, open]);

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

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      await updatePostMutation.mutateAsync({
        postId,
        data: {
          content: content.trim(),
        },
      });
      setContent("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating post:", error);
      // Error is handled by the mutation, but we can show a toast here if needed
    }
  };

  const handleClose = () => {
    if (!updatePostMutation.isPending) {
      setContent(initialContent);
      onOpenChange(false);
    }
  };

  const isSubmitting = updatePostMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[93%] px-2 py-4 md:p-4 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>Update your post content</DialogDescription>
        </DialogHeader>

        <div>
          {/* Content Textarea */}
          <div className="space-y-1 pt-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="edit-post-content"
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
              id="edit-post-content"
              placeholder="Write something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={8}
              className={cn(
                "flex w-full rounded-xl border border-input bg-card px-3 py-2 text-base shadow-sm transition-colors",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-font",
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
                "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:relative [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40"
              )}
            />
          </div>
          {updatePostMutation.isError && (
            <p className="text-sm text-destructive mt-2">
              {updatePostMutation.error instanceof Error
                ? updatePostMutation.error.message
                : "Failed to update post. Please try again."}
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
            {isSubmitting ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
