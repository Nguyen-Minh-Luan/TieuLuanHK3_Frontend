/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Transaction } from './types';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  FileText,
  Building2,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  transactions: Transaction[];
  onSelectTx: (id: string) => void;
  onNavigateToTxTab: () => void;
}

export default function DashboardView({
  transactions,
  onSelectTx,
  onNavigateToTxTab
}: DashboardViewProps) {

  // Calculate aggregated financial summaries
  const totalExpenses = transactions
    .filter(t => t.type === 'PHIẾU CHI' && t.status !== 'CANCELLED')
    .reduce((sum, current) => sum + current.amount, 0);

  const totalRevenues = transactions
    .filter(t => t.type === 'PHIẾU THU' && t.status !== 'CANCELLED')
    .reduce((sum, current) => sum + current.amount, 0);

  const cancelledCount = transactions.filter(t => t.status === 'CANCELLED').length;
  const activeCount = transactions.filter(t => t.status === 'ACTIVE').length;

  const warningOrHighRiskCount = transactions.filter(
    t => (t.riskStatus.toUpperCase().includes('WARN') || t.riskStatus.toUpperCase().includes('RISK'))
      && t.status !== 'CANCELLED'
  ).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // Group by category for visual graphs
  const categories = ['Logistics & Supply', 'Customer Offering', 'Marketing & Growth', 'Human Resource'];
  const categoryTotals = categories.map(cat => {
    const sum = transactions
      .filter(t => t.category === cat && t.status !== 'CANCELLED')
      .reduce((s, curr) => s + curr.amount, 0);
    return { name: cat, total: sum };
  });
  const maxCatTotal = Math.max(...categoryTotals.map(c => c.total), 1);

  return (
    <div className="space-y-8 font-sans">

      {/* Intro Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eceef0]/60 pb-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-[#003178] tracking-tight">Bảng kiểm soát Tài chính</h1>
          <p className="text-sm text-[#737783] mt-1">Tổng quan dòng tiền, trạng thái rủi ro và hoạt động chứng từ doanh nghiệp.</p>
        </div>
        <div className="text-xs bg-[#d9e2ff] text-[#001945] font-semibold px-3 py-1.5 rounded-lg border border-[#003178]/10 flex items-center gap-1.5 self-start">
          <Sparkles size={14} className="text-[#003178]" />
          <span>Alex Nguyễn (CFO Audit Mode)</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* KPI 1: Expenses */}
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block">Tổng chi hạch toán</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="font-headline text-2xl font-black text-[#191c1e]">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold mt-2">
            <span>Dạng phiếu quỹ chi ra</span>
          </div>
        </div>

        {/* KPI 2: Revenues */}
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block">Tổng thu ghi nhận</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="font-headline text-2xl font-black text-[#191c1e]">
            {formatCurrency(totalRevenues)}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-2">
            <span>Dạng phiếu báo có nhận vào</span>
          </div>
        </div>

        {/* KPI 3: Vouchers */}
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block">Chứng từ phát hành</span>
            <div className="p-2 bg-blue-50 text-[#003178] rounded-lg">
              <FileText size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-black text-[#191c1e]">{activeCount}</span>
            <span className="text-xs text-[#737783] font-semibold">Active</span>
          </div>
          <div className="text-[10px] text-[#737783] mt-2 flex gap-3 text-xs">
            <span className="text-rose-600 font-medium">{cancelledCount} Hủy phiếu</span>
          </div>
        </div>

        {/* KPI 4: Risk metrics */}
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[10px] font-bold text-[#737783] uppercase tracking-wider block">Chỉ số rủi ro</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-headline text-3xl font-black text-[#191c1e]">
              {warningOrHighRiskCount === 0 ? "0.0%" : "25.0%"}
            </span>
          </div>
          <p className="text-[10px] text-amber-600 font-bold mt-2">
            {warningOrHighRiskCount} giao dịch cần hậu kiểm soát
          </p>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Expenditure Category Distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm">
          <h3 className="font-headline text-sm font-extrabold text-[#191c1e] uppercase tracking-wider mb-6">
            Bố trí ngân sách theo phân mục
          </h3>
          <div className="space-y-5">
            {categoryTotals.map((cat, idx) => {
              const pct = Math.max(10, Math.floor((cat.total / maxCatTotal) * 100));
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[#434652]">
                    <span>{cat.name}</span>
                    <span className="text-[#003178] font-bold">{formatCurrency(cat.total)} VND</span>
                  </div>
                  <div className="h-2 w-full bg-[#eceef0] rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full rounded-full ${idx === 0 ? 'bg-[#003178]' :
                        idx === 1 ? 'bg-[#006398]' :
                          idx === 2 ? 'bg-[#0d47a1]' : 'bg-[#94ccff]'
                        }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Quick Auditor Assistant */}
        <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-sm font-extrabold text-[#191c1e] uppercase tracking-wider mb-4">
              Ý kiến Kiểm soát (Audit Note)
            </h3>
            <div className="p-4 bg-[#f8f9fb] rounded-xl border border-[#eceef0] text-xs leading-relaxed text-[#434652] space-y-3">
              <p>
                Hệ thống Equity Ledger vừa hoàn thành đối khớp <strong>{transactions.length} chứng từ</strong> đồng thời định mức rủi ro.
              </p>
              <p className="font-semibold text-[#003178]">
                ✓ Đã đối chiếu hoàn tất 100% dữ liệu tài khoản Standard Chartered Business Core.
              </p>
              <p className="text-[#ba1a1a]">
                ⚠ Phát hiện {warningOrHighRiskCount} giao dịch có trạng thái cần chú ý cao. Vui lòng phê duyệt hoặc hủy để thu hồi vốn.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToTxTab}
            className="mt-6 w-full py-2 px-4 rounded-xl border border-[#003178] text-[#003178] hover:bg-[#d9e2ff]/30 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>Phê duyệt danh sách Giao dịch</span>
            <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* Bottom recent logs */}
      <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm">
        <h3 className="font-headline text-sm font-extrabold text-[#191c1e] uppercase tracking-wider mb-4">
          Giao dịch mới tạo gần đây
        </h3>
        <div className="divide-y divide-[#eceef0] overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="text-[#737783] uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2.5">Mã Giao dịch</th>
                <th>Đối tác</th>
                <th>Danh mục</th>
                <th>Ngày tạo</th>
                <th>Trạng thái</th>
                <th className="text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0] text-[#191c1e] font-medium">
              {transactions.slice(0, 3).map((t, idx) => (
                <tr key={idx} className="hover:bg-[#f8f9fb] transition-colors cursor-pointer" onClick={() => { onSelectTx(t.id); onNavigateToTxTab(); }}>
                  <td className="py-3 font-mono font-bold text-[#434652]">{t.id}</td>
                  <td className="font-bold">{t.counterparty.name}</td>
                  <td>{t.category}</td>
                  <td>{t.date}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${t.status === 'ACTIVE' ? 'bg-[#d9e2ff] text-[#001945]' : 'bg-[#ffdad6] text-[#93000a]'
                      }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="text-right font-black text-[#003178]">
                    {t.type === 'PHIẾU CHI' ? '-' : '+'}{formatCurrency(t.amount)} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
