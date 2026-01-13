import React from "react";
import { Inbox } from "lucide-react";
import { IoFootball } from "react-icons/io5";

interface NoDateProps {
  // Date-related props (for NoGame use case)
  date?: string;

  // Message-related props (for NoDataYet use case)
  message?: string;
  helpText?: string;

  // Layout props
  className?: string;

  // Icon customization
  icon?: "football" | "inbox" | React.ReactNode;
}

export default function NoData({
  date,
  message,
  helpText,
  className = "min-h-[50vh]",
  icon = "inbox",
}: NoDateProps) {
  // Determine default message based on props
  const displayMessage =
    message || (date ? "No fixtures scheduled" : "No data available");

  // Determine if we should show help text
  const shouldShowHelpText = helpText !== undefined || date !== undefined;

  // Render icon
  const renderIcon = () => {
    if (typeof icon === "string") {
      if (icon === "football") {
        return <IoFootball />;
      }
      return <Inbox />;
    }
    return icon;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div className="text-4xl md:text-5xl text-primary">{renderIcon()}</div>
      <h2
        className={`text-base md:text-lg font-semibold ${
          date ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {displayMessage}
      </h2>
      {shouldShowHelpText && (
        <p className="max-w-md text-xs md:text-sm text-center text-muted-foreground">
          {helpText ? (
            helpText
          ) : date ? (
            <>
              We have no events to show on this date{" "}
              <span className="font-semibold">{date}</span>.
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
