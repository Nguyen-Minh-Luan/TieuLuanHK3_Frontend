/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import {
  FileDown,
  Calendar,
  ArrowUpRight,
  Scale,
  PieChart,
  Landmark,
  TrendingUp,
  Sparkles,
  Building,
} from "lucide-react";
import type { Transaction } from "./types";

interface ReportsViewProps {
  transactions: Transaction[];
}

export default function ReportsView({ transactions }: ReportsViewProps) {
  const [reportMonth, setReportMonth] = useState("All");

  // Real data parsing
  const monthlyTotals = useMemo(() => {
    let revenue = 0;
    let infrastructure = 0;
    let procurement = 0;
    let maintenance = 0;
    let payroll = 0;

    transactions.forEach((tx) => {
      // Filter by selection
      if (reportMonth !== "All" && !tx.date.includes(reportMonth)) return;

      if (tx.status !== "Failed") {
        if (tx.amount >= 0) {
          revenue += tx.amount;
        } else {
          const val = Math.abs(tx.amount);
          if (tx.category === "Infrastructure") infrastructure += val;
          else if (tx.category === "Procurement") procurement += val;
          else if (tx.category === "Maintenance") maintenance += val;
          else if (tx.category === "HR & Payroll") payroll += val;
        }
      }
    });

    const expensesTotal = infrastructure + procurement + maintenance + payroll;
    const netSavings = revenue - expensesTotal;

    return {
      revenue,
      infrastructure,
      procurement,
      maintenance,
      payroll,
      expensesTotal,
      netSavings,
    };
  }, [transactions, reportMonth]);

  const handleExportCSV = () => {
    // Generate simple csv file representation
    const headings = "Mã giao dịch,Ngày,Chi tiết,Danh mục,Số tiền,Trạng thái\n";
    const rows = transactions
      .map(
        (t) =>
          `${t.refId},${t.date},"${t.description}",${t.category},${t.amount},${t.status}`,
      )
      .join("\n");

    const blob = new Blob([headings + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `ledger_pro_report_${reportMonth.toLowerCase()}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-blue-900 font-headline tracking-tight">
            Financial Intelligence Reports
          </h3>
          <p className="text-slate-500 mt-1 font-body text-sm">
            Generate customized audit papers & monitor profit/loss ratios.
          </p>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-700 cursor-pointer appearance-none pr-8"
            >
              <option value="All">All Periods (2023)</option>
              <option value="Oct">October 2023</option>
              <option value="Sep">September 2023</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            Export Spreadsheet
          </button>
        </div>
      </div>

      {/* Grid summarizing balance allocations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Savings metric */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-headline">
              Month Savings Ratio
            </span>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
              $
              {monthlyTotals.netSavings.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Gross Margin</span>
            <span className="text-emerald-500 font-extrabold flex items-center gap-0.5">
              <TrendingUp className="h-3.5 w-3.5" />
              {monthlyTotals.revenue > 0
                ? (
                  (monthlyTotals.netSavings / monthlyTotals.revenue) *
                  100
                ).toFixed(1)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Operational Cost metric */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-headline">
              Operational Expenses Runrate
            </span>
            <h4 className="text-2xl font-black text-rose-500 tracking-tight mt-1">
              -$
              {monthlyTotals.expensesTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Includes fail rates</span>
            <span className="text-slate-700 font-bold">100% audited</span>
          </div>
        </div>

        {/* Aggregate Inflow */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider font-headline">
              Gross Inflows (Revenue)
            </span>
            <h4 className="text-2xl font-black text-emerald-600 tracking-tight mt-1">
              +$
              {monthlyTotals.revenue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h4>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Cash Flow Index</span>
            <span className="text-slate-700 font-bold">Excellent</span>
          </div>
        </div>
      </div>

      {/* Categories table audits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linear detail audit cards */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs">
          <h4 className="text-md font-extrabold text-slate-800 font-headline mb-4">
            Chi tiết chỉ tiêu theo cấu trúc phân loại
          </h4>

          <div className="space-y-4">
            {/* HR Payroll row */}
            <div className="flex justify-between items-center py-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-xs shrink-0">
                  HR
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    HR &amp; Payroll Solutions
                  </span>
                  <p className="text-[11px] text-slate-400 font-body">
                    Contractor payouts, bonuses, wages
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block text-slate-800">
                  $
                  {monthlyTotals.payroll.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(monthlyTotals.expensesTotal > 0
                    ? (monthlyTotals.payroll / monthlyTotals.expensesTotal) *
                    100
                    : 0
                  ).toFixed(0)}
                  % of cost
                </span>
              </div>
            </div>

            {/* Procurement row */}
            <div className="flex justify-between items-center py-2.5 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                  PR
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    Procurement &amp; Materials
                  </span>
                  <p className="text-[11px] text-slate-400 font-body">
                    Steel supply, concrete aggregates
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block text-slate-800">
                  $
                  {monthlyTotals.procurement.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(monthlyTotals.expensesTotal > 0
                    ? (monthlyTotals.procurement /
                      monthlyTotals.expensesTotal) *
                    100
                    : 0
                  ).toFixed(0)}
                  % of cost
                </span>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="flex justify-between items-center py-2.5 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                  IN
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    Infrastructure &amp; Server Engines
                  </span>
                  <p className="text-[11px] text-slate-400 font-body">
                    AWS subscriptions, tech licencing
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block text-slate-800">
                  $
                  {monthlyTotals.infrastructure.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(monthlyTotals.expensesTotal > 0
                    ? (monthlyTotals.infrastructure /
                      monthlyTotals.expensesTotal) *
                    100
                    : 0
                  ).toFixed(0)}
                  % of cost
                </span>
              </div>
            </div>

            {/* Maintenance */}
            <div className="flex justify-between items-center py-2.5 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shrink-0">
                  MT
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block">
                    Site Inspection &amp; Maintenance
                  </span>
                  <p className="text-[11px] text-slate-400 font-body">
                    Emergency checks, building works
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold block text-slate-800">
                  $
                  {monthlyTotals.maintenance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {(monthlyTotals.expensesTotal > 0
                    ? (monthlyTotals.maintenance /
                      monthlyTotals.expensesTotal) *
                    100
                    : 0
                  ).toFixed(0)}
                  % of cost
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual analytical advice card */}
        <div className="lg:col-span-5 bg-linear-to-br from-primary to-primary-container rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300 animate-bounce" />
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200">
                AI Ledger Assistant
              </span>
            </div>

            <h5 className="text-sm font-extrabold font-headline">
              Chỉ số tối ưu hoạt động (October Summary)
            </h5>
            <p className="text-xs text-blue-100 font-body leading-relaxed">
              Dựa trên thống kê tổng hợp, cấu trúc chi phí vận hành trong tháng{" "}
              {reportMonth === "All" ? "10" : reportMonth} cho thấy mức chi trả
              lương nhân lực của Công ty chiếm tỉ trọng cao nhất.
            </p>
            <p className="text-xs text-blue-100 font-body leading-relaxed">
              Khuyến nghị: Tối ưu hóa thời hạn nhà thầu phụ tại Procurement để
              bảo bọc dòng tiền tốt hơn vào giai đoạn Q1 năm sau.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-between items-center text-xs text-blue-200">
            <span>Dữ liệu cập nhật realtime</span>
            <span className="font-bold">Ledger Pro AI • Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
