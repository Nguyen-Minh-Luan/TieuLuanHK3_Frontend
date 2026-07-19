/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  Scale,
  Sparkles,
  Sliders,
} from "lucide-react";
import type { Transaction, Budget } from "./types";
import { INITIAL_BUDGET_DATA } from "./data";

interface BudgetsViewProps {
  transactions: Transaction[];
}

export default function BudgetsView({ transactions }: BudgetsViewProps) {
  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGET_DATA);
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [catName, setCatName] = useState("Procurement");
  const [allocatedVal, setAllocatedVal] = useState("");

  // Live-calculate actual spent from transactions state!
  const computedBudgets = useMemo(() => {
    // Map of categories and values
    const actualSpent: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.amount < 0 && tx.status !== "CANCELLED") {
        const cat = tx.category;
        actualSpent[cat] = (actualSpent[cat] || 0) + Math.abs(tx.amount);
      }
    });

    return budgets.map((b) => {
      // Find actual spent or fallback to default
      const actual =
        actualSpent[b.category] !== undefined
          ? actualSpent[b.category]
          : b.spent;
      return {
        ...b,
        spent: actual,
      };
    });
  }, [budgets, transactions]);

  const handleSetAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatedVal || isNaN(parseFloat(allocatedVal))) return;

    const valNum = parseFloat(allocatedVal);

    // Check if category already has a budget record
    const exists = budgets.find(
      (b) => b.category.toLowerCase() === catName.toLowerCase(),
    );

    if (exists) {
      setBudgets(
        budgets.map((b) =>
          b.category.toLowerCase() === catName.toLowerCase()
            ? { ...b, allocated: valNum }
            : b,
        ),
      );
    } else {
      setBudgets([
        ...budgets,
        {
          category: catName,
          allocated: valNum,
          spent: 0,
          color: "from-slate-600 to-slate-800",
        },
      ]);
    }

    setAllocatedVal("");
    setIsAddingBudget(false);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-3xl font-extrabold text-blue-900 font-headline tracking-tight">
            Corporate Budgets & Allocations
          </h3>
          <p className="text-slate-500 mt-1 font-body text-sm">
            Control expenditure caps & monitor real-time department spending.
          </p>
        </div>

        <button
          onClick={() => setIsAddingBudget(!isAddingBudget)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <Sliders className="h-4 w-4" />
          Điều chỉnh / Thiết lập hạn mức
        </button>
      </div>

      {/* Inline adjustable configuration form */}
      {isAddingBudget && (
        <form
          onSubmit={handleSetAllocation}
          className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4 animate-fade-in w-full max-w-xl"
        >
          <h4 className="text-sm font-bold text-slate-800 font-headline">
            Cập nhật hạn định chi tiêu
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                Danh mục chọn
              </label>
              <select
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:outline-hidden text-slate-700 cursor-pointer"
              >
                <option value="Procurement">Procurement</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Maintenance">Maintenance</option>
                <option value="HR & Payroll">HR & Payroll</option>
                <option value="Marketing & Other">Marketing & Other</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
                Hạn định mới (USD)
              </label>
              <input
                type="number"
                value={allocatedVal}
                onChange={(e) => setAllocatedVal(e.target.value)}
                placeholder="50000"
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold text-slate-800 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsAddingBudget(false)}
              className="py-1.5 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="py-1.5 px-4 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container cursor-pointer"
            >
              Áp dụng hạn mức
            </button>
          </div>
        </form>
      )}

      {/* Grid displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {computedBudgets.map((item) => {
          const pct = Math.min((item.spent / item.allocated) * 100, 100);
          const overspent = item.spent > item.allocated;
          let trackerColor = "bg-primary";
          if (overspent) trackerColor = "bg-rose-500 animate-pulse";
          else if (pct > 80) trackerColor = "bg-amber-500";

          return (
            <div
              key={item.category}
              className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-bold text-slate-800 block uppercase tracking-wide">
                    {item.category}
                  </span>
                  <span className="text-xs text-slate-400 block font-medium">
                    Departmental Fund Tracker
                  </span>
                </div>

                {overspent ? (
                  <span className="inline-flex items-center gap-1 py-1 px-2.5 bg-red-50 text-red-700 rounded-full text-[10px] font-extrabold uppercase">
                    <AlertTriangle className="h-3.5 w-3.5" /> Over spent
                  </span>
                ) : (
                  <span className="text-[11px] font-extrabold text-blue-900 bg-blue-50/60 py-1 px-2 rounded-lg">
                    {pct.toFixed(0)}% Utilised
                  </span>
                )}
              </div>

              {/* Progress Bar slider */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${trackerColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>
                    Spent:{" "}
                    <strong
                      className={overspent ? "text-rose-500" : "text-slate-700"}
                    >
                      ${item.spent.toLocaleString("en-US")}
                    </strong>
                  </span>
                  <span>
                    Limit:{" "}
                    <strong className="text-slate-700">
                      ${item.allocated.toLocaleString("en-US")}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Warning box if near limit */}
              {!overspent && pct >= 80 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>
                    Cảnh báo: Hạn mức danh mục đã chi quá 80%. Vui lòng hạn chế
                    các giao dịch mua sắm Procurement lớn phát sinh.
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
