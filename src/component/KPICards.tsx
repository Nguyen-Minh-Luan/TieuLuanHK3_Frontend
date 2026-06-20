import { motion } from "motion/react";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Percent,
  BarChartHorizontal,
} from "lucide-react";

interface KPICardsProps {
  totalBalance: number | null;
  totalIncome: number | null;
  totalExpense: number | null;
  netProfitMargin: number | null;
}

export function KPICards({
  totalBalance,
  totalIncome,
  totalExpense,
  netProfitMargin,
}: KPICardsProps) {
  const formatCurrency = (val: number | null) => {
    if (val === null || val === undefined) return "$0.00";
    return val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercentage = (val: number | null) => {
    if (val === null || val === undefined) return "0.0%";
    return `${val.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2 group hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="p-2.5 bg-blue-50 text-brand-primary rounded-xl transition-colors group-hover:bg-brand-primary group-hover:text-white">
            <Landmark className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-brand-secondary bg-blue-50 px-2.5 py-1.5 rounded-lg">
            Live
          </span>
        </div>
        <div className="text-sm font-medium text-slate-500 mb-1">
          Total Balance
        </div>
        <div className="text-4xl font-black text-brand-text font-display">
          {formatCurrency(totalBalance)}
        </div>
      </motion.div>

      {/* Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
      >
        <div className="mb-6">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 w-fit rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Income
        </div>
        <div className="text-2xl font-bold text-brand-text font-display">
          {formatCurrency(totalIncome)}
        </div>
        <div className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
          Inflow total
        </div>
      </motion.div>

      {/* Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
      >
        <div className="mb-6">
          <div className="p-2.5 bg-red-50 text-red-600 w-fit rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          Expenses
        </div>
        <div className="text-2xl font-bold text-brand-text font-display">
          {formatCurrency(totalExpense)}
        </div>
        <div className="text-[10px] text-red-600 mt-2 font-bold flex items-center gap-1">
          Outflow total
        </div>
      </motion.div>

      {/* Profit Margin Extra Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="lg:col-span-4 bg-blue-50/50 border border-brand-primary/10 p-6 rounded-xl relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="absolute -right-8 -top-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
          <BarChartHorizontal className="w-48 h-48 text-brand-primary" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-4 items-center">
            <div className="p-2.5 bg-brand-primary text-white rounded-xl shadow-lg shadow-blue-900/10">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Net Profit Margin
                </span>
                <span className="text-[10px] font-bold text-brand-primary px-2 py-0.5 bg-white rounded-md border border-brand-primary/10">
                  {netProfitMargin !== null && netProfitMargin >= 20 ? "Healthy" : "Attention"}
                </span>
              </div>
              <div className="text-2xl font-black text-brand-primary font-display tracking-tight">
                {formatPercentage(netProfitMargin)}
              </div>
            </div>
          </div>
          <button className="bg-brand-primary text-white font-bold py-3 px-6 rounded-lg text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all">
            Optimize Margin
          </button>
        </div>
      </motion.div>
    </div>
  );
}
