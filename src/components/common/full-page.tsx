export default function FullPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center p-4 md:h-[calc(100vh-150px)]">
      {children}
    </div>
  );
}
