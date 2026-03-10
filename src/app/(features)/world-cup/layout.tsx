import WorldCupNav from "./components/nav";

export default function WorldCupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <WorldCupNav />
      <main>{children}</main>
    </div>
  );
}
