import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Save } from 'lucide-react';
import type { Debt, CreditorType, DebtStatus } from './types';

interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Omit<Debt, 'id'> & { id?: string }) => void;
  editDebtData?: Debt | null;
}

const RECEIVABLE_TITLE_OPTIONS = [
  'Thu hồi nợ vay cá nhân',
  'Thu hồi nợ cung cấp dịch vụ',
  'Thu tiền bán hàng trả chậm',
  'Thu hồi nợ tạm ứng nhân viên',
  'Thu hồi tiền đặt cọc dự án',
  'Thu hồi quỹ đầu tư nhàn rỗi',
  'Khoản phải thu thương mại khác'
];

const PAYABLE_TITLE_OPTIONS = [
  'Vay mua thiết bị văn phòng',
  'Nợ nhà cung cấp vật tư chính',
  'Hóa đơn dịch vụ đám mây AWS/GCP',
  'Tiền thuê mặt bằng mặt phố',
  'Chi phí vận tải & giao nhận hàng',
  'Khoản vay lưu động ngân hàng',
  'Khoản phải trả thương mại khác'
];

const RECEIVABLE_DEBTOR_OPTIONS = [
  'Nguyễn Văn An (Cá nhân)',
  'Công ty TNHH Thương mại Hoàng Phát',
  'Hợp tác xã dịch vụ Nông nghiệp Xanh',
  'Đại lý Phân phối Minh Hùng',
  'Công ty Cổ phần Đầu tư Phát triển Việt Nam',
  'Phạm Thị Mai (Khách hàng lẻ)',
  'Trần Quốc Bảo (Đối tác liên danh)'
];

const PAYABLE_CREDITOR_OPTIONS = [
  'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
  'Công ty Cổ phần Viễn thông FPT',
  'Tổng công ty Tân Cảng Sài Gòn',
  'Công ty Luật TNHH Minh Khuê',
  'Nhà máy Sản xuất Thiết bị Điện tử Hòa Bình',
  'Công ty Cổ phần Vận tải biển Vinafco',
  'Bảo hiểm PJICO Sài Gòn'
];

export default function NewDebtModal({
  isOpen,
  onClose,
  onSave,
  editDebtData,
}: NewDebtModalProps) {
  // Form Values State
  const [creditor, setCreditor] = useState('');
  const [creditorType, setCreditorType] = useState<CreditorType>('payable');
  const [referenceCode, setReferenceCode] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<DebtStatus>('Fine');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  // Dynamic selector values for Reference Codes
  const [referenceCodeOptions, setReferenceCodeOptions] = useState<string[]>([]);

  // Validation Error States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Trigger values on edit mode
  useEffect(() => {
    if (isOpen) {
      if (editDebtData) {
        setCreditor(editDebtData.creditor);
        setCreditorType(editDebtData.creditorType);
        setReferenceCode(editDebtData.referenceCode);
        setAmount(editDebtData.amount);
        setDueDate(editDebtData.dueDate);
        setStatus(editDebtData.status);
        setDescription(editDebtData.description || '');
        setNotes(editDebtData.notes || '');

        // Ensure the edit draft code is at the top of selectable options
        setReferenceCodeOptions([editDebtData.referenceCode]);
      } else {
        // Clear values for dynamic creation
        setCreditorType('payable');
        setCreditor(PAYABLE_TITLE_OPTIONS[0]);

        // Generate stable 6 random codes for new insertion
        const randoms = Array.from({ length: 6 }, () => Math.floor(100 + Math.random() * 900));
        const generated = [
          `HDGTGT-2026-${randoms[0]}`,
          `HDKT-2026-${randoms[1]}`,
          `PTC-2026-${randoms[2]}`,
          `BANK-2026-${randoms[3]}`,
          `BILL-2026-${randoms[4]}`,
          `OTHER-2026-${randoms[5]}`,
        ];
        setReferenceCodeOptions(generated);
        setReferenceCode(generated[0]);

        setAmount(0);
        setDueDate(PAYABLE_CREDITOR_OPTIONS[0]);
        setStatus('Fine');
        setDescription('');
        setNotes('');
      }
      setErrors({});
    }
  }, [editDebtData, isOpen]);

  // Handle classification swapping and default the creditor title accordingly for new entries
  const handleCreditorTypeChange = (newType: CreditorType) => {
    setCreditorType(newType);
    if (!editDebtData) {
      if (newType === 'receivable') {
        setCreditor(RECEIVABLE_TITLE_OPTIONS[0]);
        setDueDate(RECEIVABLE_DEBTOR_OPTIONS[0]);
      } else {
        setCreditor(PAYABLE_TITLE_OPTIONS[0]);
        setDueDate(PAYABLE_CREDITOR_OPTIONS[0]);
      }
    }
  };

  if (!isOpen) return null;

  // Validation Check before Saving
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!creditor.trim()) {
      newErrors.creditor = 'Vui lòng chọn tiêu đề.';
    }
    if (!referenceCode.trim()) {
      newErrors.referenceCode = 'Vui lòng chọn mã tham chiếu.';
    }
    if (amount <= 0) {
      newErrors.amount = 'Số tiền nợ phải lớn hơn 0 đ.';
    }
    if (!dueDate.trim()) {
      newErrors.dueDate = creditorType === 'receivable' ? 'Vui lòng chọn người nợ.' : 'Vui lòng chọn chủ nợ.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save exactly the input string value
    const formattedDate = dueDate;

    // Pass data
    onSave({
      id: editDebtData?.id,
      dateCreated: editDebtData ? editDebtData.dateCreated : new Date().toLocaleDateString('vi', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      creditor,
      creditorType,
      referenceCode,
      amount,
      dueDate: formattedDate,
      status,
      description,
      notes,
    });

    onClose();
  };

  // Determine current active titles list
  const currentTitleOptions = creditorType === 'receivable' ? RECEIVABLE_TITLE_OPTIONS : PAYABLE_TITLE_OPTIONS;
  // Ensure we include what's currently being edited if it's there
  const finalTitleOptions = [...currentTitleOptions];
  if (creditor && !finalTitleOptions.includes(creditor)) {
    finalTitleOptions.push(creditor);
  }

  // Determine current active due_date / debtor options list
  const currentDueDateOptions = creditorType === 'receivable' ? RECEIVABLE_DEBTOR_OPTIONS : PAYABLE_CREDITOR_OPTIONS;
  const finalDueDateOptions = [...currentDueDateOptions];
  if (dueDate && !finalDueDateOptions.includes(dueDate)) {
    finalDueDateOptions.push(dueDate);
  }

  // Ensure current active reference code is listed in options
  const finalReferenceOptions = [...referenceCodeOptions];
  if (referenceCode && !finalReferenceOptions.includes(referenceCode)) {
    finalReferenceOptions.unshift(referenceCode);
  }

  return (
    <div id="modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none font-sans overflow-y-auto">
      <div
        id="modal-card"
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 border border-[#e2e8f0]/40 my-8 transition-transform duration-300"
      >
        {/* Close Modal Trigger */}
        <button
          id="btn-modal-close"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-xl font-display font-extrabold text-[#003178]">
            {editDebtData ? 'Chỉnh sửa khoản nợ' : 'Thêm khoản nợ mới'}
          </h2>
          <p className="text-xs text-[#64748b] font-medium mt-1">
            Ghi nhận chính xác các khoản nghĩa vụ tài chính doanh nghiệp để tính toán rủi ro.
          </p>
        </div>

        {/* Form Body Fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Form Group: Creditor Name (Dropdown as requested) */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Tiêu đề <span className="text-[#d91c1c]">*</span>
            </label>
            <select
              id="input-creditor"
              value={creditor}
              onChange={(e) => setCreditor(e.target.value)}
              className={`w-full bg-[#f8f9fb] border ${errors.creditor ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer`}
            >
              {finalTitleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.creditor && (
              <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.creditor}</span>
            )}
          </div>

          {/* Form Row: Domain & reference code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Phân loại
              </label>
              <select
                id="input-creditor-type"
                value={creditorType}
                onChange={(e) => handleCreditorTypeChange(e.target.value as CreditorType)}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer"
              >
                <option value="receivable">NỢ PHẢI THU</option>
                <option value="payable">NỢ PHẢI CHI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Mã tham chiếu <span className="text-[#d91c1c]">*</span></span>
                <span title="Mã hóa đơn hoặc số hợp đồng tham chiếu" className="flex items-center">
                  <HelpCircle className="w-3.5 h-3.5 text-[#94a3b8]" />
                </span>
              </label>
              <select
                id="input-ref-code"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                className={`w-full bg-[#f8f9fb] border ${errors.referenceCode ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-mono font-medium text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer`}
              >
                {finalReferenceOptions.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              {errors.referenceCode && (
                <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.referenceCode}</span>
              )}
            </div>
          </div>

          {/* Form Row: Amount & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Số tiền nợ (VND) <span className="text-[#d91c1c]">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-amount"
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={`w-full bg-[#f8f9fb] border ${errors.amount ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-extrabold text-[#0f172a] pl-4 pr-12 py-3 rounded-xl transition-all outline-none`}
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-[#94a3b8]">đ</span>
              </div>
              {errors.amount && (
                <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.amount}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                {creditorType === 'receivable' ? 'Người nợ' : 'Chủ nợ'} <span className="text-[#d91c1c]">*</span>
              </label>
              <select
                id="input-due-date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full bg-[#f8f9fb] border ${errors.dueDate ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer`}
              >
                {finalDueDateOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.dueDate && (
                <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.dueDate}</span>
              )}
            </div>
          </div>

          {/* Form Group: Description */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Nội dung hạng mục
            </label>
            <textarea
              id="input-desc"
              rows={2}
              placeholder="Nhập nội dung vắn tắt về nghĩa vụ tài chính..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none resize-none"
            />
          </div>

          {/* Form Group: Internal private Notes */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Ghi chú nội bộ
            </label>
            <input
              id="input-notes"
              type="text"
              placeholder="Ví dụ: Liên hệ bộ phận kế toán đính kèm phụ lục..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none"
            />
          </div>

          {/* Form Actions bottom */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
            <button
              id="btn-cancel"
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
            >
              Hủy bỏ (Escape)
            </button>
            <button
              id="btn-submit"
              type="submit"
              className="bg-gradient-to-r from-[#003178] to-[#0d47a1] hover:from-[#002255] hover:to-[#0a3881] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{editDebtData ? 'Lưu thay đổi' : 'Thêm khoản nợ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
