import Image from "next/image";
import { cn } from "@/lib/utils";

function getFirstLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
}

export interface UserIconProps {
  avatarUrl?: string | null;
  name: string;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "muted";
  className?: string;
  alt?: string;
}

export default function UserIcon({
  avatarUrl,
  name,
  size = "medium",
  variant = "primary",
  className,
  alt,
}: UserIconProps) {
  const sizeClasses = {
    small: "w-6 h-6 md:w-8 md:h-8 text-xs md:text-sm",
    medium: "w-8 h-8 md:w-10 md:h-10 text-sm md:text-base",
    large: "w-10 h-10 md:w-12 md:h-12 text-sm md:text-base",
  };

  const variantClasses = {
    primary: "bg-gradient-to-br from-green-100 to-primary-active text-white",
    muted: "bg-mygray text-muted-foreground",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={alt || name}
          width={size === "small" ? 32 : size === "medium" ? 40 : 48}
          height={size === "small" ? 32 : size === "medium" ? 40 : 48}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{getFirstLetter(name)}</span>
      )}
    </div>
  );
}
