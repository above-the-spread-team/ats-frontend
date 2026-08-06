"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateComment } from "@/services/fastapi/comments";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useRouter } from "next/navigation";
import { Loader2, Smile } from "lucide-react";
import UserIcon from "@/components/common/user-icon";
import EmojiPicker from "@/components/common/emoji-picker";
import type { EmojiClickData } from "emoji-picker-react";

interface CreateCommentProps {
  postId: number;
  parentCommentId?: number | null;
  repliedToUsername?: string | null; // Not used for display - backend handles @username
  onSuccess?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CreateComment({
  postId,
  parentCommentId = null,
  onSuccess,
  onCancel,
  autoFocus = false,
}: CreateCommentProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const createCommentMutation = useCreateComment();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [emojiDropdownOpen, setEmojiDropdownOpen] = useState(false);
  const pendingFocusRef = useRef<{
    cursorPos: number;
    scrollTop: number;
  } | null>(null);

  // Initialize with empty content - backend handles @username display
  const [content, setContent] = useState("");

  // Auto-focus when autoFocus is true
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      // Small delay to ensure the component is fully rendered and interactive
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [autoFocus]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!content.trim()) {
      return;
    }

    // Prevent submission if content exceeds 5000 characters
    if (content.length > 5000) {
      return;
    }

    try {
      await createCommentMutation.mutateAsync({
        postId,
        data: {
          content: content.trim(),
          parent_comment_id: parentCommentId ?? undefined,
        },
      });
      setContent("");
      onSuccess?.();
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create comment:", error);
    }
  };

  const handleCancel = () => {
    setContent("");
    onCancel?.();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex items-start   gap-3">
      <div className="flex-shrink-0 pt-2">
        <UserIcon
          avatarUrl={currentUser.avatar_url}
          name={currentUser.username}
          size="small"
          variant="primary"
          className={`${parentCommentId ? "w-5 h-5 md:w-6 md:h-6" : ""}`}
        />
      </div>
      <form onSubmit={handleSubmit} className="flex-1 space-y-2">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[30px] text-base !bg-muted/50  rounded-none border-0 border-b-2 border-t-0 border-l-0 border-r-0 border-primary-font/50 focus-visible:border-b-2 focus-visible:border-t-0 focus-visible:border-l-0 focus-visible:border-r-0 resize-none overflow-hidden py-1 md:py-2  shadow-none focus-visible:ring-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          autoFocus={false}
          disabled={createCommentMutation.isPending}
          maxLength={5001}
          rows={1}
        />
        <div className="flex items-center justify-between">
          <div className="min-h-[10px] -mt-2 flex items-center gap-2">
            {/* Emoji Picker */}
            <DropdownMenu
              open={emojiDropdownOpen}
              onOpenChange={setEmojiDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={createCommentMutation.isPending}
                  className="h-8 w-8 p-0"
                >
                  <Smile className="scale-110" />
                  <span className="sr-only">Add emoji</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-auto p-0 border-0 shadow-lg bg-transparent"
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </DropdownMenuContent>
            </DropdownMenu>
            {content.length > 5000 && (
              <span className="text-xs text-destructive">
                ({content.length}/5000)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={createCommentMutation.isPending}
              className="flex-shrink-0 rounded-full h-8 px-4"
            >
              <p className="text-xs">Cancel</p>
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                !content.trim() ||
                content.length > 5000 ||
                createCommentMutation.isPending
              }
              className="flex-shrink-0 rounded-full h-6 md:h-7 px-4"
            >
              {createCommentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 animate-spin" />
                </>
              ) : (
                <p className="text-xs">
                  {parentCommentId ? "Reply" : "Comment"}
                </p>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
