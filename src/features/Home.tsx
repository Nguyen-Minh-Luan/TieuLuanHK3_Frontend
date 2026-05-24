import { motion } from "motion/react";
import { KPICards } from "../component/KPICards";
import { CashFlowChart } from "../component/CashFlowChart";
import { Sidebar } from "../component/Sidebar";
import Header from "../component/Header";
import { TransactionsData } from "../component/TransactionsData";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-brand-background p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl font-black text-brand-text tracking-tight mb-2 font-display"
                >
                  Financial Overview
                </motion.h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                  <span>As of Oct 24, 2023</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Data
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="bg-white px-6 py-3 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm">
                  Export CSV
                </button>
                <button className="primary-gradient text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-blue-900/10 hover:brightness-110 active:scale-[0.98] transition-all">
                  Generate Report
                </button>
              </div>
            </div>

            {/* Content Bento Grid */}
            <KPICards />

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CashFlowChart />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <TransactionsData />
            </motion.div>
          </div>

          <footer className="mt-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-8">
            Architectural Ledger © 2023 • All Systems Operational
          </footer>
        </main>
      </div>
    </div>
  );
}
