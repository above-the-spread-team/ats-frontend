import LoadingFull from "@/components/common/loading-full";
import Datepicker from "./_components/datepicker";

export default function Fixtures() {
  return (
    <div className="container mx-auto ">
      <Datepicker />
      <LoadingFull />
    </div>
  );
}
