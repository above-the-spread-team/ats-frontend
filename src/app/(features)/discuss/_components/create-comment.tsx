"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "@/services/fastapi/comments";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CreateCommentProps {
  postId: number;
  parentCommentId?: number | null;
  repliedToUsername?: string | null; // Username to show @username at the beginning
  onSuccess?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function CreateComment({
  postId,
  parentCommentId = null,
  repliedToUsername = null,
  onSuccess,
  placeholder = "Write a comment...",
  autoFocus = false,
}: CreateCommentProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const createCommentMutation = useCreateComment();
  // Initialize with @username if replying to a comment
  const [content, setContent] = useState(() => {
    return repliedToUsername ? `@${repliedToUsername} ` : "";
  });

  // Update content when repliedToUsername changes (only if content is empty)
  useEffect(() => {
    if (repliedToUsername && content.trim() === "") {
      setContent(`@${repliedToUsername} `);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repliedToUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (!content.trim()) {
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

  if (!currentUser) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] resize-none bg-red-500"
        autoFocus={autoFocus}
        disabled={createCommentMutation.isPending}
        maxLength={5000}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/5000
        </span>
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || createCommentMutation.isPending}
        >
          {createCommentMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </form>
  );
}
