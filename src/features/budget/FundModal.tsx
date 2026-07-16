import React, { useState, useEffect } from 'react';
import { X, Landmark, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import type { Fund } from './types';

interface FundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fund: Omit<Fund, 'id' | 'updatedAt'> & { id?: string }) => void;
  editingFund?: Fund | null;
}

export default function FundModal({ isOpen, onClose, onSave, editingFund }: FundModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Nội bộ' | 'Tài trợ' | 'Vốn vay' | 'Khác'>('Nội bộ');
  const [totalCapital, setTotalCapital] = useState(100000);
  const [availableBalance, setAvailableBalance] = useState(100000);
  const [status, setStatus] = useState<'ACTIVE' | 'PENDING' | 'INACTIVE'>('ACTIVE');
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');

  // When editingFund changes, load its data
  useEffect(() => {
    if (editingFund) {
      setName(editingFund.name);
      setType(editingFund.type);
      setTotalCapital(editingFund.totalCapital);
      setAvailableBalance(editingFund.availableBalance);
      setStatus(editingFund.status);
      setCode(editingFund.code);
      setNote(editingFund.note);
    } else {
      // Defaults
      setName('');
      setType('Nội bộ');
      setTotalCapital(1000000);
      setAvailableBalance(1000000);
      setStatus('ACTIVE');
      setCode('');
      setNote('');
    }
  }, [editingFund, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên nguồn tiền!");
      return;
    }
    if (!code.trim()) {
      alert("Vui lòng nhập mã định danh quỹ!");
      return;
    }
    if (availableBalance > totalCapital) {
      alert("Số dư khả dụng không được lớn hơn tổng vốn!");
      return;
    }

    onSave({
      id: editingFund?.id,
      name,
      type,
      totalCapital,
      availableBalance,
      status,
      code: code.toUpperCase(),
      note,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        id="modal-backdrop"
        className="fixed inset-0 bg-[#001945]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        id="fund-modal-content"
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,49,120,0.15)] z-50 overflow-hidden flex flex-col font-sans"
      >
        {/* Header Ribbon with linear gradient */}
        <div className="bg-gradient-to-r from-[#003178] to-[#0D47A1] p-6 text-white flex justify-between items-center" id="modal-title-ribbon">
          <div className="flex items-center gap-3">
            <Landmark className="w-6 h-6 text-blue-200" />
            <div>
              <h2 className="text-xl font-bold font-heading">
                {editingFund ? 'Cập nhật Nguồn tiền' : 'Thêm Nguồn tiền Mới'}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5 font-sans">
                {editingFund ? `Chỉnh sửa nguồn tiền mã ${editingFund.code}` : 'Đăng ký nguồn vốn, dự phòng hoặc tài trợ mới'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[70vh]" id="modal-form">

          {/* Row 1: Name and Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="form-row-1">
            <div className="flex flex-col gap-1.5">
              <label id="lbl-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                Tên nguồn tiền <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Quỹ Dự phòng Nội bộ A1"
                className="w-full bg-[#f8fafc] text-sm text-[#0f172a] p-3 rounded-lg border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label id="lbl-code" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                Mã định danh (Code) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: INT-A1-RES"
                className="w-full bg-[#f8fafc] text-sm text-[#0f172a] p-3 rounded-lg border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all placeholder:text-slate-400 font-mono"
              />
            </div>
          </div>

          {/* Row 2: Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="form-row-2">
            <div className="flex flex-col gap-1.5">
              <label id="lbl-type" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                Phân loại nguồn lực
              </label>
              <div className="grid grid-cols-2 gap-2" id="type-radio-grid">
                {(['Nội bộ', 'Tài trợ', 'Vốn vay', 'Khác'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    id={`btn-type-option-${t}`}
                    onClick={() => setType(t)}
                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-all text-center border cursor-pointer ${type === t
                      ? 'bg-[#e8f1fd] text-brand-primary border-brand-primary/30 font-semibold'
                      : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label id="lbl-status" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                Trạng thái khởi tạo
              </label>
              <select
                id="select-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#f8fafc] text-sm text-[#0f172a] p-3 rounded-lg border-r-[12px] border-r-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all font-medium"
              >
                <option value="HOẠT ĐỘNG">👉 HOẠT ĐỘNG</option>
                <option value="GẦN GIỚI HẠN">⚠️ GẦN GIỚI HẠN</option>
                <option value="CHỜ KÍCH HOẠT">🕒 CHỜ KÍCH HOẠT</option>
              </select>
            </div>
          </div>

          {/* Row 3: Capital and Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="form-row-3">
            <div className="flex flex-col gap-1.5">
              <label id="lbl-total-capital" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                Tổng vốn định mức ($)
              </label>
              <input
                id="input-total-capital"
                type="number"
                min="0"
                required
                value={totalCapital}
                onChange={(e) => setTotalCapital(Number(e.target.value))}
                placeholder="VD: 1500000"
                className="w-full bg-[#f8fafc] text-sm text-[#0f172a] p-3 rounded-lg border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all font-semibold font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label id="lbl-available-balance" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
                Số dư khả dụng hiện tại ($)
              </label>
              <input
                id="input-available-balance"
                type="number"
                min="0"
                required
                value={availableBalance}
                onChange={(e) => setAvailableBalance(Number(e.target.value))}
                placeholder="VD: 300000"
                className="w-full bg-[#f8fafc] text-sm text-[#0f172a] p-3 rounded-lg border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all font-semibold font-mono"
              />
            </div>
          </div>

          {/* Special warning if Available Balance is very low relative to Total Capital */}
          {totalCapital > 0 && (availableBalance / totalCapital) < 0.1 && (
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700 font-medium flex items-center gap-2" id="balance-alert-row">
              <span className="text-amber-500">⚠️</span>
              <span>Chú ý: Số dư khả dụng thấp hơn 10% tổng nguồn lực. Hệ thống sẽ để cấu hình là Gần giới hạn.</span>
            </div>
          )}

          {/* Note Field */}
          <div className="flex flex-col gap-1.5" id="form-row-note">
            <label id="lbl-note" className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-heading">
              Ghi chú nội bộ
            </label>
            <textarea
              id="textarea-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú chi tiết về mục đích sử dụng, thời gian tất toán hoặc điều kiện thanh khoản..."
              rows={3}
              className="w-full bg-[#f8fafc] text-sm text-[#0f172a] p-3 rounded-lg border border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all placeholder:text-slate-400 font-sans leading-relaxed"
            />
          </div>

          {/* CTAs */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100" id="form-ctas">
            <button
              key="cancel"
              type="button"
              id="btn-form-cancel"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              key="submit"
              type="submit"
              id="btn-form-submit"
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-light text-white font-semibold text-sm rounded-lg transition-all shadow-sm hover:shadow cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingFund ? 'Cập nhật' : 'Thêm Quỹ'}</span>
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
