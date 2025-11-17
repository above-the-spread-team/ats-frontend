"use client";

import { useId } from "react";

interface FullPageProps {
  children: React.ReactNode;
  center?: boolean;
  minusHeight?: number;
  className?: string;
}

export default function FullPage({
  children,
  center = false,
  minusHeight = 200,
  className = "",
}: FullPageProps) {
  const id = useId();
  const uniqueClass = `full-page-${id.replace(/:/g, "-")}`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 768px) {
              .${uniqueClass} {
                min-height: calc(100vh - ${minusHeight}px) !important;
              }
            }
          `,
        }}
      />
      <div
        className={`min-h-[60vh] w-full ${uniqueClass} ${
          center ? "flex items-center justify-center" : ""
        } ${className}`}
      >
        {children}
      </div>
    </>
  );
}
