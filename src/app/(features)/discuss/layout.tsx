import FullPage from "@/components/common/full-page";
import Sidebar from "./_components/sidebar";

export default function DiscussLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FullPage minusHeight={70}>
      <div className="container grid md:grid-cols-5 gap-4 lg:gap-8 mx-auto py-4  max-w-6xl px-2 ">
       <div className="md:col-span-1">
       <Sidebar />
       </div>
        <div className="md:col-span-4">{children}</div>
      </div>
    </FullPage>
  );
}