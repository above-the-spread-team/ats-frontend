import Fixtures from "./components/home-fixtures";
import FullPage from "@/components/common/full-page";
import { ScrollNews } from "./components/scroll-news";
import HomeRanking from "./components/home-ranking";
import HomeNews from "./components/home-news";
import HomeDiscuss from "./components/home-discuss";

export default function Home() {
  return (
    <FullPage minusHeight={40} className="space-y-4  pb-10">
      <Fixtures />
      <div className="container mx-auto px-2  max-w-6xl space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 -mx-2    flex items-center justify-center">
            <ScrollNews />
          </div>
          <div className="lg:col-span-1 hidden lg:block">
            <HomeRanking />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <HomeNews />
          <HomeDiscuss />
        </div>
      </div>
    </FullPage>
  );
}
