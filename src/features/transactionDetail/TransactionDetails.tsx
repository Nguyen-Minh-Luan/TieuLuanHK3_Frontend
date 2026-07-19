/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Transaction, RelatedDebt } from './types';
import type { SpendingWarning } from '../transaction/apiTypes';
import { useAppSelector } from '../../hooks/useAppDispatch';
import {
  Edit3,
  Printer,
  XSquare,
  ChevronLeft,
  Package,
  Calendar,
  Clock,
  Building,
  User,
  Save,
  X,
  BadgeCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface TransactionDetailsProps {
  transaction: Transaction;
  relatedDebt?: RelatedDebt | null;
  spendingWarning?: SpendingWarning | null;
  onUpdate: (updated: Transaction) => void;
  onCancel: (id: string) => void;
  onPrintClick: () => void;
}

export default function TransactionDetails({
  transaction,
  relatedDebt,
  spendingWarning,
  onUpdate,
  onCancel,
  onPrintClick
}: TransactionDetailsProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Transaction>({ ...transaction });

  const categories = useAppSelector((state) => state.category.items);
  const funds = useAppSelector((state) => state.fund.items);
  const partners = useAppSelector((state) => state.partner.items);

  // Sync state if transaction prop changes
  React.useEffect(() => {
    setEditForm({ ...transaction });
    setIsEditing(false);
  }, [transaction]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ ...editForm });
    setIsEditing(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  const getRiskColorClass = (risk: string) => {
    if (risk.toUpperCase().includes('FINE') || risk.toUpperCase().includes('ỔN ĐỊNH')) {
      return 'text-brand-secondary';
    } else if (risk.toUpperCase().includes('WARN') || risk.toUpperCase().includes('CHÚ Ý')) {
      return 'text-amber-600';
    } else {
      return 'text-rose-600';
    }
  };

  const getRiskBgCircle = (risk: string) => {
    if (risk.toUpperCase().includes('FINE') || risk.toUpperCase().includes('ỔN ĐỊNH')) {
      return 'bg-brand-secondary';
    } else if (risk.toUpperCase().includes('WARN') || risk.toUpperCase().includes('CHÚ Ý')) {
      return 'bg-amber-500';
    } else {
      return 'bg-rose-500';
    }
  };

  return (
    <div className="flex-1 font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate('/transaction')}
        className="flex items-center gap-1.5 text-[#737783] text-xs mb-4 uppercase tracking-widest font-bold hover:text-[#003178] transition-colors cursor-pointer"
      >
        <ChevronLeft size={14} />
        Quay lại danh sách
      </button>

      {/* Main title and high priority status block */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#eceef0] pb-8 mb-8" id="section-detail-header">
        <div>
          <h2 className="font-headline text-3xl lg:text-4xl font-extrabold text-[#003178] tracking-tight">
            Chi tiết Giao dịch
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest shadow-sm transition-all uppercase ${
              transaction.status === 'ACTIVE'
                ? 'bg-[#003178] text-white'
                : transaction.status === 'UPDATED'
                  ? 'bg-amber-500 text-white'
                  : 'bg-[#ffdad6] text-[#93000a]'
              }`}>
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Action button panel */}
        {!isEditing ? (
          <div className="flex flex-wrap gap-3" id="details-action-buttons">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#eceef0] text-[#191c1e] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e0e3e5] transition-colors active:scale-95 cursor-pointer text-sm"
              id="btn-edit-transaction"
            >
              <Edit3 size={16} />
              <span>Chỉnh sửa</span>
            </button>
            <button
              onClick={onPrintClick}
              className="bg-[#eceef0] text-[#191c1e] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e0e3e5] transition-colors active:scale-95 cursor-pointer text-sm"
              id="btn-print-transaction"
            >
              <Printer size={16} />
              <span>In phiếu</span>
            </button>
            {transaction.status === 'ACTIVE' && (
              <button
                onClick={() => onCancel(transaction.id)}
                className="bg-[#ffdad6] text-[#93000a] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer text-sm"
                id="btn-cancel-transaction"
              >
                <XSquare size={16} />
                <span>Hủy giao dịch</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 cursor-pointer text-sm"
              id="btn-save-edit"
            >
              <Save size={16} />
              <span>Lưu thay đổi</span>
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditForm({ ...transaction });
              }}
              className="bg-[#eceef0] text-[#191c1e] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e0e3e5] transition-all active:scale-95 cursor-pointer text-sm"
              id="btn-cancel-edit"
            >
              <X size={16} />
              <span>Hủy bỏ</span>
            </button>
          </div>
        )}
      </div>

      {/* Spending Warning Banner */}
      {spendingWarning && spendingWarning.hasWarning && (
        <div className={`rounded-xl p-5 border flex flex-col gap-3 mb-6 ${spendingWarning.level === 'CRITICAL' ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className={spendingWarning.level === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'} />
            <span className={`font-extrabold text-sm ${spendingWarning.level === 'CRITICAL' ? 'text-rose-800' : 'text-amber-800'}`}>
              {spendingWarning.level === 'CRITICAL' ? '🔴 Chi tiêu bất thường nghiêm trọng' : '🟡 Chi tiêu vượt mức cảnh báo'}
            </span>
            <span className={`ml-auto text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${spendingWarning.level === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
              {spendingWarning.level}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-lg p-3 text-center ${spendingWarning.level === 'CRITICAL' ? 'bg-rose-100/60' : 'bg-amber-100/60'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#737783] mb-1">Tháng này</p>
              <p className={`font-black text-base tabular-nums ${spendingWarning.level === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'}`}>
                {spendingWarning.currentMonthTotal?.toLocaleString('vi-VN') ?? '—'}
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#737783] mb-1">Trung bình lịch sử</p>
              <p className="font-black text-base tabular-nums text-[#434652]">
                {spendingWarning.historicalAverage?.toLocaleString('vi-VN') ?? '—'}
              </p>
            </div>
            <div className={`rounded-lg p-3 text-center ${spendingWarning.level === 'CRITICAL' ? 'bg-rose-100/60' : 'bg-amber-100/60'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#737783] mb-1">Vượt mức</p>
              <div className={`flex items-center justify-center gap-1 font-black text-base ${spendingWarning.level === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'}`}>
                <TrendingUp size={14} />
                <span>{spendingWarning.overagePercent?.toFixed(1) ?? '—'}%</span>
              </div>
            </div>
          </div>
          <p className={`text-xs leading-relaxed ${spendingWarning.level === 'CRITICAL' ? 'text-rose-700' : 'text-amber-700'}`}>
            {spendingWarning.message}
          </p>
        </div>
      )}

      {/* Main Detailed Workspace - Form / Bento Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Core Column: Financial data, descriptions, and counterparty metadata */}
          <div className="lg:col-span-2 space-y-6">

            {/* General Info Card */}
            <div className="bg-white rounded-xl p-8 shadow-sm transition-all hover:shadow-md border border-[#eceef0] relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <h3 className="font-headline text-lg font-bold text-[#434652]">Thông tin chung</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#cde5ff] text-[#001d32] text-xs font-bold uppercase tracking-wider">
                    {transaction.type}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    transaction.status === 'ACTIVE'
                      ? 'bg-[#d9e2ff] text-[#001945]'
                      : transaction.status === 'UPDATED'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#ffdad6] text-[#93000a]'
                    }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>

              {/* Grid content editable if isEditing is true */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">

                {/* Transaction ID */}
                <div>
                  <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Mã giao dịch</label>
                  <p className="text-[#191c1e] font-semibold text-lg font-mono">{transaction.id}</p>
                </div>

                {/* Risk evaluation orb */}
                <div>
                  <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Trạng thái rủi ro</label>
                  {isEditing ? (
                    <select
                      value={editForm.riskStatus}
                      onChange={(e) => setEditForm({ ...editForm, riskStatus: e.target.value })}
                      className="bg-[#f2f4f6] border border-[#c3c6d4] text-[#191c1e] font-medium text-sm rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#003178] outline-none w-full"
                    >
                      <option value="FINE (Ổn định)">FINE (Ổn định)</option>
                      <option value="WARNING (Cảnh báo)">WARNING (Chú ý)</option>
                      <option value="RISK (Nguy cơ)">RISK (Nguy cơ)</option>
                    </select>
                  ) : (
                    <div className={`flex items-center gap-2 font-bold ${getRiskColorClass(transaction.riskStatus)}`}>
                      <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${getRiskBgCircle(transaction.riskStatus)}`} />
                      <span>{transaction.riskStatus}</span>
                    </div>
                  )}
                </div>

                {/* Fund Source */}
                <div>
                  <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Nguồn tiền</label>
                  {isEditing ? (
                    <select
                      value={editForm.sourceOfFunds}
                      onChange={(e) => setEditForm({ ...editForm, sourceOfFunds: e.target.value })}
                      className="bg-[#f2f4f6] border border-[#c3c6d4] text-[#191c1e] font-semibold text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-[#003178] outline-none"
                    >
                      {funds.map(f => (
                        <option key={f.id} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-[#191c1e] font-semibold text-base">{transaction.sourceOfFunds}</p>
                  )}
                </div>

                {/* Category tags dropdown */}
                <div>
                  <label className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] block mb-2">Danh mục</label>
                  {isEditing ? (
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="bg-[#f2f4f6] border border-[#c3c6d4] text-[#191c1e] font-semibold text-sm rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-[#003178] outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-[#eceef0] px-3.5 py-2 rounded-lg border border-[#c3c6d4]/10">
                      <Package size={16} className="text-[#006398]" />
                      <span className="text-[#434652] text-sm font-semibold">{transaction.category}</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Financial Impact / Large blue amount card */}
            <div className="primary-gradient rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
              {/* Halos and background lighting */}
              <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/20 rounded-full blur-[80px]" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#0D47A1]/40 rounded-full blur-[60px]" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                {/* Active numerical statement */}
                <div>
                  <label className="text-[10px] font-bold text-[#b0c6ff] uppercase tracking-[0.2em] block mb-2">Số tiền giao dịch</label>
                  <div className="flex items-baseline gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          className="bg-white/10 hover:bg-white/25 focus:bg-white/20 text-white font-headline text-3xl font-black p-2 rounded-xl border border-white/20 outline-none w-48"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                        />
                        <span className="text-[#b0c6ff] font-bold text-xl">VND</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-headline text-4xl lg:text-5xl font-black tracking-tighter text-white">
                          {formatCurrency(transaction.amount)}
                        </span>
                        <span className="text-[#b0c6ff] font-bold text-lg uppercase tracking-tighter">
                          {transaction.currency}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Interactive Limit fluctuation graph histogram */}
                <div className="w-full md:w-auto flex flex-col items-center md:items-end">
                  <label className="text-[10px] font-bold text-[#b0c6ff] uppercase tracking-[0.2em] block mb-4">Biến động hạn mức</label>
                  <div className="h-16 w-52 bg-white/10 rounded-lg flex items-center justify-center p-2.5">
                    <div className="flex items-end gap-1.5 h-full w-full justify-between">
                      {transaction.limitFluctuations.map((val, idx) => {
                        const isMainPeak = idx === 4; // Glow layout index 4 from designer specs
                        return (
                          <div
                            key={idx}
                            style={{ height: `${val}%` }}
                            className={`w-2.5 rounded-sm transition-all ${isMainPeak
                              ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)] scale-x-110'
                              : 'bg-[#b0c6ff] opacity-50 hover:opacity-100'
                              }`}
                            title={`Mức độ biến động: ${val}%`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Partners, Originating Staff, and Related Debt */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Counterparty Container */}
              <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm flex flex-col justify-start">
                <h4 className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] mb-4">Đối tác &amp; Nhà cung cấp</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f8f9fb] rounded-xl shadow-inner flex items-center justify-center overflow-hidden border border-[#eceef0]">
                    {transaction.counterparty.logoUrl ? (
                      <img
                        alt="Partner Brand"
                        className="w-10 h-10 object-contain"
                        src={transaction.counterparty.logoUrl}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <Building className="w-6 h-6 text-[#737783]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-1">
                        <select
                          className="bg-[#f2f4f6] text-[#191c1e] text-xs font-bold p-2.5 rounded-xl w-full border border-[#c3c6d4] focus:ring-2 focus:ring-[#003178] outline-none"
                          value={editForm.counterparty.name}
                          onChange={(e) => {
                            const selectedPartner = partners.find(p => p.name === e.target.value);
                            setEditForm({
                              ...editForm,
                              counterparty: {
                                name: e.target.value,
                                mst: selectedPartner ? (selectedPartner.address || 'Không có MST') : 'Chưa cập nhật'
                              }
                            });
                          }}
                        >
                          <option value="Khách hàng vãng lai">Khách hàng vãng lai</option>
                          {partners.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <p className="font-bold text-[#191c1e] text-sm truncate">{transaction.counterparty.name}</p>
                        <p className="text-xs text-[#434652]">MST: {transaction.counterparty.mst}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Creator Staff Card */}
              <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm flex flex-col justify-start">
                <h4 className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] mb-4">Người tạo phiếu</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#eceef0] bg-[#f8f9fb] flex items-center justify-center shadow-inner">
                    {transaction.creator.avatarUrl ? (
                      <img
                        alt="Creator"
                        className="w-full h-full object-cover"
                        src={transaction.creator.avatarUrl}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <User className="text-[#003178] w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[#191c1e] text-sm">{transaction.creator.name}</p>
                    <p className="text-xs text-[#434652]">{transaction.creator.role}</p>
                  </div>
                </div>
              </div>

              {/* Related Debt Card */}
              <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm flex flex-col justify-between col-span-1">
                <div>
                  <h4 className="text-[10px] font-bold text-[#737783] uppercase tracking-[0.2em] mb-4">Khoản nợ liên kết</h4>
                  {relatedDebt ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black tracking-wider ${
                          relatedDebt.debtType === 'PAYABLE' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {relatedDebt.debtType === 'PAYABLE' ? 'Đang trả nợ' : 'Đang thu nợ'}
                        </span>
                        <span className={`text-[9px] font-bold uppercase ${
                          relatedDebt.isPaid ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {relatedDebt.isPaid ? 'Đã hoàn tất' : 'Chưa hoàn tất'}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1e] text-sm line-clamp-1">{relatedDebt.title || 'Khoản nợ không tiêu đề'}</p>
                        <p className="text-xs text-[#737783] truncate">{relatedDebt.partnerName || 'Chưa rõ đối tác'}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#f2f4f6] text-center">
                        <div>
                          <p className="text-[8px] font-bold text-[#737783] uppercase">Tổng nợ</p>
                          <p className="text-[9px] font-black text-[#191c1e] truncate">{formatCurrency(relatedDebt.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-[#737783] uppercase">Đã trả</p>
                          <p className="text-[9px] font-black text-emerald-600 truncate">{formatCurrency(relatedDebt.paidAmount)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-[#737783] uppercase">Còn lại</p>
                          <p className="text-[9px] font-black text-rose-600 truncate">{formatCurrency(relatedDebt.remainingAmount)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-[#737783]">
                      <span className="italic font-medium">Giao dịch thường</span>
                      <span className="text-[10px] mt-1 text-[#737783]/60">Không liên kết khoản nợ nào</span>
                    </div>
                  )}
                </div>
                {relatedDebt && (
                  <div className="pt-3 border-t border-[#f2f4f6] mt-3">
                    <a
                      href="/debts"
                      className="w-full text-center block text-xs font-bold text-[#003178] hover:text-[#002150] transition-colors"
                    >
                      Xem chi tiết khoản nợ →
                    </a>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Right Column: Timing variables & deep structural descriptions */}
          <div className="space-y-6">

            {/* Timestamp properties */}
            <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm">
              <h3 className="font-headline font-bold text-sm text-[#191c1e] uppercase tracking-wider mb-6 pb-2 border-b border-[#f2f4f6]">
                Thời gian giao dịch
              </h3>
              <div className="space-y-6">

                {/* Date Property */}
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#006398]/10 rounded-xl text-[#006398]">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#737783] uppercase block leading-none mb-1">Ngày giao dịch</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="bg-[#f2f4f6] text-[#191c1e] text-sm font-semibold p-1 rounded border border-[#c3c6d4] w-28"
                        value={editForm.date}
                        onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        placeholder="DD/MM/YYYY"
                      />
                    ) : (
                      <p className="font-semibold text-sm text-[#191c1e]">{transaction.date}</p>
                    )}
                  </div>
                </div>

                {/* Clock precise timestamp */}
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-[#006398]/10 rounded-xl text-[#006398]">
                    <Clock size={18} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#737783] uppercase block leading-none mb-1">Thời điểm tạo phiếu</label>
                    {isEditing ? (
                      <input
                        type="text"
                        className="bg-[#f2f4f6] text-[#191c1e] text-sm font-semibold p-1 rounded border border-[#c3c6d4] w-40"
                        value={editForm.createdAt}
                        onChange={(e) => setEditForm({ ...editForm, createdAt: e.target.value })}
                      />
                    ) : (
                      <p className="font-semibold text-sm text-[#191c1e]">{transaction.createdAt}</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* In-depth Notes Container */}
            <div className="bg-white rounded-xl p-6 border border-[#eceef0] shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-headline font-bold text-sm text-[#191c1e] uppercase tracking-wider mb-4 pb-2 border-b border-[#f2f4f6]">
                  Ghi chú chi tiết
                </h3>
                <div className="bg-[#f2f4f6] p-4 rounded-xl min-h-[140px] border border-[#eceef0]">
                  {isEditing ? (
                    <textarea
                      className="bg-transparent text-sm text-[#434652] leading-relaxed w-full h-28 border-none resize-none outline-none focus:ring-0"
                      value={editForm.notes}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Nhập ghi chú chi tiết cho giao dịch này..."
                    />
                  ) : (
                    <p className="text-[#434652] text-xs lg:text-sm leading-relaxed text-justify">
                      {transaction.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Status footer orb */}
              <div className="mt-4 pt-4 border-t border-[#f2f4f6] flex items-center justify-between text-[11px] text-[#737783]">
                <span className="flex items-center gap-1">
                  <BadgeCheck size={14} className="text-emerald-600" />
                  Chứng từ gốc đính kèm
                </span>
                <span className="font-mono">ERP-ID: #{transaction.id.split('-')[1]}</span>
              </div>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}
