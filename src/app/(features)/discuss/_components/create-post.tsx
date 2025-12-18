"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/services/fastapi/posts";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { cn } from "@/lib/utils";
import UserIcon from "@/components/common/user-icon";

interface CreatePostProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePost({ open, onOpenChange }: CreatePostProps) {
  const [content, setContent] = useState("");
  const createPostMutation = useCreatePost();
  const { data: currentUser } = useCurrentUser();

  const handleSubmit = async () => {
    if (!content.trim()) {
      return;
    }

    try {
      await createPostMutation.mutateAsync({
        content: content.trim(),
        image_url: null,
      });
      setContent("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
      // Error is handled by React Query, but we can show a toast here if needed
    }
  };

  const handleClose = () => {
    if (!createPostMutation.isPending) {
      setContent("");
      onOpenChange(false);
    }
  };

  const isSubmitting = createPostMutation.isPending;

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
          <div className="space-y-2">
            <label
              htmlFor="post-content"
              className="text-sm pl-2 font-medium text-foreground"
            >
              What&apos;s on your mind?
            </label>
            <textarea
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
          {createPostMutation.isError && (
            <p className="text-sm text-destructive">
              {createPostMutation.error instanceof Error
                ? createPostMutation.error.message
                : "Failed to create post. Please try again."}
            </p>
          )}
        </div>

        <DialogFooter className="flex flex-row justify-end px-4 md:px-2">
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
