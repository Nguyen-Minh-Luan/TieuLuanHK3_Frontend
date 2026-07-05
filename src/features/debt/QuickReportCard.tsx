import { TrendingDown } from 'lucide-react';
import type { DebtDTO } from './apiTypes';

interface QuickReportCardProps {
  debts: DebtDTO[];
}

export default function QuickReportCard({ debts }: QuickReportCardProps) {
  // Constant corporate capital benchmark
  const corporateEquityCapital = 5000000000; // 5 Billion VND

  // Calc unpaid debt sum
  const totalUnpaid = debts
    .filter(d => !d.isPaid)
    .reduce((sum, d) => sum + (d.remainingAmount ?? d.totalAmount), 0);

  // Debt-to-Equity ratio (Tỷ lệ nợ/Vốn)
  const ratio = Number((totalUnpaid / corporateEquityCapital).toFixed(2));

  // Determine risk level based on rating
  let riskLevel = 'Thấp';
  let riskColor = 'text-[#10b981] bg-[#e6fbf3]';
  if (ratio > 0.65) {
    riskLevel = 'Cao';
    riskColor = 'text-[#ef4444] bg-[#fef2f2]';
  } else if (ratio > 0.45) {
    riskLevel = 'Trung bình';
    riskColor = 'text-[#f59e0b] bg-[#fffbeb]';
  } else if (ratio === 0) {
    riskLevel = 'Cực kỳ an toàn';
    riskColor = 'text-[#10b981] bg-[#e6fbf3]';
  }

  return (
    <div id="quick-report-widget" className="bg-[#f1f5f9]/70 rounded-2xl p-6 flex flex-col justify-between font-sans select-none border border-[#e2e8f0]/40 shadow-[0_4px_20px_rgba(0,31,120,0.01)] h-full">
      <div>
        {/* Widget Title Bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-mono font-bold text-[#64748b] tracking-wider uppercase">
            BÁO CÁO NHANH
          </p>
          <div className="p-1 text-[#0ea5e9] bg-[#e0f2fe] rounded-lg">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic Metric Display */}
        <div className="flex items-baseline justify-between mt-2">
          <span className="text-xs font-semibold text-[#475569]">
            Tỷ lệ nợ/Vốn
          </span>
          <span id="quick-ratio-value" className="text-2xl font-display font-extrabold text-[#0f172a]">
            {ratio}
          </span>
        </div>

        {/* Visual Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-[#e2e8f0] h-2 rounded-full overflow-hidden">
            <div
              id="ratio-gauge"
              className={`h-full rounded-full transition-all duration-500 ${
                ratio > 0.65 ? 'bg-[#ef4444]' : ratio > 0.45 ? 'bg-[#f59e0b]' : 'bg-[#0ea5e9]'
              }`}
              style={{ width: `${Math.min(100, ratio * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Risk Badge label */}
      <div className="mt-6 pt-3 border-t border-[#e2e8f0]/60 flex items-center justify-between">
        <span className="text-[10px] text-[#94a3b8] font-semibold">
          Chỉ số rủi ro đòn bẩy
        </span>
        <span id="risk-badge" className={`text-[10px] font-extrabold rounded-md px-2 py-0.5 uppercase tracking-wide ${riskColor}`}>
          Mức độ rủi ro: {riskLevel}
        </span>
      </div>
    </div>
  );
}
