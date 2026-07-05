import { Lightbulb, CheckCircle2 } from 'lucide-react';
import type { DebtDTO } from './apiTypes';

interface OptimizerCardProps {
  debts: DebtDTO[];
}

export default function OptimizerCard({ debts }: OptimizerCardProps) {
  // Find unpaid debts
  const unpaidDebts = debts.filter(d => !d.isPaid);

  // Sort by highest remaining/total amount
  const sortedUnpaid = [...unpaidDebts].sort((a, b) => {
    const amtA = a.remainingAmount ?? a.totalAmount;
    const amtB = b.remainingAmount ?? b.totalAmount;
    return amtB - amtA;
  });

  const priorityDebt = sortedUnpaid[0];

  return (
    <div id="optimizer-widget" className="bg-[#eff6ff] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4.5 border border-[#bfdbfe]/30 font-sans select-none shadow-[0_4px_25px_rgba(37,99,235,0.01)]">
      {/* Dynamic State Icons */}
      {priorityDebt ? (
        <div id="optimizer-icon-bulb" className="p-3 bg-[#003178] text-white rounded-2xl shadow-indigo-100 shadow flex-shrink-0 animate-pulse">
          <Lightbulb className="w-6 h-6" />
        </div>
      ) : (
        <div id="optimizer-icon-checked" className="p-3 bg-[#10b981] text-white rounded-2xl flex-shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      )}

      {/* Advice Content */}
      <div className="flex-1">
        <h4 className="text-sm font-extrabold text-[#003178] font-display">
          Chiến lược thanh toán tối ưu
        </h4>
        <p id="optimizer-advice-text" className="text-xs font-semibold text-[#1e40af] leading-relaxed mt-1">
          {priorityDebt ? (
            <>
              Dựa trên dòng tiền hiện tại, bạn nên ưu tiên cân đối thanh toán khoản nợ{' '}
              <span className="font-mono font-extrabold underline text-[#003178]">
                #{priorityDebt.id}
              </span>{' '}
              ({priorityDebt.title || 'Không có tiêu đề'}) của <span className="font-bold underline">{priorityDebt.partnerName ?? 'Đối tác'}</span>{' '}
              để duy trì uy tín tín dụng và tránh phát sinh lãi phạt quá hạn.
            </>
          ) : (
            <>
              Tuyệt vời! Tất cả các khoản nghĩa vụ nợ hiện tại của doanh nghiệp đều đã được thanh toán hoặc ở ngưỡng an toàn tuyệt đối.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
