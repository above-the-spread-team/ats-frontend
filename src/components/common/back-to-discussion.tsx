"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackToDiscussionProps {
  href?: string;
  label?: string;
  variant?: "ghost" | "outline";
  className?: string;
  tabIndex?: number;
  onClick?: () => void;
}

export default function BackToDiscussion({
  href = "/discuss",
  label = "Back to Discussion",
  variant = "ghost",
  className,
  tabIndex,
  onClick,
}: BackToDiscussionProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    router.push(href);
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      tabIndex={tabIndex}
      className={className}
    >
      <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" />
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
    </Button>
  );
}
