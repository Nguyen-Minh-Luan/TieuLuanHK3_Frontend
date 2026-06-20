import React from 'react';
import { X, Calendar, ClipboardList, ShieldAlert, Coins, Tag, RefreshCw } from 'lucide-react';
import type { Debt, DebtStatus } from './types';

interface DebtDetailsModalProps {
  debt: Debt | null;
  onClose: () => void;
  onMarkAsPaid: (id: string) => void;
}

export default function DebtDetailsModal({ debt, onClose, onMarkAsPaid }: DebtDetailsModalProps) {
  if (!debt) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
  };

  const getStatusLabelAndColor = (status: DebtStatus) => {
    switch (status) {
      case 'Critical':
        return { label: 'CRITICAL (Báo Động Đỏ)', color: 'text-[#ef4444] bg-[#fef2f2] border-[#fca5a5]' };
      case 'Warning':
        return { label: 'WARNING (Chờ xử lý)', color: 'text-[#f59e0b] bg-[#fffbeb] border-[#fde68a]' };
      case 'Fine':
        return { label: 'FINE (Ổn định)', color: 'text-[#3b82f6] bg-[#eff6ff] border-[#bfdbfe]' };
      case 'Paid':
        return { label: 'PAID (Đã hoàn tất)', color: 'text-[#10b981] bg-[#ecfdf5] border-[#a7f3d0]' };
    }
  };

  const { label: statusLabel, color: statusColorClass } = getStatusLabelAndColor(debt.status);

  return (
    <div id="details-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm select-none font-sans">
      <div id="details-modal-card" className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-neutral-100 relative">
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
          <div className="w-2.5 h-10 bg-[#003178] rounded-full" />
          <div>
            <span className="text-[10px] font-mono tracking-widest text-[#64748b] uppercase">CHI TIẾT PHIẾU CÔNG NỢ</span>
            <h3 className="text-xl font-display font-extrabold text-[#003178]">{debt.creditor}</h3>
          </div>
        </div>

        {/* Details Grid list */}
        <div className="space-y-4 text-sm font-medium text-neutral-800">

          {/* Reference and Amount main indicator */}
          <div className="p-4 bg-neutral-50/70 rounded-xl border border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 block uppercase">MÃ SỐ THAM CHIẾU</span>
              <span className="font-mono text-sm font-bold text-neutral-800">{debt.referenceCode}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-sans text-neutral-400 block uppercase font-bold">TỔNG SỐ TIỀN</span>
              <span className="font-display text-base font-extrabold text-[#003178]">{formatVND(debt.amount)}</span>
            </div>
          </div>

          {/* Details metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 border border-neutral-100 rounded-xl">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Ngày ghi sổ</span>
              </div>
              <p className="text-sm font-bold text-neutral-800 ml-6">{debt.dateCreated}</p>
            </div>

            <div className="p-3 border border-neutral-100 rounded-xl">
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Hạn thanh toán</span>
              </div>
              <p className="text-sm font-bold text-[#d91c1c] ml-6">{debt.dueDate}</p>
            </div>
          </div>

          {/* Status Display Area */}
          <div className={`p-3 border rounded-xl flex items-center justify-between ${statusColorClass}`}>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Trạng thái rủi ro</span>
            </div>
            <span className="text-xs font-bold">{statusLabel}</span>
          </div>

          {/* Description Hạng mục */}
          {debt.description && (
            <div className="p-3 border border-neutral-100 rounded-xl">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <ClipboardList className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Nội dung hợp đồng / Hạng mục</span>
              </div>
              <p className="text-xs font-semibold text-neutral-700 leading-relaxed ml-6 mt-1">
                {debt.description}
              </p>
            </div>
          )}

          {/* Ghi chú nội bộ */}
          {debt.notes && (
            <div className="p-3 border border-neutral-100 rounded-xl bg-slate-50/45">
              <div className="flex items-center gap-2 text-neutral-500 mb-1">
                <Tag className="w-4 h-4 text-neutral-400" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Ghi chú nội bộ điều hành</span>
              </div>
              <p className="text-xs font-semibold text-[#475569] italic ml-6 mt-1">
                "{debt.notes}"
              </p>
            </div>
          )}
        </div>

        {/* Footer Area with direct pay action */}
        <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#94a3b8] font-mono">ID: {debt.id}</span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-[#f1f5f9] hover:bg-neutral-200 text-[#475569] rounded-xl transition-all cursor-pointer"
            >
              Đóng lại
            </button>
            {debt.status !== 'Paid' && (
              <button
                onClick={() => {
                  onMarkAsPaid(debt.id);
                  onClose();
                }}
                className="px-5 py-2 text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-white rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Ghi nhận thanh toán
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
