/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Layers,
  HeartCrack,
  AlertTriangle,
  Play,
} from "lucide-react";
import type { Transaction } from "./types";
import { formatVND } from "../../utils/formatCurrency";

interface DashboardViewProps {
  transactions: Transaction[];
  onNavigateToTxns: () => void;
}

export default function DashboardView({
  transactions,
  onNavigateToTxns,
}: DashboardViewProps) {
  // Real-time calculations based on master transactions state
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let criticalCount = 0;
    let warningCount = 0;

    transactions.forEach((tx) => {
      if (tx.status !== "CANCELLED") {
        if (tx.amount >= 0) {
          totalRevenue += tx.amount;
        } else {
          totalExpenses += Math.abs(tx.amount);
        }
      }

      if (tx.overSpending === "Critical") criticalCount++;
      if (tx.overSpending === "Warning") warningCount++;
    });

    const netAssets = totalRevenue - totalExpenses;
    const efficiency =
      totalRevenue > 0
        ? ((totalRevenue - totalExpenses) / totalRevenue) * 100
        : 0;

    return {
      netAssets,
      totalRevenue,
      totalExpenses,
      criticalCount,
      warningCount,
      efficiency,
    };
  }, [transactions]);

  // Generate category aggregated spend data
  const categorySummary = useMemo(() => {
    const sums: Record<string, number> = {};
    let totalSpent = 0;

    transactions.forEach((t) => {
      if (t.amount < 0 && t.status !== "CANCELLED") {
        const amt = Math.abs(t.amount);
        sums[t.category] = (sums[t.category] || 0) + amt;
        totalSpent += amt;
      }
    });

    return Object.entries(sums)
      .map(([cat, val]) => ({
        name: cat,
        value: val,
        percentage: totalSpent > 0 ? (val / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  // Monthly breakdown mock for chart drawing (SVG)
  const chartData = [
    { month: "May", income: 15000, spend: 11000 },
    { month: "Jun", income: 22000, spend: 18500 },
    { month: "Jul", income: 19000, spend: 15000 },
    { month: "Aug", income: 31000, spend: 24000 },
    { month: "Sep", income: 28000, spend: 31000 }, // Deficit
    {
      month: "Oct",
      income: stats.totalRevenue || 38000,
      spend: stats.totalExpenses || 28000,
    },
  ];

  // SVG Chart drawing calculations
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingLeft = 40;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;

  const points = useMemo(() => {
    const maxVal = Math.max(
      ...chartData.flatMap((d) => [d.income, d.spend]),
      50000,
    );
    const plotWidth = chartWidth - paddingLeft - paddingRight;
    const plotHeight = chartHeight - paddingTop - paddingBottom;

    const scaleX = (index: number) =>
      paddingLeft + (index / (chartData.length - 1)) * plotWidth;
    const scaleY = (val: number) =>
      chartHeight - paddingBottom - (val / maxVal) * plotHeight;

    const incomePoints = chartData
      .map((d, i) => `${scaleX(i)},${scaleY(d.income)}`)
      .join(" ");
    const spendPoints = chartData
      .map((d, i) => `${scaleX(i)},${scaleY(d.spend)}`)
      .join(" ");

    const incomeArea =
      `${paddingLeft},${chartHeight - paddingBottom} ` +
      incomePoints +
      ` ${paddingLeft + plotWidth},${chartHeight - paddingBottom}`;
    const spendArea =
      `${paddingLeft},${chartHeight - paddingBottom} ` +
      spendPoints +
      ` ${paddingLeft + plotWidth},${chartHeight - paddingBottom}`;

    return {
      incomePoints,
      spendPoints,
      incomeArea,
      spendArea,
      maxVal,
      scaleX,
      scaleY,
    };
  }, [chartData]);

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h3 className="text-3xl font-extrabold text-blue-900 font-headline tracking-tight">
          Executive Dashboard
        </h3>
        <p className="text-slate-500 mt-1 font-body text-sm">
          Realtime aggregate insights & corporate financial health diagnostics.
        </p>
      </div>

      {/* KPI Value Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Widget 1: Net Assets */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/50 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-headline">
              Tài Sản Ròng (Net Balance)
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-primary group-hover:scale-110 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-headline tracking-tight ${stats.netAssets >= 0 ? "text-blue-950" : "text-red-500"}`}
            >
              {stats.netAssets >= 0 ? "" : "-"}{formatVND(Math.abs(stats.netAssets))}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-500 font-bold flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5" /> +14.2%
            </span>
            vs last quarter
          </p>
        </div>

        {/* Widget 2: Doanh Thu */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/50 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-headline">
              Tổng Thu Nhập (Revenue)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-headline tracking-tight">
              +{formatVND(stats.totalRevenue)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-500 font-bold flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5" /> +8.5%
            </span>
            this month
          </p>
        </div>

        {/* Widget 3: Chi Tiêu */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/50 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-headline">
              Tổng Chi Phí (Expenses)
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-500 group-hover:scale-110 transition-transform">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-headline tracking-tight">
              -{formatVND(stats.totalExpenses)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-red-500 font-bold flex items-center">
              <ArrowDownRight className="h-3.5 w-3.5" /> -4.1%
            </span>
            optimised MoM
          </p>
        </div>

        {/* Widget 4: Cảnh báo ngân sách */}
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/50 relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 font-headline">
              Kiểm Soát Vượt Chi
            </span>
            <div
              className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${stats.criticalCount > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-500"}`}
            >
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-headline tracking-tight">
              {stats.criticalCount}{" "}
              <span className="text-xs font-semibold text-slate-500">
                critical flags
              </span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {stats.warningCount} warning elements detected
          </p>
        </div>
      </div>

      {/* Main Section: Chart & Category spend breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Linear Trend Graph Component */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="text-md font-bold text-slate-800 font-headline">
                Báo Cáo Biến Động Tài Chính (Q2 - Q4)
              </h4>
              <p className="text-xs text-slate-400 font-body">
                Biểu đồ so sánh dòng tiền vào (Income) và dòng tiền ra (Spend)
              </p>
            </div>

            {/* Legend indexes */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="font-semibold text-slate-600">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-800 inline-block" />
                <span className="font-semibold text-slate-600">Spend</span>
              </div>
            </div>
          </div>

          {/* SVG Canvas drawing */}
          <div className="relative w-full h-[180px] shrink-0">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
              {Array.from({ length: 4 }).map((_, i) => {
                const yVal =
                  paddingTop +
                  (i / 3) * (chartHeight - paddingTop - paddingBottom);
                return (
                  <line
                    key={i}
                    x1={paddingLeft}
                    y1={yVal}
                    x2={chartWidth - paddingRight}
                    y2={yVal}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })}

              {/* Area Underlines */}
              <polygon
                points={points.incomeArea}
                className="fill-emerald-400/10 pointer-events-none"
              />
              <polygon
                points={points.spendArea}
                className="fill-blue-500/10 pointer-events-none"
              />

              {/* Trend lines */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points.incomePoints}
              />
              <polyline
                fill="none"
                stroke="#003178"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points.spendPoints}
              />

              {/* Intersecting node dots for months */}
              {chartData.map((d, i) => (
                <g key={i}>
                  {/* Income node circle */}
                  <circle
                    cx={points.scaleX(i)}
                    cy={points.scaleY(d.income)}
                    r="5"
                    className="fill-white stroke-emerald-500"
                    strokeWidth="3"
                  />
                  {/* Spend node circle */}
                  <circle
                    cx={points.scaleX(i)}
                    cy={points.scaleY(d.spend)}
                    r="5"
                    className="fill-white stroke-blue-900"
                    strokeWidth="3"
                  />
                </g>
              ))}

              {/* Month Titles horizontally */}
              {chartData.map((d, i) => (
                <text
                  key={i}
                  x={points.scaleX(i)}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="fill-slate-400 font-bold text-[10px]"
                >
                  {d.month}
                </text>
              ))}

              {/* Vertical amounts labelling */}
              <text
                x={5}
                y={paddingTop + 5}
                className="fill-slate-400 font-bold text-[9px]"
              >
                ${Math.round(points.maxVal / 1000)}k
              </text>
              <text
                x={5}
                y={chartHeight - paddingBottom}
                className="fill-slate-400 font-bold text-[9px]"
              >
                $0
              </text>
            </svg>
          </div>
        </div>

        {/* Category breakdown doughnut representation card */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-xs border border-slate-200/50 flex flex-col justify-between">
          <div>
            <h4 className="text-md font-bold text-slate-800 font-headline">
              Phân Phối Ví Chi Tiêu
            </h4>
            <p className="text-xs text-slate-400 font-body mb-4">
              Danh mục chiếm tỷ trọng lớn nhất
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {categorySummary.length > 0 ? (
              categorySummary.slice(0, 4).map((item) => {
                let barColor = "bg-blue-600";
                if (item.name === "HR & Payroll") barColor = "bg-violet-500";
                else if (item.name === "Infrastructure")
                  barColor = "bg-rose-500";
                else if (item.name === "Maintenance") barColor = "bg-amber-500";
                else if (item.name === "Procurement") barColor = "bg-cyan-600";

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.name}</span>
                      <span>{item.percentage.toFixed(1)}%</span>
                    </div>
                    {/* Linear dynamic slider */}
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 inline-block font-mono">
                      Chi: {formatVND(item.value)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-400 text-xs py-10">
                Chưa phát sinh chỉ số chi tiêu hợp lệ.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recents Transactions listing summary panel */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/50">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-md font-bold text-slate-800 font-headline">
              Giao dịch phát sinh gần đây
            </h4>
            <p className="text-xs text-slate-400 font-body">
              Audit nhanh lịch sử dòng tiền
            </p>
          </div>
          <button
            onClick={onNavigateToTxns}
            className="text-xs font-bold text-primary hover:text-primary-container hover:underline flex items-center gap-1 cursor-pointer"
          >
            Quản lý tất cả (View All)
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0"
            >
              <div className="flex items-center min-w-0">
                <div
                  className={`w-8 h-8 rounded-full ${tx.amount < 0 ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"} flex items-center justify-center mr-3 font-semibold shrink-0`}
                >
                  {tx.amount < 0 ? "-" : "+"}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-slate-700 block truncate">
                    {tx.description}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {tx.date} • {tx.category}
                  </p>
                </div>
              </div>

              <div className="text-right whitespace-nowrap">
                <span
                  className={`text-sm font-extrabold ${tx.amount < 0 ? "text-red-500" : "text-emerald-600"}`}
                >
                  {tx.amount < 0 ? "-" : "+"}{formatVND(Math.abs(tx.amount))}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono uppercase">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
