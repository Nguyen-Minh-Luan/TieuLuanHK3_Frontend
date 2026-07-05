import React, { useState, useEffect } from 'react';
import { X, Save, Handshake } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { resetSubmitStatus, createPartner, updatePartner } from '../../store/slices/partnerSlice';
import type { PartnerDTO } from '../../services/partnerService';

// ─── Danh sách loại đối tác chuẩn ────────────────────────────────────────────
const PARTNER_TYPES = [
  { value: 'CUSTOMER', label: 'Khách hàng' },
  { value: 'SUPPLIER', label: 'Nhà cung cấp' },
  { value: 'INVESTOR', label: 'Nhà đầu tư' },
  { value: 'PARTNER', label: 'Đối tác chiến lược' },
  { value: 'OTHER', label: 'Khác' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: PartnerDTO | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PartnerFormModal({
  isOpen,
  onClose,
  editData,
  onSuccess,
  onError,
}: PartnerFormModalProps) {
  const dispatch = useAppDispatch();
  const { submitStatus } = useAppSelector((s) => s.partner);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('CUSTOMER');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Điền dữ liệu khi edit hoặc reset khi tạo mới
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.name ?? '');
        setType(editData.type ?? 'CUSTOMER');
        setEmail(editData.email ?? '');
        setAddress(editData.address ?? '');
      } else {
        setName('');
        setType('CUSTOMER');
        setEmail('');
        setAddress('');
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  // Đóng modal sau khi submit thành công
  useEffect(() => {
    if (submitStatus === 'succeeded') {
      dispatch(resetSubmitStatus());
      onSuccess(editData ? 'Đã cập nhật đối tác thành công!' : 'Đã thêm đối tác mới thành công!');
      onClose();
    }
    if (submitStatus === 'failed') {
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, dispatch, editData, onSuccess, onClose]);

  if (!isOpen) return null;

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập tên đối tác.';
    if (!email.trim()) {
      errs.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Email không đúng định dạng.';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload: Omit<PartnerDTO, 'id'> = {
      name: name.trim(),
      type: type || undefined,
      email: email.trim(),
      address: address.trim() || undefined,
    };

    try {
      if (editData?.id) {
        await dispatch(updatePartner({ id: editData.id, data: payload })).unwrap();
      } else {
        await dispatch(createPartner(payload)).unwrap();
      }
    } catch (err: any) {
      onError(err ?? 'Đã xảy ra lỗi!');
    }
  };

  const isSubmitting = submitStatus === 'loading';

  // ─── Input shared class ───────────────────────────────────────────────────────
  const inputClass = (hasErr?: boolean) =>
    `w-full bg-[#f8f9fb] border ${hasErr ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none`;

  return (
    <div
      id="partner-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans"
    >
      <div
        id="partner-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-[#e2e8f0]/40"
      >
        {/* Close Button */}
        <button
          id="btn-partner-modal-close"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#003178]/10 rounded-xl">
              <Handshake className="w-5 h-5 text-[#003178]" />
            </div>
            <h2 className="text-xl font-display font-extrabold text-[#003178]">
              {editData ? 'Chỉnh sửa đối tác' : 'Thêm đối tác mới'}
            </h2>
          </div>
          <p className="text-xs text-[#64748b] font-medium">
            Quản lý thông tin khách hàng, nhà cung cấp và đối tác kinh doanh.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên đối tác */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Tên đối tác <span className="text-[#d91c1c]">*</span>
            </label>
            <input
              id="input-partner-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Công ty TNHH ABC..."
              className={inputClass(!!errors.name)}
            />
            {errors.name && <span className="text-xs text-[#ef4444] mt-1 block">{errors.name}</span>}
          </div>

          {/* Loại đối tác & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Loại đối tác
              </label>
              <select
                id="input-partner-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer"
              >
                {PARTNER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Email <span className="text-[#d91c1c]">*</span>
              </label>
              <input
                id="input-partner-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@company.com"
                className={inputClass(!!errors.email)}
              />
              {errors.email && <span className="text-xs text-[#ef4444] mt-1 block">{errors.email}</span>}
            </div>
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Địa chỉ
            </label>
            <input
              id="input-partner-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường, quận, thành phố..."
              className={inputClass()}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
            <button
              id="btn-partner-cancel"
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              id="btn-partner-submit"
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#003178] to-[#0d47a1] hover:from-[#002255] hover:to-[#0a3881] disabled:opacity-60 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : editData ? 'Lưu thay đổi' : 'Thêm đối tác'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
