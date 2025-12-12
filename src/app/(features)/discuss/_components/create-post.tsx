"use client";

import { useState } from "react";
import Image from "next/image";
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share your thoughts with the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* User Info */}
          {currentUser && (
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center text-white text-sm md:text-base font-semibold flex-shrink-0 overflow-hidden relative">
                {currentUser.avatar_url ? (
                  <Image
                    src={currentUser.avatar_url}
                    alt={currentUser.username}
                    width={48}
                    height={48}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{getInitials(currentUser.username)}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{currentUser.username}</p>
              </div>
            </div>
          )}

          {/* Content Textarea */}
          <div className="space-y-2">
            <label
              htmlFor="post-content"
              className="text-sm font-medium text-foreground"
            >
              What's on your mind?
            </label>
            <textarea
              id="post-content"
              placeholder="Share your thoughts with the community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={8}
              className={cn(
                "flex w-full rounded-xl border border-input bg-card px-3 py-2 text-base shadow-sm transition-colors",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-font",
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
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

        <DialogFooter>
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
