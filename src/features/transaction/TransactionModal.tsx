/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  Briefcase,
  ArrowDown,
  ArrowUp,
  Save
} from 'lucide-react';
import type { Transaction } from './types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string }) => void;
  editingTransaction: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction
}: TransactionModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('Procurement');
  const [status, setStatus] = useState<'Completed' | 'Pending' | 'Failed'>('Completed');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [refId, setRefId] = useState('');
  const [icon, setIcon] = useState<Transaction['icon']>('building');

  // Realistic localized states
  const [sourceAccount, setSourceAccount] = useState('Tài khoản chính (VPBank - 88102)');
  const [note, setNote] = useState('');

  // Trigger default initializers and reset
  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description || '');
      const amt = Math.abs(editingTransaction.amount);
      setAmount(amt.toString());
      setType(editingTransaction.amount >= 0 ? 'income' : 'expense');
      setCategory(editingTransaction.category || 'Procurement');
      setStatus(editingTransaction.status || 'Completed');
      setDate(editingTransaction.date || '');
      setTime(editingTransaction.time || '');
      setRefId(editingTransaction.refId || '');
      setIcon(editingTransaction.icon || 'building');
      setNote('');
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setCategory('Procurement');
      setStatus('Completed');
      setNote('');

      const now = new Date();
      // Format Oct 24, 2023 for consistency
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const mName = months[now.getMonth()];
      const dNum = String(now.getDate()).padStart(2, '0');
      const yNum = now.getFullYear();
      setDate(`${mName} ${dNum}, ${yNum}`);

      // Format time e.g., 14:32 PM
      let hours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${String(hours).padStart(2, '0')}:${mins} ${ampm}`);

      // Generate reference ID e.g., REF-92834710-X
      const ranDigits = Math.floor(10000000 + Math.random() * 90000000);
      const ranChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
      setRefId(`REF-${ranDigits}-${ranChar}`);
      setIcon('building');
    }
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || isNaN(parseFloat(amount))) {
      alert('Vui lòng điền mô tả và số tiền hợp lệ!');
      return;
    }

    const numericalAmount = parseFloat(amount) * (type === 'expense' ? -1 : 1);

    // Auto calculate overspending
    let overSpending: 'Critical' | 'Warning' | 'Fine' = 'Fine';
    if (type === 'expense') {
      const mag = Math.abs(numericalAmount);
      if (mag >= 10000) {
        overSpending = 'Critical';
      } else if (mag >= 2000) {
        overSpending = 'Warning';
      }
    }

    onSave({
      ...(editingTransaction ? { id: editingTransaction.id } : {}),
      date,
      time,
      description: description.trim(),
      refId,
      category,
      amount: numericalAmount,
      overSpending,
      status,
      icon
    });
    onClose();
  };

  // Determine icon preference based on category
  const handleCategoryChange = (cat: string) => {
    setCategory(cat);
    if (cat === 'Revenue') {
      setType('income');
      setIcon('payment');
    } else {
      setType('expense');
      if (cat === 'Procurement') setIcon('building');
      else if (cat === 'Maintenance') setIcon('maintenance');
      else if (cat === 'Infrastructure') setIcon('cloud');
      else if (cat === 'HR & Payroll') setIcon('payroll');
      else setIcon('other');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-100/95 p-4 md:p-12 flex justify-center items-start md:items-center">
      {/* Click backdrop to close */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Main Container */}
      <div
        id="transaction-modal-body"
        className="w-full max-w-4xl space-y-6 z-50 transform transition-all duration-300 animate-fade-in relative my-auto py-4"
      >
        {/* Title area matching the screenshot precisely */}
        <div className="space-y-1.5 text-left select-none px-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-headline">
            {editingTransaction ? 'Chỉnh Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
          </h1>
          <p className="text-sm text-slate-500 font-body max-w-2xl leading-relaxed">
            Ghi lại thông tin tài chính chi tiết để duy trì tính minh bạch và độ chính xác của hệ thống Ledger.
          </p>
        </div>

        {/* Form panel card */}
        <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl border border-slate-200/40">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* 2-Column fields grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

              {/* Nguồn tiền */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Nguồn tiền
                </label>
                <div className="relative">
                  <select
                    value={sourceAccount}
                    onChange={(e) => setSourceAccount(e.target.value)}
                    className="w-full bg-[#f4f6f8] hover:bg-[#ebedf1] border border-transparent rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-slate-800 cursor-pointer appearance-none pr-10"
                  >
                    <option value="Tài khoản chính (VPBank - 88102)">Chọn tài khoản nguồn</option>
                    <option value="Tài khoản chính (VPBank - 88102)">Tài khoản chính (VPBank - 88102)</option>
                    <option value="Tài khoản đầu tư (Techcombank)">Tài khoản đầu tư (Techcombank)</option>
                    <option value="Quỹ tiền mặt (Cash Fund)">Quỹ tiền mặt (Cash Fund)</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Danh mục */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800 block font-headline">
                    Danh mục
                  </label>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#e0f2fe] text-[9px] font-extrabold uppercase tracking-wider text-sky-700 rounded-full select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                    ĐANG SOẠN THẢO
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-[#f4f6f8] hover:bg-[#ebedf1] border border-transparent rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-slate-800 cursor-pointer appearance-none pr-10"
                  >
                    <option value="">Chọn danh mục giao dịch</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="HR & Payroll">HR & Payroll</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Đối tác / Nhà cung cấp */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Đối tác / Nhà cung cấp
                </label>
                <div className="relative flex items-center bg-[#f4f6f8] focus-within:bg-white border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-4 py-3.5 transition-all">
                  <Briefcase className="h-5 w-5 text-slate-400 mr-2.5 shrink-0 pointer-events-none" />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Nhập tên đối tác..."
                    className="w-full bg-transparent border-none outline-hidden text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-0 p-0"
                    required
                  />
                </div>
              </div>

              {/* Loại giao dịch */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Loại giao dịch
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[#f4f6f8] p-1 rounded-xl h-[50px] items-center">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`h-full rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${type === 'income'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-200/40'
                      }`}
                  >
                    <ArrowDown className={`h-4 w-4 ${type === 'income' ? 'text-blue-700' : 'text-slate-400'}`} />
                    Phiếu thu
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`h-full rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${type === 'expense'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-slate-500 hover:bg-slate-200/40'
                      }`}
                  >
                    <ArrowUp className={`h-4 w-4 ${type === 'expense' ? 'text-blue-700' : 'text-slate-400'}`} />
                    Phiếu chi
                  </button>
                </div>
              </div>

              {/* Ngày & Giờ giao dịch */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Ngày &amp; Giờ giao dịch
                </label>
                <div className="relative flex items-center bg-[#f4f6f8] focus-within:bg-white border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-4 py-3.5 transition-all">
                  <Calendar className="h-5 w-5 text-slate-400 mr-2 shrink-0 pointer-events-none" />
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="dd/mm/yyyy"
                    className="bg-transparent border-none outline-hidden text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-0 p-0 w-1/2"
                    required
                  />
                  <span className="text-slate-300 mx-2 select-none">|</span>
                  <Clock className="h-5 w-5 text-slate-400 mr-2 shrink-0 pointer-events-none" />
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="--:--"
                    className="bg-transparent border-none outline-hidden text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-0 p-0 w-1/2"
                    required
                  />
                  <Calendar className="h-5 w-5 text-slate-400 ml-2 shrink-0 pointer-events-none" />
                </div>
              </div>

              {/* Số tiền giao dịch */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Số tiền giao dịch
                </label>
                <div className="bg-[#f0f4f9] border border-transparent focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-xl px-4 py-3.5 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-extrabold text-sm tracking-wide shrink-0">VNĐ</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent border-none outline-hidden text-lg font-bold text-slate-900 focus:outline-hidden focus:ring-0 p-0"
                      required
                    />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold mt-1 block select-none">
                  NHẬP GIÁ TRỊ RÒNG TRƯỚC THUẾ
                </span>
              </div>

            </div>

            {/* Ghi chú chi tiết */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block font-headline">
                Ghi chú chi tiết
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lý do giao dịch hoặc chi tiết hợp đồng liên quan..."
                className="w-full bg-[#f4f6f8] focus:bg-white border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl p-4 text-sm font-semibold focus:outline-hidden transition-all text-slate-800 min-h-[120px] resize-none"
              />
            </div>

            {/* Warning banner */}
            {type === 'expense' && parseFloat(amount) >= 10000 && (
              <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-3 flex gap-2 w-full text-xs animate-fade-in">
                <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Mức chi lớn: </span>
                  Khoản chi vượt quá $10,000.00 sẽ tự động gắn nhãn <span className="font-bold uppercase text-red-600">Critical</span> trong hệ thống kiểm tra ngân sách.
                </div>
              </div>
            )}

            {/* Buttons aligned bottom right inside form container */}
            <div className="flex gap-4 items-center justify-end pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-6 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="py-3.5 px-8 bg-[#003178] hover:bg-[#002150] text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="h-4.5 w-4.5" />
                Lưu Giao Dịch
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
