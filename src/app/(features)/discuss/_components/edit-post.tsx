"use client";

import { useState, useEffect } from "react";
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
import { useUpdatePost } from "@/services/fastapi/posts";
import { cn } from "@/lib/utils";

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
  const updatePostMutation = useUpdatePost();

  // Update content when initialContent changes (e.g., when dialog opens)
  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [initialContent, open]);

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
          <div className="space-y-2">
            <label
              htmlFor="edit-post-content"
              className="text-sm pl-2 font-medium text-foreground"
            >
              What&apos;s on your mind?
            </label>
            <Textarea
              id="edit-post-content"
              placeholder="Write something..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={8}
              className={cn(
                "resize-none",
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
