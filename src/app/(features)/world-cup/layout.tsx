import WorldCupNav from "./components/nav";
import WorldCupHeader from "./components/header";
export default function WorldCupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <WorldCupHeader />
      <WorldCupNav />
      <main className="container mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
