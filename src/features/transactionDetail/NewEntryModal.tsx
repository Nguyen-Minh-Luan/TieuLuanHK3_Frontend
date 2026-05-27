/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import type { Transaction } from './types';
import { X, Plus, Terminal } from 'lucide-react';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newTx: Transaction) => void;
}

export default function NewEntryModal({ isOpen, onClose, onSubmit }: NewEntryModalProps) {
  const [type, setType] = useState<'PHIẾU CHI' | 'PHIẾU THU'>('PHIẾU CHI');
  const [amount, setAmount] = useState<string>('35000.00');
  const [sourceOfFunds, setSourceOfFunds] = useState<string>('Standard Chartered Business Core');
  const [category, setCategory] = useState<string>('Logistics & Supply');
  const [riskStatus, setRiskStatus] = useState<string>('FINE (Ổn định)');
  const [partnerName, setPartnerName] = useState<string>('Vietnam Aviation Petroleum JSC');
  const [mst, setMst] = useState<string>('0100108392');
  const [notes, setNotes] = useState<string>('Thanh toán chi phí nạp nhiên liệu vận tải hàng không định kỳ quý II. Đã xác nhận nghiệm thu kỹ thuật và hóa đơn điện tử.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-generate fresh ID
    const randomId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}-${['X', 'A', 'K', 'W', 'M'][Math.floor(Math.random() * 5)]}`;

    // Auto-generate current Vietnamese timestamps
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} - GMT+7`;

    // Simulated limits array
    const flucts = Array.from({ length: 7 }, () => Math.floor(25 + Math.random() * 75));

    const newTx: Transaction = {
      id: randomId,
      type,
      status: 'ACTIVE',
      riskStatus,
      sourceOfFunds,
      category,
      amount: parseFloat(amount) || 0,
      currency: 'VND',
      limitFluctuations: flucts,
      counterparty: {
        name: partnerName,
        mst,
        logoUrl: undefined // Will fallback to default Building icon cleanly
      },
      creator: {
        name: "Alex Nguyễn",
        role: "Phó phòng Kế toán",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5zZOCmeehm3cNPdj0r6Dj0JczJqKhbTzgvLBozHRPjy44F1XKVgwN0zMEbys_kz7lYtrZpwVAUS-kwmAJaG-wNlc9t1Qw2VhLjR5FdT50hRTrJ0jnS1CXWqNxmaD0gKyLlx06pEEp0dFJ4L4VSjEqXe1CfvbZjBNplhMpZY0qqxD8x1z8gAuXTPuwRyek4qXm0AQBHgelhkw8FHIzVG8GHdIzMjB6WJuXmN0rflBNrsu4DWF5PH2s7Tw5TGVOTJLo2WQfFygWs2a9"
      },
      date: formattedDate,
      createdAt: formattedTime,
      notes
    };

    onSubmit(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 border border-[#eceef0] max-h-[90vh] overflow-y-auto font-sans">

        {/* Header section with Exit trigger */}
        <div className="flex justify-between items-center pb-4 mb-6 border-b border-[#eceef0]">
          <div>
            <h3 className="font-headline text-xl font-extrabold text-[#003178] tracking-tight">Tạo phiếu giao dịch mới</h3>
            <p className="text-xs text-[#737783] mt-0.5">Thêm bản ghi kế toán vào hệ thống Equity Ledger</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#737783] hover:text-[#003178] hover:bg-[#f2f4f6] rounded-xl transition-all cursor-pointer"
            id="btn-close-new-modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Voucher type selection input radio cards */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Loại chứng từ</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('PHIẾU CHI')}
                  className={`py-3.5 px-4 rounded-xl font-bold text-center border text-sm transition-all flex flex-col items-center justify-center cursor-pointer ${type === 'PHIẾU CHI'
                    ? 'border-[#003178] bg-[#d9e2ff]/30 text-[#003178] ring-2 ring-[#003178]/25'
                    : 'border-[#eceef0] text-[#434652] hover:bg-[#f8f9fb]'
                    }`}
                >
                  <span className="text-sm">PHIẾU CHI (Payment)</span>
                  <span className="text-[10px] text-[#737783] mt-0.5 font-normal">Xuất quỹ / Thanh toán</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('PHIẾU THU')}
                  className={`py-3.5 px-4 rounded-xl font-bold text-center border text-sm transition-all flex flex-col items-center justify-center cursor-pointer ${type === 'PHIẾU THU'
                    ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 ring-2 ring-emerald-500/25'
                    : 'border-[#eceef0] text-[#434652] hover:bg-[#f8f9fb]'
                    }`}
                >
                  <span className="text-sm">PHIẾU THU (Receipt)</span>
                  <span className="text-[10px] text-[#737783] mt-0.5 font-normal">Thu quỹ / Báo có</span>
                </button>
              </div>
            </div>

            {/* Financial Value */}
            <div>
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Số tiền giao dịch (VND)</label>
              <input
                type="number"
                step="0.01"
                required
                className="bg-[#f2f4f6] text-[#191c1e] text-sm font-semibold p-3.5 rounded-xl border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178]/40 focus:bg-white outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Source of funds selection box */}
            <div>
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Nguồn tiền tài trợ</label>
              <input
                type="text"
                required
                className="bg-[#f2f4f6] text-[#191c1e] text-sm font-semibold p-3.5 rounded-xl border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178]/40 focus:bg-white outline-none"
                value={sourceOfFunds}
                onChange={(e) => setSourceOfFunds(e.target.value)}
                placeholder="Ex. Vietcombank Corporate"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Danh mục hạch toán</label>
              <select
                className="bg-[#f2f4f6] text-[#191c1e] text-sm font-semibold p-3.5 rounded-xl border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178]/40 focus:bg-white outline-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Logistics & Supply">Logistics & Supply</option>
                <option value="Customer Offering">Customer Offering</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
                <option value="Human Resource">Human Resource</option>
                <option value="Operational Expenses">Operational Expenses</option>
              </select>
            </div>

            {/* Risk profile selection */}
            <div>
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Trạng thái rủi ro ban đầu</label>
              <select
                className="bg-[#f2f4f6] text-[#191c1e] text-sm font-semibold p-3.5 rounded-xl border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178]/40 focus:bg-white outline-none cursor-pointer"
                value={riskStatus}
                onChange={(e) => setRiskStatus(e.target.value)}
              >
                <option value="FINE (Ổn định)">FINE (Ổn định)</option>
                <option value="WARNING (Cảnh báo)">WARNING (Cảnh báo)</option>
                <option value="RISK (Nguy cơ)">RISK (Nguy cơ)</option>
              </select>
            </div>

            {/* Partner Details Grid section */}
            <div className="sm:col-span-2 p-5 bg-[#f8f9fb] rounded-xl border border-[#eceef0] space-y-4">
              <h4 className="text-xs font-bold text-[#003178] uppercase tracking-wider">Thông tin đối tác / Đơn vị thụ hưởng</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-[#737783] uppercase tracking-wider block mb-1">Tên đơn vị</label>
                  <input
                    type="text"
                    required
                    className="bg-white text-[#191c1e] text-xs font-semibold p-2.5 rounded-lg border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178]/40 outline-none"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Tên doanh nghiệp..."
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-[#737783] uppercase tracking-wider block mb-1">Mã số thuế (MST)</label>
                  <input
                    type="text"
                    required
                    className="bg-white text-[#191c1e] text-xs font-semibold p-2.5 rounded-lg border border-[#c3c6d4]/50 w-full focus:ring-2 focus:ring-[#003178]/40 outline-none"
                    value={mst}
                    onChange={(e) => setMst(e.target.value)}
                    placeholder="Mã số thuế doanh nghiệp..."
                  />
                </div>
              </div>
            </div>

            {/* Notes detailed remarks */}
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Ghi chú chi tiết</label>
              <textarea
                required
                className="bg-[#f2f4f6] text-[#191c1e] text-sm p-3.5 rounded-xl border border-[#c3c6d4]/50 w-full min-h-[100px] focus:ring-2 focus:ring-[#003178]/40 focus:bg-white outline-none resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nêu rõ mục đích chi thu, số hợp đồng liên quan..."
              />
            </div>

          </div>

          {/* Action button triggers */}
          <div className="flex gap-4 items-center justify-end pt-4 border-t border-[#eceef0] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-[#eceef0] text-[#434652] font-bold hover:bg-[#f2f4f6] transition-colors cursor-pointer text-sm"
            >
              Hủy bỏ (Cancel)
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl primary-gradient text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-sm"
              id="btn-submit-new-tx"
            >
              <Plus size={16} />
              <span>Thêm giao dịch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
