/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronDown,
  ArrowDown,
  ArrowUp,
  Save,
  TrendingUp,
  AlertTriangle,
  User,
  Link2,
  FileText
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import type { Transaction } from './types';
import type { TransactionRequest, SpendingWarning } from './apiTypes';
import apiClient from '../../services/apiClient';
import transactionService from '../../services/transactionService';
import reconciliationService from '../../services/reconciliationService';
import { fetchFunds } from '../../store/slices/fundSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { toLocalDateInputValue } from '../transactionDetail/mappers';

interface DebtOption {
  id: number;
  title: string;
  partnerName: string;
  remainingAmount: number;
  debtType: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: TransactionRequest, files?: File[], descriptions?: string[]) => Promise<void> | void;
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

  // === MỚI: Chứng từ gốc ===
  const [originalDocuments, setOriginalDocuments] = useState('');
  const [accompaniedBy, setAccompaniedBy] = useState('');
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [documentDescriptions, setDocumentDescriptions] = useState<string[]>([]);

  // === MỚI: Khoản nợ liên kết ===
  const [debtId, setDebtId] = useState<number | null>(null);
  const [debts, setDebts] = useState<DebtOption[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(false);

  // Fetch partners list dynamically from backend
  const [partners, setPartners] = useState<{ id: number; name: string }[]>([]);

  // === Người tạo từ Redux (read-only — BE sẽ ép từ JWT) ===
  const currentUserName = useAppSelector(
    (state) =>
      (state.auth as any).name ||
      (state.auth as any).fullName ||
      (state.auth as any).username ||
      (state.auth as any).email ||
      'Người dùng đang đăng nhập'
  );

  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.category.items);
  const funds = useAppSelector((state) => state.fund.items);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real-time preview warning state
  const [previewWarning, setPreviewWarning] = useState<SpendingWarning | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Lock checking state
  const [isLocked, setIsLocked] = useState(false);
  const [checkingLock, setCheckingLock] = useState(false);
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchFunds({}));
      dispatch(fetchCategories({}));
      apiClient.get("/partners?size=100")
        .then((res) => setPartners(res.data.data.content || []))
        .catch((err) => console.error("Error loading partners", err));
    }
  }, [isOpen, dispatch]);

  // === MỚI: Load danh sách khoản nợ theo type ===
  useEffect(() => {
    if (!isOpen) return;
    // Chỉ load nếu đang TẠO MỚI (không phải sửa) — khi sửa, debtId đã gắn sẵn
    if (editingTransaction) return;

    const debtType = type === 'income' ? 'RECEIVABLE' : 'PAYABLE';
    setLoadingDebts(true);
    setDebtId(null); // reset khi đổi type
    apiClient
      .get(`/debts?debtType=${debtType}&isPaid=false&size=100`)
      .then((res) => {
        const items = res.data.data?.content || res.data.data || [];
        setDebts(
          items.map((d: any) => ({
            id: d.id,
            title: d.title || d.note || `Khoản nợ #${d.id}`,
            partnerName: d.partnerName || 'Không rõ đối tác',
            remainingAmount: d.remainingAmount ?? (d.totalAmount - (d.paidAmount || 0)),
            debtType: d.debtType,
          }))
        );
      })
      .catch(() => setDebts([]))
      .finally(() => setLoadingDebts(false));
  }, [isOpen, type, editingTransaction]);

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
      // === MỚI: nạp lại chứng từ gốc khi edit ===
      setOriginalDocuments(ext.originalDocuments || '');
      setAccompaniedBy(ext.accompaniedBy || '');
      // debtId khi edit giữ nguyên (không cho đổi nợ đã gắn)
      setDebtId(ext.debtId || null);
      
      const d = ext.rawDate ? new Date(ext.rawDate) : new Date();
      if (!isNaN(d.getTime())) {
        setDate(toLocalDateInputValue(d));
        setTime(d.toTimeString().split(' ')[0].substring(0, 5));
      }
    } else if (isOpen) {
      setAmount('');
      setType('expense');
      setCategoryId(null);
      setFundId(null);
      setPartnerId(null);
      setNote('');
      setOriginalDocuments('');
      setAccompaniedBy('');
      setDebtId(null);
      setDocumentFiles([]);
      setDocumentDescriptions([]);

      const now = new Date();
      setDate(toLocalDateInputValue(now));
      setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    }
  }, [editingTransaction, isOpen]);

  // Filter categories by type matching current selection (INCOME/EXPENSE)
  const filteredCategories = useMemo(() => {
    const typeUpper = type.toUpperCase();
    return categories.filter((c: any) => c.type === typeUpper);
  }, [categories, type]);

  useEffect(() => {
    if (isOpen && !editingTransaction && filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id ?? null);
    }
  }, [filteredCategories, isOpen, editingTransaction, categoryId]);

  // Debounced preview warning fetch for EXPENSE type
  const fetchPreviewWarning = useCallback(async (catId: number, amt: number) => {
    if (!catId || !amt || amt <= 0) { setPreviewWarning(null); return; }
    setPreviewLoading(true);
    try {
      const result = await transactionService.getWarningByCategory(catId, amt);
      setPreviewWarning(result);
    } catch {
      setPreviewWarning(null);
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    if (type !== 'expense' || !categoryId) {
      setPreviewWarning(null);
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setPreviewWarning(null);
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPreviewWarning(categoryId, parsedAmount);
    }, 600);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [type, categoryId, amount, fetchPreviewWarning]);

  // Check lock status when fundId or date changes
  useEffect(() => {
    if (!fundId || !date) {
      setIsLocked(false);
      return;
    }
    const checkLockStatus = async () => {
      setCheckingLock(true);
      try {
        const locked = await reconciliationService.checkLock(fundId, date);
        setIsLocked(locked);
      } catch (error) {
        console.error("Failed to check lock status", error);
      } finally {
        setCheckingLock(false);
      }
    };
    checkLockStatus();
  }, [fundId, date]);

  // Clear preview when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPreviewWarning(null);
      setPreviewLoading(false);
    }
  }, [isOpen]);

  // === MỚI: Khi chọn khoản nợ, auto-fill amount và partnerId ===
  const handleDebtSelect = (selectedDebtId: number | null) => {
    setDebtId(selectedDebtId);
    if (!selectedDebtId) return;
    const selected = debts.find((d) => d.id === selectedDebtId);
    if (selected) {
      // Gợi ý điền số tiền = phần còn nợ
      if (selected.remainingAmount > 0) {
        setAmount(selected.remainingAmount.toString());
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setFormError('Ngày giao dịch này thuộc kỳ kiểm kê đã chốt, không thể thực hiện giao dịch!');
      return;
    }
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
      // userId KHÔNG gửi lên — BE sẽ luôn lấy từ JWT để đảm bảo bảo mật
      type: type === 'income' ? 'INCOME' : 'EXPENSE',
      amount: parseFloat(amount),
      note: note.trim() || undefined,
      transactionDate: isoDate,
      debtId: debtId || undefined,
      originalDocuments: originalDocuments.trim() || undefined,
      accompaniedBy: accompaniedBy.trim() || undefined,
    };

    try {
      setSubmitting(true);
      setFormError(null);
      
      // FE validation for files
      if (documentFiles.length > 0) {
        for (let f of documentFiles) {
          if (f.size > 5 * 1024 * 1024) {
            setFormError(`Kích thước file ${f.name} vượt quá 5MB`);
            setSubmitting(false);
            return;
          }
          if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
            setFormError(`File ${f.name} không đúng định dạng (chỉ nhận jpeg, png, webp)`);
            setSubmitting(false);
            return;
          }
        }
      }

      await onSave(payload, documentFiles, documentDescriptions);
      onClose();
    } catch (err: any) {
      setFormError(err?.message || err || 'Lưu giao dịch thất bại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Tìm khoản nợ đang được chọn để hiển thị thông tin
  const selectedDebt = debts.find((d) => d.id === debtId);

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

            {/* === MỚI: Người tạo phiếu (read-only) === */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 select-none">
              <div className="w-8 h-8 rounded-full bg-[#003178]/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-[#003178]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Người tạo phiếu</p>
                <p className="text-sm font-bold text-slate-800">{currentUserName}</p>
              </div>
              <span className="ml-auto text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Xác thực JWT
              </span>
            </div>

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
                    {filteredCategories.map((c: any) => (
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

            {/* === MỚI: Liên kết khoản nợ === */}
            {!editingTransaction && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-slate-500" />
                  <label className="text-sm font-bold text-slate-800 font-headline">
                    Liên kết khoản nợ
                    <span className="ml-2 text-[10px] font-semibold text-slate-400 normal-case">(Không bắt buộc)</span>
                  </label>
                </div>
                <div className="relative">
                  <select
                    value={debtId || ""}
                    onChange={(e) => handleDebtSelect(e.target.value ? Number(e.target.value) : null)}
                    disabled={loadingDebts}
                    className="w-full bg-[#f4f6f8] hover:bg-[#ebedf1] disabled:opacity-60 border border-transparent rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all text-slate-800 cursor-pointer appearance-none pr-10"
                  >
                    <option value="">
                      {loadingDebts
                        ? 'Đang tải danh sách khoản nợ...'
                        : `Chọn khoản nợ ${type === 'income' ? 'RECEIVABLE' : 'PAYABLE'} cần thanh toán`}
                    </option>
                    {debts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.partnerName} — {d.title} — Còn nợ:{' '}
                        {d.remainingAmount.toLocaleString('vi-VN')} VNĐ
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                </div>
                {/* Hiển thị thông tin khoản nợ đã chọn */}
                {selectedDebt && (
                  <div className="rounded-xl p-3 bg-blue-50 border border-blue-100 text-blue-800 text-xs flex gap-3 animate-fade-in">
                    <Link2 className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                    <div className="space-y-0.5">
                      <p className="font-bold">{selectedDebt.partnerName} — {selectedDebt.title}</p>
                      <p className="font-semibold">
                        Số tiền còn nợ:{' '}
                        <strong className="text-blue-900">
                          {selectedDebt.remainingAmount.toLocaleString('vi-VN')} VNĐ
                        </strong>
                        {' '}(đã tự điền vào ô số tiền — bạn có thể điều chỉnh)
                      </p>
                    </div>
                  </div>
                )}
                {!loadingDebts && debts.length === 0 && (
                  <p className="text-xs text-slate-400 font-semibold pl-1">
                    Không có khoản nợ {type === 'income' ? 'phải thu (RECEIVABLE)' : 'phải trả (PAYABLE)'} nào chưa thanh toán.
                  </p>
                )}
              </div>
            )}

            {/* Ghi chú chi tiết */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 block font-headline">
                Ghi chú chi tiết
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập lý do giao dịch hoặc chi tiết hợp đồng liên quan..."
                className="w-full bg-[#f4f6f8] focus:bg-white border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-2xl p-4 text-sm font-semibold focus:outline-hidden transition-all text-slate-800 min-h-[100px] resize-none"
              />
            </div>

            {/* === CHỨNG TỪ GỐC === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <label className="text-sm font-bold text-slate-800 font-headline">
                    Chứng từ gốc (Mã / Chi tiết cũ)
                  </label>
                </div>
                <input
                  type="text"
                  value={originalDocuments}
                  readOnly
                  placeholder="Sẽ được tự động sinh khi có file đính kèm..."
                  className="w-full bg-[#f4f6f8] focus:bg-white border border-transparent rounded-xl py-3.5 px-4 text-sm font-semibold text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Tải lên ảnh chứng từ
                  <span className="ml-2 text-[10px] font-semibold text-slate-400 normal-case">(Tối đa 5MB/ảnh)</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => {
                    if (e.target.files) {
                      const files = Array.from(e.target.files);
                      setDocumentFiles(files);
                      setDocumentDescriptions(files.map(() => ""));
                    }
                  }}
                  className="w-full bg-[#f4f6f8] border border-transparent focus:border-primary rounded-xl py-2 px-3 text-sm font-semibold transition-all text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#003178]/10 file:text-[#003178] hover:file:bg-[#003178]/20"
                />
                {documentFiles.length > 0 && (
                  <p className="text-xs text-[#003178] font-bold mt-1">Đã chọn {documentFiles.length} tệp đính kèm mới.</p>
                )}
                {editingTransaction && (
                  <a
                    href={`/documents?transactionId=${editingTransaction.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#003178] font-semibold hover:underline mt-1"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Xem chứng từ đã đính kèm trước đó →
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div></div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 block font-headline">
                  Kèm theo (số lượng chứng từ)
                </label>
                <input
                  type="text"
                  value={accompaniedBy}
                  onChange={(e) => setAccompaniedBy(e.target.value)}
                  placeholder="Vd: 01 bản hóa đơn..."
                  className="w-full bg-[#f4f6f8] focus:bg-white border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl py-3.5 px-4 text-sm font-semibold focus:outline-hidden transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Real-time Preview Warning Banner */}
            {type === 'expense' && categoryId && parseFloat(amount) > 0 && (
              <div className="w-full">
                {previewLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-primary animate-spin" />
                    <span>Đang phân tích chi tiêu...</span>
                  </div>
                )}
                {!previewLoading && previewWarning && previewWarning.hasWarning && (
                  <div className={`rounded-xl p-3.5 border flex gap-3 animate-fade-in ${
                    previewWarning.level === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${
                      previewWarning.level === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'
                    }`} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs">
                          {previewWarning.level === 'CRITICAL' ? '🔴 Dự báo chi tiêu bất thường nghiêm trọng' : '🟡 Dự báo vượt mức chi tiêu'}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          previewWarning.level === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>{previewWarning.level}</span>
                      </div>
                      <div className="flex gap-4 text-xs font-semibold">
                        <span>TB lịch sử: <strong className="font-black">{previewWarning.historicalAverage?.toLocaleString('vi-VN')}</strong></span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Vượt <strong className="font-black">{previewWarning.overagePercent?.toFixed(1)}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {!previewLoading && previewWarning && !previewWarning.hasWarning && (
                  <div className="rounded-xl p-3 border border-emerald-100 bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2 animate-fade-in">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold">Chi tiêu dự kiến trong mức bình thường ✓</span>
                  </div>
                )}
              </div>
            )}

            {formError && (
              <div className="bg-red-50 text-red-800 border border-red-100 rounded-xl p-3 flex gap-2 w-full text-xs animate-fade-in items-center">
                <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            {/* Lock Warning */}
            {isLocked && !checkingLock && (
              <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-3 flex gap-2 w-full text-xs animate-fade-in items-center">
                <AlertCircle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span className="font-semibold text-red-700">Giao dịch thuộc kỳ kiểm kê đã khóa. Bạn không thể thêm/sửa giao dịch vào thời gian này.</span>
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
                disabled={submitting || isLocked || checkingLock}
                className={`py-3.5 px-8 rounded-xl text-sm font-extrabold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer ${
                  isLocked ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" : "bg-[#003178] hover:bg-[#002150] text-white"
                }`}
              >
                {checkingLock ? <AlertCircle className="h-4.5 w-4.5 animate-pulse" /> : <Save className="h-4.5 w-4.5" />}
                {submitting ? 'Đang lưu...' : checkingLock ? 'Đang kiểm tra...' : 'Lưu Giao Dịch'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
