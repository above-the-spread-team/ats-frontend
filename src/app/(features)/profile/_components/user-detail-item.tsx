import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface UserDetailItemProps {
  icon: LucideIcon;
  label: string;
  value: string | ReactNode;
  warning?: string | ReactNode;
  valueClassName?: string;
  iconClassName?: string;
}

export default function UserDetailItem({
  icon: Icon,
  label,
  value,
  warning,
  valueClassName,
  iconClassName,
}: UserDetailItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl border bg-card">
      <Icon
        className={`h-5 w-5 text-muted-foreground mt-0.5 shrink-0 ${
          iconClassName || ""
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className={`text-sm md:text-base font-semibold break-words ${
            valueClassName || ""
          }`}
        >
          {value}
        </p>
        {warning && (
          <p className="text-xs text-destructive-foreground mt-1">{warning}</p>
        )}
      </div>
    </div>
  );
}
