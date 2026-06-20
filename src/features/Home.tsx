import { useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { KPICards } from "../component/KPICards";
import { CashFlowChart } from "../component/CashFlowChart";
import { Sidebar } from "../component/Sidebar";
import Header from "../component/Header";
import { TransactionsData } from "../component/TransactionsData";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import {
  fetchTotalBalance,
  fetchTransactions,
  fetchCategories,
} from "../store/slices/dashboardSlice";

// --- Loading Skeleton ---
function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="h-10 w-72 bg-slate-200 rounded-xl mb-2" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-slate-200 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 rounded-xl" />
        </div>
      </div>
      {/* KPI skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`bg-slate-100 rounded-xl h-36 ${i === 1 ? "lg:col-span-2" : ""}`}
          />
        ))}
        <div className="lg:col-span-4 bg-slate-100 rounded-xl h-24" />
      </div>
      {/* Chart skeleton */}
      <div className="bg-slate-100 rounded-xl h-72 mb-8" />
      {/* Table skeleton */}
      <div className="bg-slate-100 rounded-xl h-64" />
    </div>
  );
}

// --- Error Banner ---
function ErrorBanner({ message }: { message: string | null }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
        <span className="text-red-500 text-2xl">⚠️</span>
        <div>
          <p className="font-bold text-red-800 mb-1">Không thể tải dữ liệu Dashboard</p>
          <p className="text-red-600 text-sm">{message || "Lỗi kết nối. Vui lòng kiểm tra backend và thử lại."}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const dispatch = useAppDispatch();
  const { totalBalance, transactions, categories, status, error } = useAppSelector(
    (state) => state.dashboard
  );

  // Fetch data on mount (only when idle to avoid duplicate calls)
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchTotalBalance());
      dispatch(fetchTransactions());
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  // --- Derived: Category ID → Name map ---
  const categoriesMap = useMemo(() => {
    const map: Record<number, string> = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  // --- Derived: KPI totals from transactions ---
  const { totalIncome, totalExpense, netProfitMargin } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((tx) => {
      if (tx.type === "INCOME" && (tx.status === "ACTIVE" || tx.status === "UPDATED")) income += tx.amount;
      if (tx.type === "EXPENSE" && (tx.status === "ACTIVE" || tx.status === "UPDATED")) expense += tx.amount;
    });
    const margin = income > 0 ? ((income - expense) / income) * 100 : 0;
    return {
      totalIncome: income,
      totalExpense: expense,
      netProfitMargin: margin,
    };
  }, [transactions]);

  // --- Derived: 5 most recent transactions ---
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
      )
      .slice(0, 5);
  }, [transactions]);

  // --- Derived: Cash flow data for last 6 months ---
  const cashFlowData = useMemo(() => {
    const now = new Date();
    const months: { name: string; year: number; month: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        year: d.getFullYear(),
        month: d.getMonth(),
      });
    }

    const grouped: Record<string, { actual: number; projected: number }> = {};
    months.forEach(({ name }) => {
      grouped[name] = { actual: 0, projected: 0 };
    });

    transactions.forEach((tx) => {
      const d = new Date(tx.transactionDate);
      const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      const year = d.getFullYear();
      const monthEntry = months.find((m) => m.name === month && m.year === year);
      if (monthEntry && grouped[month] !== undefined) {
        // actual = INCOME; projected = EXPENSE
        if (tx.type === "INCOME") grouped[month].actual += tx.amount / 1_000_000;
        else grouped[month].projected += tx.amount / 1_000_000;
      }
    });

    return months.map(({ name }) => ({
      name,
      actual: Math.round(grouped[name].actual * 100) / 100,
      projected: Math.round(grouped[name].projected * 100) / 100,
    }));
  }, [transactions]);

  // Current date display
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Fixed width */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 bg-brand-background p-8 overflow-y-auto">
          {status === "loading" ? (
            <DashboardSkeleton />
          ) : status === "failed" ? (
            <ErrorBanner message={error} />
          ) : (
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
                    <span>As of {today}</span>
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
              <KPICards
                totalBalance={totalBalance}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                netProfitMargin={netProfitMargin}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CashFlowChart data={cashFlowData} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <TransactionsData
                  transactions={recentTransactions}
                  categoriesMap={categoriesMap}
                />
              </motion.div>
            </div>
          )}

          <footer className="mt-12 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest pb-8">
            Architectural Ledger © 2023 • All Systems Operational
          </footer>
        </main>
      </div>
    </div>
  );
}
