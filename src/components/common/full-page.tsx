interface FullPageProps {
  children: React.ReactNode;
  center?: boolean;
}

export default function FullPage({ children, center = false }: FullPageProps) {
  return (
    <div
      className={` min-h-[60vh] md:min-h-[calc(100vh-190px)] w-full ${
        center ? "flex items-center justify-center" : ""
      } `}
    >
      {children}
    </div>
  );
}
