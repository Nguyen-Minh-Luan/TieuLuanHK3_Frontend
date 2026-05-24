import Header from "../../component/Header";
import KPISection from "./KPISection";
import FilterBar from "./FilterBar";
import MobileNav from "./MobileNav";
import TransactionTable from "./TransactionTable";
import { Sidebar } from "../../component/Sidebar";

export default function Transaction() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Side Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top App Bar */}
        <Header />

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {/* Dashboard Content Well */}
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            <KPISection />
            <FilterBar />
            <TransactionTable />
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNav />
      </main>
    </div>
  );
}
