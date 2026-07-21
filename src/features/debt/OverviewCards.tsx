import type { DebtSummary } from './apiTypes';
import { formatVND } from '../../utils/formatCurrency';

interface OverviewCardsProps {
  summary: DebtSummary | null;
}



export default function OverviewCards({ summary }: OverviewCardsProps) {
  return (
    <div id="overview-cards-row" className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans select-none">
      {/* CARD 1: TỔNG NỢ PHẢI THU */}
      <div id="card-total-receivable" className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,31,120,0.02)] transition-transform hover:translate-y-[-2px] duration-200">
        <p className="text-[10px] font-mono font-semibold text-[#64748b] tracking-wider uppercase mb-2">
          TỔNG NỢ PHẢI THU (còn lại)
        </p>
        {summary == null ? (
          <div className="h-8 w-40 bg-[#f1f5f9] rounded animate-pulse" />
        ) : (
          <p id="total-receivable-value" className="text-2xl font-display font-extrabold text-[#003178] tracking-tight">
            {formatVND(summary.totalRemainingReceivable)}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs font-semibold text-[#10b981] bg-[#e6fbf3] px-2 py-0.5 rounded-md">
            ↗ Phải thu
          </span>
          <span className="text-[11px] text-[#64748b] font-medium">từ khách hàng / đối tác</span>
        </div>
      </div>

      {/* CARD 2: TỔNG NỢ PHẢI CHI */}
      <div id="card-total-payable" className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,31,120,0.02)] transition-transform hover:translate-y-[-2px] duration-200">
        <p className="text-[10px] font-mono font-semibold text-[#64748b] tracking-wider uppercase mb-2">
          TỔNG NỢ PHẢI CHI (còn lại)
        </p>
        {summary == null ? (
          <div className="h-8 w-40 bg-[#f1f5f9] rounded animate-pulse" />
        ) : (
          <p id="total-payable-value" className="text-2xl font-display font-extrabold text-[#d91c1c] tracking-tight">
            {formatVND(summary.totalRemainingPayable)}
          </p>
        )}
        <p className="text-xs font-medium text-[#d91c1c] mt-3 bg-[#fdf2f2] px-2.5 py-1 rounded-md inline-block">
          {summary == null ? '...' : 'Cần thanh toán cho nhà cung cấp'}
        </p>
      </div>
    </div>
  );
}
