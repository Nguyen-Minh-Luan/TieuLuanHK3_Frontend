/**
 * DebtPaymentsList.tsx
 *
 * Component dùng chung để hiển thị danh sách giao dịch thanh toán của 1 khoản nợ.
 * Được sử dụng trong:
 *   - DebtTable (inline sub-row dropdown)
 *   - DebtDetailsModal (phần lịch sử thanh toán)
 *
 * Nhận props thay vì đọc Redux trực tiếp → dễ test & tái sử dụng.
 */

import { Loader2, AlertCircle, ReceiptText, RefreshCw } from 'lucide-react';
import type { TransactionResponse } from '../transaction/apiTypes';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatVND = (num?: number) => {
  if (num == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const typeLabel = (type: string) => {
  switch (type) {
    case 'INCOME_DEBT':  return { label: 'Thu nợ',   color: '#166534', bg: '#f0fdf4' };
    case 'EXPENSE_DEBT': return { label: 'Chi trả',  color: '#c2410c', bg: '#fff7ed' };
    case 'INCOME':       return { label: 'Thu',       color: '#166534', bg: '#f0fdf4' };
    case 'EXPENSE':      return { label: 'Chi',       color: '#c2410c', bg: '#fff7ed' };
    default:             return { label: type,         color: '#475569', bg: '#f1f5f9' };
  }
};

// ─── Props ────────────────────────────────────────────────────────────────────

export type PaymentsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface DebtPaymentsListProps {
  payments: TransactionResponse[];
  status: PaymentsStatus;
  error?: string;
  /** Hiển thị bảng compact (inline dropdown) hay full (modal) */
  compact?: boolean;
  onRetry?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DebtPaymentsList({
  payments,
  status,
  error,
  compact = false,
  onRetry,
}: DebtPaymentsListProps) {
  // ── Loading ──────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 py-3 px-1 text-[#64748b]">
        <Loader2 className="w-4 h-4 animate-spin text-[#003178]" />
        <span className="text-xs font-medium">Đang tải giao dịch...</span>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-2 py-3 px-1 text-[#ef4444]">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-medium">{error ?? 'Không thể tải lịch sử thanh toán.'}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            title="Thử lại"
            className="ml-1 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#fee2e2] hover:bg-[#fecaca] text-[#b91c1c] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Thử lại
          </button>
        )}
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (status === 'succeeded' && payments.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 px-1 text-[#94a3b8]">
        <ReceiptText className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-medium italic">Chưa có giao dịch thanh toán nào được ghi nhận.</span>
      </div>
    );
  }

  // ── Data ─────────────────────────────────────────────────────────────────────
  if (status === 'succeeded' && payments.length > 0) {
    return (
      <div className={`w-full ${compact ? 'text-[12px]' : 'text-sm'}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-[10px] font-mono tracking-widest text-[#94a3b8] uppercase">
              <th className="py-1.5 pr-4 text-left font-semibold">Ngày GD</th>
              <th className="py-1.5 pr-4 text-left font-semibold">Mã phiếu</th>
              <th className="py-1.5 pr-4 text-left font-semibold">Loại</th>
              <th className="py-1.5 pr-4 text-right font-semibold">Số tiền</th>
              {!compact && <th className="py-1.5 text-left font-semibold">Ghi chú</th>}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const { label, color, bg } = typeLabel(p.type);
              return (
                <tr
                  key={p.id}
                  className="border-t border-[#f1f5f9] hover:bg-[#f8faff]/60 transition-colors"
                >
                  <td className="py-2 pr-4 font-medium text-[#64748b]">{formatDate(p.transactionDate)}</td>
                  <td className="py-2 pr-4 font-mono text-[#475569]">{p.transactionCode}</td>
                  <td className="py-2 pr-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{ color, background: bg }}
                    >
                      {label}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-right font-extrabold text-[#003178]">{formatVND(p.amount)}</td>
                  {!compact && (
                    <td className="py-2 text-[#94a3b8] italic truncate max-w-[160px]">{p.note ?? '—'}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // idle / unknown — render nothing (caller should not open if idle without dispatching)
  return null;
}
