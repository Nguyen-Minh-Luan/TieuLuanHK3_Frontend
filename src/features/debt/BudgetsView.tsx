import React, { useState, useMemo } from 'react';
import { Wallet, ShieldAlert, CheckCircle, Percent, Plus, Edit3, Sparkles } from 'lucide-react';
import type { Debt } from './types';

interface BudgetsViewProps {
  debts: Debt[];
}

interface BudgetLimit {
  category: string;
  key: 'bank' | 'tech' | 'real_estate' | 'logistics' | 'other';
  allocated: number;
  colorClass: string;
}

export default function BudgetsView({ debts }: BudgetsViewProps) {
  // Preset budget limits states
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([
    { category: 'Ngân hàng & Tài chính', key: 'bank', allocated: 5000000000, colorClass: 'bg-[#d91c1c]' },
    { category: 'Hạ tầng Công nghệ & Phần mềm', key: 'tech', allocated: 2500000000, colorClass: 'bg-[#2563eb]' },
    { category: 'Mặt bằng & Bất động sản', key: 'real_estate', allocated: 3000000000, colorClass: 'bg-[#15803d]' },
    { category: 'Hậu cần & Vận tải Logistics', key: 'logistics', allocated: 1000000000, colorClass: 'bg-[#7c3aed]' },
    { category: 'Hạng mục mậu dịch / Khác', key: 'other', allocated: 1200000000, colorClass: 'bg-[#475569]' },
  ]);

  const [editingLimit, setEditingLimit] = useState<{ key: string; value: number } | null>(null);

  // Calculate actual total spent by Category based on unpaid/active debts
  const committedByCategory = useMemo(() => {
    const commitment: Record<string, number> = {
      bank: 0,
      tech: 0,
      real_estate: 0,
      logistics: 0,
      other: 0,
    };

    debts.forEach(d => {
      if (d.status !== 'Paid') {
        commitment[d.creditorType] = (commitment[d.creditorType] || 0) + d.amount;
      }
    });

    return commitment;
  }, [debts]);

  // Handle change the limit spending
  const handleSaveBudgetLimit = (key: string) => {
    if (editingLimit && editingLimit.value > 0) {
      setBudgetLimits(prev => prev.map(limit => {
        if (limit.key === key) {
          return { ...limit, allocated: editingLimit.value };
        }
        return limit;
      }));
      setEditingLimit(null);
    }
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  return (
    <div id="budgets-view-wrapper" className="flex-1 min-h-screen bg-[#f8f9fb] px-8 py-8 space-y-8 overflow-y-auto select-none font-sans">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
            Quản lý Ngân sách Dư nợ
          </h2>
          <p className="text-xs font-medium text-[#64748b] mt-1.5">
            Phân bổ và thiết lập ngưỡng báo động chi tiêu tối đa cho từng nhóm lĩnh vực nợ của doanh nghiệp.
          </p>
        </div>
      </div>

      {/* Corporate guidelines alert box */}
      <div className="bg-[#f0f9ff] text-[#0369a1] p-5 rounded-2xl border border-[#b9e6fe]/40 text-xs font-semibold flex items-start gap-4">
        <Sparkles className="w-5 h-5 text-[#0284c7] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#0369a1] font-display">Tự động giám sát rủi ro vượt ngân sách</p>
          <p className="leading-relaxed">
            Hệ thống Equity Ledger sử dụng các cảm biến để quét dữ nợ chủ động và đưa ra các cảnh báo Critical hoặc Warning khi số tiền nợ chưa trả vượt quá <strong>80% ngân sách hạn mức</strong> được khai báo của phân khúc đó.
          </p>
        </div>
      </div>

      {/* Main Budget Grid list */}
      <div id="budgets-limit-container" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgetLimits.map((bLimit) => {
          const actualSpent = committedByCategory[bLimit.key] || 0;
          const percentage = bLimit.allocated > 0 ? (actualSpent / bLimit.allocated) * 100 : 0;
          const isOverLimit = actualSpent > bLimit.allocated;
          const isNearLimit = actualSpent > bLimit.allocated * 0.8 && !isOverLimit;

          return (
            <div
              key={bLimit.key}
              id={`budget-${bLimit.key}`}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,31,120,0.01)] flex flex-col justify-between space-y-5 border border-[#eaecf0]/10 hover:border-[#eaecf0]/40 transition-colors"
            >
              {/* Header block info */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-extrabold text-[#0f172a] font-display">{bLimit.category}</h3>
                  <span className="text-[10px] font-mono text-[#94a3b8] uppercase font-semibold block mt-0.5">Hạn mức danh mục</span>
                </div>

                {/* Indicator labels state */}
                {isOverLimit ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#fee2e2] text-[#991b1b]">
                    <ShieldAlert className="w-3.5 h-3.5" /> OVER-LIMIT
                  </span>
                ) : isNearLimit ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#fffbeb] text-[#92400e]">
                    <ShieldAlert className="w-3.5 h-3.5" /> NEAR-LIMIT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#f0fdf4] text-[#166534]">
                    <CheckCircle className="w-3.5 h-3.5" /> SAFE (ỔN ĐỊNH)
                  </span>
                )}
              </div>

              {/* Input for editing Allocated bar */}
              <div className="flex items-center justify-between text-xs py-2 px-3.5 bg-[#f8f9fb] rounded-xl">
                <div>
                  <span className="text-[#64748b] block font-medium">Hạn mức chi tiêu:</span>
                  {editingLimit?.key === bLimit.key ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        className="p-1 px-2 border border-[#cbd5e1] rounded-md bg-white font-bold text-[#0f172a] max-w-[150px] outline-none focus:border-[#003178]"
                        value={editingLimit.value}
                        onChange={(e) => setEditingLimit({ key: bLimit.key, value: Number(e.target.value) })}
                      />
                      <button
                        onClick={() => handleSaveBudgetLimit(bLimit.key)}
                        className="bg-[#003178] text-white px-2.5 py-1 rounded-md text-[10px] font-bold hover:bg-[#00255a] active:scale-95 transition-all cursor-pointer"
                      >
                        Lưu
                      </button>
                    </div>
                  ) : (
                    <span className="font-extrabold text-[#003178] block text-[13px] mt-0.5">
                      {formatVND(bLimit.allocated)}
                    </span>
                  )}
                </div>

                {editingLimit?.key !== bLimit.key && (
                  <button
                    onClick={() => setEditingLimit({ key: bLimit.key, value: bLimit.allocated })}
                    className="p-1.5 hover:bg-white rounded-lg text-[#64748b] hover:text-[#003178] border border-transparent hover:border-[#eaecf0] transition-all cursor-pointer"
                    title="Chỉnh sửa hạn mức"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-semibold text-[#475569]">
                  <span>Đã cam kết nợ: <strong>{formatVND(actualSpent)}</strong></span>
                  <span>{percentage.toFixed(0)}%</span>
                </div>

                <div className="w-full bg-[#f1f5f9] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isOverLimit ? 'bg-[#ef4444]' : isNearLimit ? 'bg-[#f59e0b]' : bLimit.colorClass
                      }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-[#94a3b8] font-medium">
                  {isOverLimit ? (
                    <span className="text-[#ef4444] font-bold">Vượt ngân sách: {formatVND(actualSpent - bLimit.allocated)}</span>
                  ) : (
                    <span>Còn lại: {formatVND(bLimit.allocated - actualSpent)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
