import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import Loading from "@/components/common/loading";
import { Button } from "@/components/ui/button";

interface StatusMessageProps {
  variant: "loading" | "success" | "error" | "info";
  title: string;
  message: string | ReactNode;
  icon?: LucideIcon;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function StatusMessage({
  variant,
  title,
  message,
  icon: Icon,
  actionButton,
  className = "",
}: StatusMessageProps) {
  return (
    <div
      className={`flex flex-col  items-center justify-center   pt-4 gap-2 ${className}`}
    >
      {variant === "loading" && <Loading />}

      {variant === "success" && Icon && (
        <Icon className="h-8 w-8 md:h-12 md:w-12 text-green-600 dark:text-green-400 " />
      )}

      {variant === "error" && Icon && (
        <Icon className="h-8 w-8 md:h-12 md:w-12 text-destructive " />
      )}

      {variant === "info" && Icon && (
        <Icon className="h-8 w-8 md:h-12 md:w-12 text-primary " />
      )}

      <h3 className="text-base md:text-lg font-semibold  text-center">
        {title}
      </h3>
      {variant !== "error" && (
        <div className="text-muted-foreground text-xs md:text-sm text-center px-2">
          {message}
        </div>
      )}

      {actionButton && (
        <Button onClick={actionButton.onClick} className="w-full">
          {actionButton.label}
        </Button>
      )}
    </div>
  );
}
