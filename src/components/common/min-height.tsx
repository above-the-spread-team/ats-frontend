export default function EmptyPage({ children }: { children: React.ReactNode }) {
  return (
    <div className=" min-h-[60vh]  md:min-h-[calc(100vh-140px)]">
      {children}
    </div>
  );
}
