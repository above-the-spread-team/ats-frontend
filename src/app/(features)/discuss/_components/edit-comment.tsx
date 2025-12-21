"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateComment } from "@/services/fastapi/comments";
import { Loader2 } from "lucide-react";

interface EditCommentProps {
  commentId: number;
  initialContent: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditComment({
  commentId,
  initialContent,
  onSuccess,
  onCancel,
}: EditCommentProps) {
  const [content, setContent] = useState(initialContent);
  const updateCommentMutation = useUpdateComment();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    // Prevent submission if content exceeds 5000 characters
    if (content.length > 5000) {
      return;
    }

    try {
      await updateCommentMutation.mutateAsync({
        commentId,
        data: {
          content: content.trim(),
        },
      });
      setContent("");
      onSuccess?.();
    } catch (error) {
      console.error("Error updating comment:", error);
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    setContent(initialContent);
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[30px] text-base !bg-muted/50 rounded-none border-0 border-b-2 border-t-0 border-l-0 border-r-0 border-primary-font/50 focus-visible:border-b-2 focus-visible:border-t-0 focus-visible:border-l-0 focus-visible:border-r-0 resize-none overflow-hidden py-1 md:py-2 shadow-none focus-visible:ring-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        autoFocus
        disabled={updateCommentMutation.isPending}
        maxLength={5001}
        rows={1}
      />
      <div className="flex items-center justify-between">
        <div className="min-h-[10px] -mt-2">
          {content.length > 5000 && (
            <span className="text-xs text-destructive">
              ({content.length}/5000)
            </span>
          )}
          {updateCommentMutation.isError && (
            <span className="text-xs text-destructive">
              {updateCommentMutation.error instanceof Error
                ? updateCommentMutation.error.message
                : "Failed to update comment. Please try again."}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={updateCommentMutation.isPending}
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
              updateCommentMutation.isPending
            }
            className="flex-shrink-0 rounded-full h-6 md:h-7 px-4"
          >
            {updateCommentMutation.isPending ? (
              <Loader2 className="w-4 animate-spin" />
            ) : (
              <p className="text-xs">Update</p>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

