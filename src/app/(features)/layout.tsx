import Header from "@/components/layout/header";
import Nav from "@/components/layout/nav";
import ConditionalFooter from "@/components/layout/conditional-footer";
import BodyOverflowHandler from "@/components/layout/body-overflow-handler";
import MobileNav from "@/components/layout/mobile-nax";
export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-hidden antialiased pb-10 md:pb-0">
      <BodyOverflowHandler />
      <Header />
      <Nav />
      {children}
      <ConditionalFooter />
      <MobileNav />
    </div>
  );
}
