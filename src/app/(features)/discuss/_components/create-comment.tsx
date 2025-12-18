"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "@/services/fastapi/comments";
import { useCurrentUser } from "@/services/fastapi/oauth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import UserIcon from "@/components/common/user-icon";

interface CreateCommentProps {
  postId: number;
  parentCommentId?: number | null;
  repliedToUsername?: string | null; // Username to show @username at the beginning
  onSuccess?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function CreateComment({
  postId,
  parentCommentId = null,
  repliedToUsername = null,
  onSuccess,
  onCancel,
  autoFocus = false,
}: CreateCommentProps) {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const createCommentMutation = useCreateComment();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

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
          autoFocus={autoFocus}
          disabled={createCommentMutation.isPending}
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
