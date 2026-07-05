import { X, Calendar, ClipboardList, ShieldAlert, Coins, Tag } from 'lucide-react';
import type { DebtDTO } from './apiTypes';
import DebtPaymentsList from './DebtPaymentsList';

interface DebtDetailsModalProps {
  debt: DebtDTO | null;
  onClose: () => void;
  onMarkAsPaid: (id: number) => void;
}

const formatVND = (num?: number) => {
  if (num == null) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
};

const formatDate = (isoDate?: string) => {
  if (!isoDate) return '—';
  const d = new Date(isoDate);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function DebtDetailsModal({ debt, onClose, onMarkAsPaid }: DebtDetailsModalProps) {
  if (!debt) return null;

  return (
    <div id="details-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none font-sans overflow-y-auto">
      <div id="details-modal-card" className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-neutral-100 relative my-8">
        {/* Close Button */}
        <button
          id="btn-details-close"
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 hover:bg-neutral-100 rounded-xl text-neutral-400 hover:text-neutral-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className={`w-2.5 h-10 rounded-full ${debt.debtType === 'RECEIVABLE' ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`} />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#64748b] uppercase">CHI TIẾT PHIẾU CÔNG NỢ</span>
            <h3 className="text-xl font-display font-extrabold text-[#003178]">{debt.title || `Khoản nợ #${debt.id}`}</h3>
          </div>
        </div>

        {/* Details Grid list */}
        <div className="space-y-4 text-sm font-medium text-neutral-800">
          {/* Reference and Amount main indicator */}
          <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">ĐỐI TÁC</span>
              <span className="text-sm font-bold text-neutral-800">{debt.partnerName ?? '—'}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-sans text-neutral-400 block uppercase font-bold">TỔNG SỐ TIỀN</span>
              <span className="font-display text-base font-extrabold text-[#003178]">{formatVND(debt.totalAmount)}</span>
            </div>
          </div>

          {/* Details metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-neutral-100 rounded-xl">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Ngày ghi sổ</span>
              </div>
              <p className="text-sm font-bold text-neutral-800 ml-6">{formatDate(debt.debtDate)}</p>
            </div>

            <div className="p-3 border border-neutral-100 rounded-xl">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Coins className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Phân loại nợ</span>
              </div>
              <p className="text-sm font-bold text-neutral-800 ml-6">
                {debt.debtType === 'RECEIVABLE' ? 'Nợ phải thu' : 'Nợ phải chi'}
              </p>
            </div>
          </div>

          {/* Status Display Area */}
          <div className={`p-3 border rounded-xl flex items-center justify-between ${
            debt.isPaid 
              ? 'text-[#10b981] bg-[#ecfdf5] border-[#a7f3d0]' 
              : 'text-[#f59e0b] bg-[#fffbeb] border-[#fde68a]'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Trạng thái thanh toán</span>
            </div>
            <span className="text-xs font-bold">
              {debt.isPaid ? 'Đã hoàn tất (PAID)' : `Còn lại: ${formatVND(debt.remainingAmount ?? (debt.totalAmount - (debt.paidAmount ?? 0)))}`}
            </span>
          </div>

          {/* Hạng mục danh mục */}
          {debt.categoryName && (
            <div className="p-3 border border-neutral-100 rounded-xl">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Tag className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Danh mục phân loại</span>
              </div>
              <p className="text-sm font-bold text-neutral-800 ml-6">
                {debt.categoryName}
              </p>
            </div>
          )}

          {/* Note ghi chú */}
          {debt.note && (
            <div className="p-3 border border-neutral-100 rounded-xl bg-slate-50/45">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <ClipboardList className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Ghi chú nội bộ</span>
              </div>
              <p className="text-xs font-semibold text-[#475569] italic ml-6 mt-1">
                "{debt.note}"
              </p>
            </div>
          )}

          {/* Lịch sử thanh toán (payments) */}
          <div className="p-3 border border-neutral-100 rounded-xl bg-slate-50/20">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-2">LỊCH SỬ THANH TOÁN (GIAO DỊCH)</span>
            <DebtPaymentsList
              payments={debt.payments ?? []}
              status={debt.payments != null ? 'succeeded' : 'idle'}
            />
          </div>
        </div>

        {/* Footer Area with direct pay action */}
        <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#94a3b8] font-mono">Mã số phiếu: #{debt.id}</span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-[#f1f5f9] hover:bg-neutral-200 text-[#475569] rounded-xl transition-all cursor-pointer"
            >
              Đóng lại
            </button>
            {!debt.isPaid && debt.id != null && (
              <button
                onClick={() => {
                  onMarkAsPaid(debt.id!);
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Ghi nhận đã trả hết
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
