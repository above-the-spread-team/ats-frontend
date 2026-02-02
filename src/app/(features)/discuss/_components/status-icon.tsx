"use client";

import { Button } from "@/components/ui/button";
import { Crown, Ban, Clock, Check, UserPlus } from "lucide-react";

interface StatusIconProps {
  isOwner?: boolean;
  followerStatus?: "active" | "pending" | "banned" | null | undefined;
  onFollow?: (e?: React.MouseEvent) => void | Promise<void>;
  onUnfollow?: (e?: React.MouseEvent) => void | Promise<void>;
  isFollowing?: boolean;
  isUnfollowing?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export default function StatusIcon({
  isOwner = false,
  followerStatus,
  onFollow,
  onUnfollow,
  isFollowing = false,
  isUnfollowing = false,
  disabled = false,
  size = "sm",
  className = "",
}: StatusIconProps) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const buttonSize = size === "sm" ? "h-7 text-xs" : "h-8 text-sm";

  // Owner status
  if (isOwner) {
    return (
      <Button
        size="sm"
        className={`${buttonSize} ${className} bg-green-100  hover:bg-green-100 text-green-800`}
      >
        <Crown className={`${iconSize} mr-1`} />
        Owner
      </Button>
    );
  }

  // Banned status
  if (followerStatus === "banned") {
    return (
      <Button
        size="sm"
        className={`${buttonSize} ${className} bg-red-100 hover:bg-red-100 text-red-800`}
      >
        <Ban className={`${iconSize} mr-1`} />
        Banned
      </Button>
    );
  }

  // Pending status
  if (followerStatus === "pending") {
    return (
      <Button
        size="sm"
        className={`${buttonSize} ${className}  bg-yellow-100 hover:bg-yellow-100 text-yellow-800`}
      >
        <Clock className={`${iconSize} mr-1`} />
        Pending
      </Button>
    );
  }

  // Active/Following status
  if (followerStatus === "active") {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onUnfollow?.(e);
        }}
        className={`${buttonSize} ${className}`}
        disabled={disabled || isUnfollowing || isFollowing}
      >
        {isUnfollowing ? (
          <>
            <span className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Unfollowing...
          </>
        ) : (
          <>
            <Check className={`${iconSize} mr-1`} />
            Following
          </>
        )}
      </Button>
    );
  }

  // Not following - show Follow button
  return (
    <Button
      size="sm"
      variant="default"
      onClick={(e) => {
        e.stopPropagation();
        onFollow?.(e);
      }}
      className={`${buttonSize} ${className}`}
      disabled={disabled || isFollowing || isUnfollowing}
    >
      {isFollowing ? (
        <>
          <span className="w-3 h-3 mr-1 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Following...
        </>
      ) : (
        <>
          <UserPlus className={`${iconSize} mr-1`} />
          Follow
        </>
      )}
    </Button>
  );
}
