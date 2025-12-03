import Header from "@/components/layout/header";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nax";
export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <Nav />
      {children}
      <Footer />
      <MobileNav />
    </>
  );
}
