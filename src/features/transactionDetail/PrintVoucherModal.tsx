/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Transaction } from './types';
import { X, Printer, ShieldCheck, Ticket } from 'lucide-react';

interface PrintVoucherModalProps {
  isOpen: boolean;
  transaction: Transaction;
  onClose: () => void;
}

export default function PrintVoucherModal({ isOpen, transaction, onClose }: PrintVoucherModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full p-8 border border-[#eceef0] max-h-[95vh] overflow-y-auto font-sans flex flex-col justify-between">

        {/* Modal Actions Controller */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-[#eceef0] print:hidden">
          <div>
            <h3 className="font-headline text-lg font-extrabold text-[#003178] tracking-tight">Sẳn sàng In chứng từ</h3>
            <p className="text-xs text-[#737783] mt-0.5">Bản dựng xem trước định dạng khổ A4 của phiếu hạch toán nội bộ</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintTrigger}
              className="px-5 py-2 rounded-xl primary-gradient text-white text-xs font-bold shadow hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>In PDF (Ctrl+P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#737783] hover:text-[#003178] hover:bg-[#f2f4f6] rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* PRINT CONTENT AREA: This renders cleanly on screen and occupies of class selectors for standard printer widths */}
        <div
          className="p-8 border border-[#c3c6d4] bg-[#fdfdfd] text-black rounded-lg space-y-6 relative print:border-0 print:p-0"
          id="print-section"
        >
          {/* Approved Watermark stamp */}
          <div className="absolute top-28 right-16 border-4 border-dashed border-emerald-600 text-emerald-600 font-extrabold rounded-xl px-4 py-2 rotate-12 text-center select-none uppercase tracking-widest text-xs opacity-80">
            <p className="text-[10px] m-0">Equity Ledger</p>
            <p className="text-base font-black my-0.5">APPROVED</p>
            <p className="text-[8px] m-0">By CFO: {transaction.creator.name}</p>
          </div>

          {/* Header invoice layout */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-headline text-lg font-black text-[#003178] m-0 tracking-tight uppercase">Equity Ledger Corp</h2>
              <p className="text-[8px] text-[#737783] font-bold tracking-widest uppercase my-0.5">Corporate Accounting &amp; Audit Office</p>
              <p className="text-[9px] text-[#434652] my-0">Số 29, Lê Duẩn, Quận 1, TP. Hồ Chí Minh</p>
              <p className="text-[9px] text-[#434652] my-0">MST: 0102941031</p>
            </div>
            <div className="text-right">
              <h1 className="font-headline text-xl font-extrabold text-black uppercase my-0 tracking-tight">{transaction.type}</h1>
              <p className="text-xs font-mono font-bold text-[#434652] my-1">ID: #{transaction.id}</p>
              <p className="text-[9px] text-[#737783] my-0">Thời gian tạo: {transaction.createdAt}</p>
            </div>
          </div>

          <div className="border-t border-[#c3c6d4] pt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[9px] font-bold text-[#737783] uppercase tracking-wider mb-2">Đơn vị nhận (Đối tác)</p>
              <p className="font-extrabold text-black font-semibold">{transaction.counterparty.name}</p>
              <p className="text-[#434652] mt-0.5">Mã số thuế: {transaction.counterparty.mst}</p>
              <p className="text-[#434652] mt-0.5">Địa chỉ hạch toán: N/A - Toàn quốc</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#737783] uppercase tracking-wider mb-2">Đơn vị thanh toán / Nguồn tiền</p>
              <p className="font-bold text-black">{transaction.sourceOfFunds}</p>
              <p className="text-[#434652] mt-0.5">Thuộc quỹ: {transaction.category}</p>
              <p className="text-[#434652] mt-0.5">Người duyệt: {transaction.creator.name} ({transaction.creator.role})</p>
            </div>
          </div>

          {/* Details table description */}
          <div className="border-t border-b border-[#c3c6d4] py-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#737783] font-bold bg-[#f2f4f6] px-2">
                  <th className="p-2">Danh mục nội dung</th>
                  <th className="p-2">Chứng từ tham chiếu</th>
                  <th className="p-2 text-right">Tổng số tiền hạch toán</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#eceef0]">
                  <td className="p-2 font-semibold">
                    {transaction.notes}
                  </td>
                  <td className="p-2 font-mono text-[11px]">ERP-DOC-{transaction.id.split('-')[1]}</td>
                  <td className="p-2 text-right font-black text-black">
                    {formatCurrency(transaction.amount)} VND
                  </td>
                </tr>
                {/* Total calculations */}
                <tr className="font-extrabold text-sm">
                  <td colSpan={2} className="p-2 text-right">Tổng tiền chuyển khoản thực tế:</td>
                  <td className="p-2 text-right text-base text-[#003178] font-black underline">
                    {formatCurrency(transaction.amount)} VND
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom signatures */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-center text-xs">
            <div>
              <p className="font-bold text-black">Giám đốc Tài chính</p>
              <p className="text-[10px] text-[#737783] italic">(Ký, họ tên, đóng dấu)</p>
              <div className="h-16" />
              <p className="font-bold text-black uppercase">ĐÃ DUYỆT</p>
            </div>
            <div>
              <p className="font-bold text-black">Kế toán trưởng</p>
              <p className="text-[10px] text-[#737783] italic">(Ký, họ tên)</p>
              <div className="h-16" />
              <p className="font-bold text-black">Alex Nguyễn</p>
            </div>
            <div>
              <p className="font-bold text-black">Người lập phiếu</p>
              <p className="text-[10px] text-[#737783] italic">(Ký, họ tên)</p>
              <div className="h-16" />
              <p className="font-bold text-black">{transaction.creator.name}</p>
            </div>
          </div>

          {/* Barcode and notes footer */}
          <div className="border-t border-[#eceef0] pt-4 flex justify-between items-center text-[10px] text-[#737783] uppercase tracking-wider font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              Mã kiểm gốc hợp lệ: EQ-{transaction.id.split('-')[1]}
            </span>
            <div className="text-right">
              <div className="h-5 w-24 bg-black/80 font-mono text-[8px] text-white flex items-center justify-center font-bold tracking-widest leading-none mb-0.5">
                ||||| | ||||| | ||
              </div>
              <span>Trang 1 / 1</span>
            </div>
          </div>

        </div>

        {/* Close warning print footer */}
        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
          <p className="text-[11px] text-[#737783] italic">
            * Nhấn In để xem bản xem trước hệ thống in của trình duyệt.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-[#eceef0] text-[#191c1e] text-xs font-bold hover:bg-[#eceef0] transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
