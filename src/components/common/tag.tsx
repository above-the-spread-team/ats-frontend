import Link from "next/link";
import { getTagColor } from "@/data/league-theme";
import { cn } from "@/lib/utils";

interface TagProps {
  name: string;
  variant?: "small" | "medium" | "large";
  href?: string;
  className?: string;
}

export function Tag({ name, variant = "small", href, className }: TagProps) {
  const baseColor = getTagColor(name);

  const baseStyles = cn(
    "text-white font-semibold rounded-full",
    "relative overflow-hidden",
    "backdrop-blur-sm",
    "border border-white/20",
    "transition-all duration-300 ease-out",
    "transform hover:scale-105",
    "whitespace-nowrap flex-shrink-0",
    "before:absolute before:inset-0 before:rounded-full before:content-['']",
    "before:bg-gradient-to-br before:from-white/20 before:via-white/10 before:to-transparent",
    "before:pointer-events-none",
    className,
  );

  const variantStyles = {
    small: "text-[10px] px-2 py-0.5 md:py-1 font-semibold",
    medium: "text-xs px-2 py-0.5 md:py-0.5 font-bold",
    large: "text-sm px-3 py-1 md:py-1 font-bold",
  };

  const tagElement = (
    <span
      className={cn(baseStyles, variantStyles[variant])}
      style={{
        backgroundColor: baseColor,
      }}
    >
      <span className="relative z-10 whitespace-nowrap">{name}</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-block  transition-transform hover:scale-105 active:scale-95"
      >
        {tagElement}
      </Link>
    );
  }

  return tagElement;
}
