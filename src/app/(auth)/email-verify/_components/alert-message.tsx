import { LucideIcon } from "lucide-react";

interface AlertMessageProps {
  variant: "success" | "error" | "info" | "warning";
  icon: LucideIcon;
  title?: string;
  message: string;
  className?: string;
}

export default function AlertMessage({
  variant,
  icon: Icon,
  title,
  message,
  className = "",
}: AlertMessageProps) {
  const variantStyles = {
    success: {
      container:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
      icon: "text-green-600 dark:text-green-400",
      title: "text-green-800 dark:text-green-200",
      message: "text-green-700 dark:text-green-300",
    },
    error: {
      container:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-800 dark:text-red-200",
      message: "text-red-800 dark:text-red-200",
    },
    info: {
      container:
        "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-800 dark:text-blue-200",
      message: "text-blue-700 dark:text-blue-300",
    },
    warning: {
      container:
        "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      icon: "text-yellow-600 dark:text-yellow-400",
      title: "text-yellow-800 dark:text-yellow-200",
      message: "text-yellow-700 dark:text-yellow-300",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-xl border p-2 flex items-start gap-2 ${styles.container} ${className}`}
    >
      <Icon className={`h-5 w-5 ${styles.icon} mt-0.5 flex-shrink-0`} />
      <div className="flex-1">
        {title && (
          <p className={`text-sm font-medium ${styles.title}`}>{title}</p>
        )}
        <p
          className={`text-sm ${title ? "text-xs mt-1" : ""} ${styles.message}`}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
