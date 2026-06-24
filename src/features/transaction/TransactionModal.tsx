/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Save
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import type { Transaction } from './types';
import type { TransactionRequest } from './apiTypes';
import apiClient from '../../services/apiClient';
import { fetchFunds } from '../../store/slices/fundSlice';
import { fetchCategories } from '../../store/slices/categorySlice';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: TransactionRequest) => Promise<void> | void;
  editingTransaction: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
}: TransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [fundId, setFundId] = useState<number | null>(null);
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');

  // Fetch partners list dynamically from backend
  const [partners, setPartners] = useState<{ id: number; name: string }[]>([]);

  const userId = useAppSelector((state) => state.auth.id) || Number(localStorage.getItem("userId")) || 1;
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.category.items);
  const funds = useAppSelector((state) => state.fund.items);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchFunds());
      dispatch(fetchCategories());
      apiClient.get("/partners?size=100")
        .then((res) => setPartners(res.data.data.content || []))
        .catch((err) => console.error("Error loading partners", err));
    }
  }, [isOpen, dispatch]);

  // Initializer and reset logic
  useEffect(() => {
    setFormError(null);
    setSubmitting(false);
    if (editingTransaction && isOpen) {
      const ext = editingTransaction as any;
      setAmount(Math.abs(editingTransaction.amount).toString());
      setType(editingTransaction.amount >= 0 ? 'income' : 'expense');
      setCategoryId(ext.categoryId || null);
      setFundId(ext.fundId || null);
      setPartnerId(ext.partnerId || null);
      setNote(ext.rawNote || '');
      
      const d = ext.rawDate ? new Date(ext.rawDate) : new Date();
      if (!isNaN(d.getTime())) {
        setDate(d.toISOString().split('T')[0]);
        setTime(d.toTimeString().split(' ')[0].substring(0, 5));
      }
    } else if (isOpen) {
      setAmount('');
      setType('expense');
      setCategoryId(null);
      setFundId(null);
      setPartnerId(null);
      setNote('');

      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    }
  }, [editingTransaction, isOpen]);

  // Filter categories by type matching current selection (INCOME/EXPENSE)
  const filteredCategories = useMemo(() => {
    const typeUpper = type.toUpperCase();
    return categories.filter((c: { id: number; name: string; type?: string }) => c.type === typeUpper);
  }, [categories, type]);

  useEffect(() => {
    if (isOpen && !editingTransaction && filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, isOpen, editingTransaction, categoryId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fundId || !categoryId || !amount || isNaN(parseFloat(amount))) {
      setFormError('Vui lòng chọn nguồn tiền, danh mục và điền số tiền hợp lệ!');
      return;
    }

    let isoDate = new Date().toISOString();
    if (date) {
      const timePart = time || "00:00";
      const combined = new Date(`${date}T${timePart}:00`);
      if (!isNaN(combined.getTime())) {
        isoDate = combined.toISOString();
      }
    }

    const payload: TransactionRequest = {
      fundId: Number(fundId),
      categoryId: Number(categoryId),
      partnerId: partnerId ? Number(partnerId) : undefined,
      userId,
      type: type === 'income' ? 'INCOME' : 'EXPENSE',
      amount: parseFloat(amount),
      note: note.trim() || undefined,
      transactionDate: isoDate,
      debtId: (editingTransaction as any)?.debtId || undefined,
    };

    try {
      setSubmitting(true);
      setFormError(null);
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || err || 'Lưu giao dịch thất bại!');
    } finally {
      setSubmitting(false);
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
                    value={fundId || ""}
                    onChange={(e) => setFundId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-[#f4f6f8] hover:bg-[#ebedf1] border border-transparent rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-slate-800 cursor-pointer appearance-none pr-10"
                    required
                  >
                    <option value="">Chọn nguồn tiền</option>
                    {funds.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
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
                    value={categoryId || ""}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-[#f4f6f8] hover:bg-[#ebedf1] border border-transparent rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-slate-800 cursor-pointer appearance-none pr-10"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {filteredCategories.map((c: { id: number; name: string; type?: string }) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Đối tác / Nhà cung cấp */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Đối tác / Nhà cung cấp
                </label>
                <div className="relative">
                  <select
                    value={partnerId || ""}
                    onChange={(e) => setPartnerId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-[#f4f6f8] hover:bg-[#ebedf1] border border-transparent rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-slate-800 cursor-pointer appearance-none pr-10"
                  >
                    <option value="">Chọn đối tác (Không bắt buộc)</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
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
                  <Calendar className="h-5 w-5 text-slate-400 mr-2.5 shrink-0 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent border-none outline-hidden text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-0 p-0 w-1/2 cursor-pointer font-bold"
                    required
                  />
                  <span className="text-slate-300 mx-2 select-none">|</span>
                  <Clock className="h-5 w-5 text-slate-400 mr-2 shrink-0 pointer-events-none" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent border-none outline-hidden text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-0 p-0 w-1/2 cursor-pointer font-bold"
                    required
                  />
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

            {formError && (
              <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-3 flex gap-2 w-full text-xs animate-fade-in items-center">
                <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            {/* Buttons aligned bottom right inside form container */}
            <div className="flex gap-4 items-center justify-end pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="py-3.5 px-6 text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-50 transition-colors hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-3.5 px-8 bg-[#003178] hover:bg-[#002150] disabled:opacity-50 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="h-4.5 w-4.5" />
                {submitting ? 'Đang lưu...' : 'Lưu Giao Dịch'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
