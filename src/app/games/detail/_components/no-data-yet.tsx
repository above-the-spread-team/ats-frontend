import { Inbox } from "lucide-react";
import FullPage from "@/components/common/full-page";

interface NoDataYetProps {
  message?: string;
  helpText?: string;
  className?: string;
}

export default function NoDataYet({
  message = "No data available",
  helpText,
  className = "",
}: NoDataYetProps) {
  return (
    <FullPage center minusHeight={300}>
      <div
        className={`flex flex-col items-center justify-center gap-3 ${className}`}
      >
        <div className="text-4xl md:text-5xl text-primary">
          <Inbox />
        </div>
        <h2 className="text-base md:text-lg font-semibold text-muted-foreground">
          {message}
        </h2>
        {helpText && (
          <p className="max-w-md text-xs md:text-sm text-center text-muted-foreground">
            {helpText}
          </p>
        )}
      </div>
    </FullPage>
  );
}
