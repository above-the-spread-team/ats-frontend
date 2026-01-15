import Fixtures from "./components/home-fixtures";
import FullPage from "@/components/common/full-page";
import { ScrollNews } from "./components/scroll-news";
import HomeRanking from "./components/home-ranking";
import HomeNews from "./components/home-news";
import HomeDiscuss from "./components/home-discuss";

export default function Home() {
  return (
    <FullPage minusHeight={40} className="space-y-4 md:space-y-8  pb-10">
      <Fixtures />
      <div className="container mx-auto px-4   max-w-6xl space-y-6 lg:space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8">
          <div className="lg:col-span-3  -mx-[16px] md:mx-0 flex items-center justify-center">
            <ScrollNews />
          </div>
          <div className="lg:col-span-2 hidden lg:block">
            <HomeRanking />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 lg:gap-8">
          <div className="md:col-span-3">
            <HomeNews />
          </div>
          <div className="md:col-span-2">
            <HomeDiscuss />
          </div>
        </div>
      </div>
    </FullPage>
  );
}
