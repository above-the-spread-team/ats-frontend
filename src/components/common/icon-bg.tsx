import { ReactNode } from "react";

interface IconBgProps {
  children: ReactNode;
  className?: string;
}

/**
 * Component that provides a background for icons/images in dark mode
 * to improve visibility when the icon itself is dark.
 * The background uses a gradient that's more visible in dark mode.
 */
export default function IconBg({ children, className = "" }: IconBgProps) {
  return (
    <div
      className={`relative dark:bg-gradient-to-tr dark:to-primary-title/60 dark:from-primary/60 rounded-lg  dakr:shadow-inner ${className}`}
    >
      {children}
    </div>
  );
}
