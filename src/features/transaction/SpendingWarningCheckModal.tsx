/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppDispatch';
import transactionService from '../../services/transactionService';
import type { SpendingWarning } from './apiTypes';

interface SpendingWarningCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SpendingWarningCheckModal({
  isOpen,
  onClose,
}: SpendingWarningCheckModalProps) {
  const categories = useAppSelector((state) => state.category.items);
  // Only show EXPENSE categories for spending check
  const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [warning, setWarning] = useState<SpendingWarning | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-select first category when modal opens
  useEffect(() => {
    if (isOpen && expenseCategories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(expenseCategories[0].id ?? null);
    }
    if (!isOpen) {
      setWarning(null);
      setError(null);
      setSelectedCategoryId(null);
    }
  }, [isOpen, expenseCategories]);

  const handleCheck = useCallback(async () => {
    if (!selectedCategoryId) return;
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const result = await transactionService.getWarningByCategory(selectedCategoryId);
      setWarning(result);
    } catch (err: any) {
      setError(err?.message || 'Không thể kiểm tra cảnh báo. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  // Auto check when category changes
  useEffect(() => {
    if (selectedCategoryId && isOpen) {
      handleCheck();
    }
  }, [selectedCategoryId]);

  if (!isOpen) return null;

  const isCritical = warning?.level === 'CRITICAL';
  const isWarning = warning?.level === 'WARNING';
  const isNormal = warning && !warning.hasWarning;

  const progressPercent = warning?.historicalAverage && warning?.currentMonthTotal
    ? Math.min((warning.currentMonthTotal / (warning.historicalAverage * 1.6)) * 100, 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0" />

      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-lg animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-base font-headline">
                Kiểm tra cảnh báo chi tiêu
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân tích chi tiêu so với trung bình lịch sử 3 tháng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Category selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Chọn danh mục chi tiêu
            </label>
            <div className="relative">
              <select
                value={selectedCategoryId ?? ''}
                onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold text-slate-800 appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="">-- Chọn danh mục --</option>
                {expenseCategories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-primary animate-spin" />
              <span className="text-sm font-medium">Đang phân tích...</span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Result: Normal */}
          {!loading && isNormal && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-extrabold text-emerald-800 text-sm">
                  Chi tiêu bình thường ✅
                </span>
                <span className="ml-auto text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  NORMAL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/80 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Tháng này</p>
                  <p className="font-black text-emerald-700 tabular-nums">
                    {warning?.currentMonthTotal?.toLocaleString('vi-VN') ?? '—'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Trung bình lịch sử</p>
                  <p className="font-black text-slate-700 tabular-nums">
                    {warning?.historicalAverage?.toLocaleString('vi-VN') ?? '—'}
                  </p>
                </div>
              </div>
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                  <span>Mức sử dụng so với ngưỡng</span>
                  <span className="text-emerald-700">
                    {warning?.overagePercent != null
                      ? `${warning.overagePercent > 0 ? '+' : ''}${warning.overagePercent.toFixed(1)}%`
                      : ''}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">{warning?.message}</p>
            </div>
          )}

          {/* Result: Warning or Critical */}
          {!loading && warning?.hasWarning && (
            <div className={`border rounded-xl p-5 space-y-4 ${isCritical ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
              {/* Header */}
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`} />
                <span className={`font-extrabold text-sm ${isCritical ? 'text-rose-800' : 'text-amber-800'}`}>
                  {isCritical ? '🔴 Chi tiêu bất thường nghiêm trọng!' : '🟡 Chi tiêu vượt mức cảnh báo'}
                </span>
                <span className={`ml-auto text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                  {warning.level}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`rounded-lg p-3 text-center ${isCritical ? 'bg-rose-100/70' : 'bg-amber-100/70'}`}>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Tháng này</p>
                  <p className={`font-black text-sm tabular-nums ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                    {warning.currentMonthTotal?.toLocaleString('vi-VN') ?? '—'}
                  </p>
                </div>
                <div className="bg-white/80 rounded-lg p-3 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">TB lịch sử</p>
                  <p className="font-black text-sm tabular-nums text-slate-700">
                    {warning.historicalAverage?.toLocaleString('vi-VN') ?? '—'}
                  </p>
                </div>
                <div className={`rounded-lg p-3 text-center ${isCritical ? 'bg-rose-100/70' : 'bg-amber-100/70'}`}>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Vượt mức</p>
                  <div className={`flex items-center justify-center gap-0.5 font-black text-sm ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{warning.overagePercent?.toFixed(1) ?? '—'}%</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1.5">
                  <span>Mức chi tiêu so với ngưỡng cảnh báo</span>
                  <span className={isCritical ? 'text-rose-700' : 'text-amber-700'}>
                    +{warning.overagePercent?.toFixed(1)}% vượt mức
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px] text-slate-400">0</span>
                  <span className={`text-[9px] font-bold ${isCritical ? 'text-rose-500' : 'text-amber-500'}`}>
                    ⚠ Ngưỡng cảnh báo
                  </span>
                  <span className="text-[9px] text-slate-400">Max</span>
                </div>
              </div>

              {/* Message */}
              <p className={`text-xs leading-relaxed ${isCritical ? 'text-rose-700' : 'text-amber-700'}`}>
                {warning.message}
              </p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !warning && !error && (
            <div className="flex flex-col items-center py-8 text-center text-slate-400 gap-2">
              <Bell className="h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium">Chọn danh mục để phân tích chi tiêu</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3 justify-end border-t border-slate-100 pt-4">
          <button
            onClick={handleCheck}
            disabled={!selectedCategoryId || loading}
            className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            Phân tích lại
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
