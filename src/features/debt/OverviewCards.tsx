import React from 'react';
import type { Debt } from './types';

interface OverviewCardsProps {
  debts: Debt[];
}

export default function OverviewCards({ debts }: OverviewCardsProps) {
  // 1. Calculate TỔNG NỢ HIỆN TẠI (All active/unpaid debt)
  const unpaidDebts = debts.filter(d => d.status !== 'Paid');
  const totalUnpaid = unpaidDebts.reduce((sum, d) => sum + d.amount, 0);

  // 2. Calculate NỢ QUÁ HẠN (Strictly those marked 'Critical' or 'Warning' which represent overdue/risky ones)
  const criticalDebts = debts.filter(d => d.status === 'Critical');
  const totalCriticalAmount = criticalDebts.reduce((sum, d) => sum + d.amount, 0);
  const criticalCount = criticalDebts.length;

  // 3. Calculate SẮP ĐẾN HẠN (7 NGÀY) (We can sum up those marked 'Warning' or specified due within near term)
  const warningDebts = debts.filter(d => d.status === 'Warning');
  const totalWarningAmount = warningDebts.reduce((sum, d) => sum + d.amount, 0);

  // 4. Calculate dynamic credit score based on ratio of paid vs total debts
  const totalCount = debts.length;
  const paidCount = debts.filter(d => d.status === 'Paid').length;
  const rawRatio = totalCount > 0 ? paidCount / totalCount : 0.5;
  // Map raw ratio to a realistic credit score between 650 and 850
  // e.g. base score 720, adding up to 130 points
  const baseScore = 780;
  const calculatedCreditScore = Math.min(850, Math.round(baseScore + rawRatio * 70 - (criticalCount * 15)));

  // Helper to format Vietnamese Dong
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  return (
    <div id="overview-cards-row" className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans select-none">
      {/* CARD 1: TỔNG NỢ PHẢI THU */}
      <div id="card-total-debt" className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,31,120,0.02)] transition-transform hover:translate-y-[-2px] duration-200">
        <p className="text-[10px] font-mono font-semibold text-[#64748b] tracking-wider uppercase mb-2">
          TỔNG NỢ PHẢI THU
        </p>
        <p id="total-debt-value" className="text-2xl font-display font-extrabold text-[#003178] tracking-tight">
          {formatVND(totalUnpaid)}
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs font-semibold text-[#10b981] bg-[#e6fbf3] px-2 py-0.5 rounded-md">
            ↗ +12.5%
          </span>
          <span className="text-[11px] text-[#64748b] font-medium">tháng này</span>
        </div>
      </div>

      {/* CARD 2: TỔNG NỢ PHẢI CHI */}
      <div id="card-overdue-debt" className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,31,120,0.02)] transition-transform hover:translate-y-[-2px] duration-200">
        <p className="text-[10px] font-mono font-semibold text-[#64748b] tracking-wider uppercase mb-2">
          TỔNG NỢ PHẢI CHI
        </p>
        <p id="overdue-debt-value" className="text-2xl font-display font-extrabold text-[#d91c1c] tracking-tight">
          {formatVND(totalCriticalAmount)}
        </p>
        <p className="text-xs font-medium text-[#d91c1c] mt-3 bg-[#fdf2f2] px-2.5 py-1 rounded-md inline-block">
          {criticalCount} khoản cần xử lý ngay
        </p>
      </div>
    </div>
  );
}
