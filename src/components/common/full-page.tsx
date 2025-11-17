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
  return (
    <div
      className={` min-h-[60vh] md:min-h-[calc(100vh-${minusHeight}px)] w-full ${
        center ? "flex items-center justify-center" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
