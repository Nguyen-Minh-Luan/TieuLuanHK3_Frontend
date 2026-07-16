import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchCategoryTree } from '../../store/slices/categorySlice';
import partnerService, { type PartnerDTO } from '../../services/partnerService';
import type { DebtDTO, DebtRequest } from './apiTypes';
import type { CategoryTreeNode } from '../../services/categoryService';

interface NewDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DebtRequest) => void;
  editDebtData?: DebtDTO | null;
}

/** Flatten tree thành danh sách phẳng có prefix indent để hiển thị trong select */
function flattenCategories(
  nodes: CategoryTreeNode[],
  depth = 0
): { id: number; label: string }[] {
  const result: { id: number; label: string }[] = [];
  for (const node of nodes) {
    const prefix = depth > 0 ? '　'.repeat(depth) + '└ ' : '';
    result.push({ id: node.id!, label: prefix + node.name });
    if (node.children?.length) {
      result.push(...flattenCategories(node.children, depth + 1));
    }
  }
  return result;
}

export default function NewDebtModal({
  isOpen,
  onClose,
  onSave,
  editDebtData,
}: NewDebtModalProps) {
  const dispatch = useAppDispatch();
  const { treeItems } = useAppSelector((s) => s.category);

  // Form states
  const [title, setTitle] = useState('');
  const [debtType, setDebtType] = useState<'RECEIVABLE' | 'PAYABLE'>('PAYABLE');
  const [debtDate, setDebtDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [partnerId, setPartnerId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [note, setNote] = useState('');
  // Sau
  const [userId, setUserId] = useState<number>(() => {
    const stored = localStorage.getItem('userId');
    return stored ? Number(stored) : 0;
  });

  // Partners list state (fetched locally)
  const [partners, setPartners] = useState<PartnerDTO[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

  // Validation Error States
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch categories and partners
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategoryTree());

      setLoadingPartners(true);
      partnerService.getAll({ page: 1, size: 100 })
        .then((res) => {
          setPartners(res.content || []);
        })
        .catch((err) => {
          console.error('Error fetching partners:', err);
        })
        .finally(() => {
          setLoadingPartners(false);
        });
    }
  }, [isOpen, dispatch]);

  // Load values for edit
  useEffect(() => {
    if (isOpen) {
      if (editDebtData) {
        setTitle(editDebtData.title || '');
        setDebtType(editDebtData.debtType);
        setDebtDate(editDebtData.debtDate ? editDebtData.debtDate.split('T')[0] : '');
        setDueDate(editDebtData.dueDate ? editDebtData.dueDate.split('T')[0] : '');
        setTotalAmount(editDebtData.totalAmount);
        setPartnerId(editDebtData.partnerId ? String(editDebtData.partnerId) : '');
        setCategoryId(editDebtData.categoryId ? String(editDebtData.categoryId) : '');
        setNote(editDebtData.note || '');
      } else {
        setTitle('');
        setDebtType('PAYABLE');
        // Default to today
        setDebtDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setTotalAmount(0);
        setPartnerId('');
        setCategoryId('');
        setUserId(userId);
        setNote('');
      }
      setErrors({});
    }
  }, [editDebtData, isOpen]);

  if (!isOpen) return null;

  // Validation Check before Saving
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề.';
    }
    if (!debtDate) {
      newErrors.debtDate = 'Vui lòng chọn ngày nợ.';
    }
    if (totalAmount <= 0) {
      newErrors.totalAmount = 'Số tiền nợ phải lớn hơn 0đ.';
    }
    if (!partnerId) {
      newErrors.partnerId = 'Vui lòng chọn đối tác.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      debtType,
      debtDate,
      dueDate: dueDate || undefined,
      totalAmount,
      partnerId: Number(partnerId),
      categoryId: categoryId ? Number(categoryId) : undefined,
      userId,
      note: note.trim() || undefined,
    });

    onClose();
  };

  // Flattened categories for display
  const categoryOptions = flattenCategories(treeItems);

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
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Tiêu đề / Nội dung nợ <span className="text-[#d91c1c]">*</span>
            </label>
            <input
              id="input-title"
              type="text"
              placeholder="Ví dụ: Vay vốn kinh doanh, Mua thiết bị văn phòng..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full bg-[#f8f9fb] border ${errors.title ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none`}
            />
            {errors.title && (
              <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.title}</span>
            )}
          </div>

          {/* Form Row: Phân loại & Ngày nợ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Phân loại
              </label>
              <select
                id="input-debt-type"
                value={debtType}
                onChange={(e) => setDebtType(e.target.value as 'RECEIVABLE' | 'PAYABLE')}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer"
              >
                <option value="RECEIVABLE">NỢ PHẢI THU (Receivable)</option>
                <option value="PAYABLE">NỢ PHẢI CHI (Payable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Ngày nợ <span className="text-[#d91c1c]">*</span>
              </label>
              <input
                id="input-debt-date"
                type="date"
                value={debtDate}
                onChange={(e) => setDebtDate(e.target.value)}
                className={`w-full bg-[#f8f9fb] border ${errors.debtDate ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none`}
              />
              {errors.debtDate && (
                <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.debtDate}</span>
              )}
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Hạn chót (Tùy chọn)
              </label>
              <input
                id="input-due-date"
                type="date"
                value={dueDate}
                min={debtDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none"
              />
            </div>
          </div>

          {/* Form Row: Số tiền nợ & Đối tác */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Số tiền nợ (VND) <span className="text-[#d91c1c]">*</span>
              </label>
              <div className="relative">
                <input
                  id="input-total-amount"
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="0"
                  value={totalAmount || ''}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className={`w-full bg-[#f8f9fb] border ${errors.totalAmount ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-extrabold text-[#0f172a] pl-4 pr-12 py-3 rounded-xl transition-all outline-none`}
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-[#94a3b8]">đ</span>
              </div>
              {errors.totalAmount && (
                <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.totalAmount}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Đối tác <span className="text-[#d91c1c]">*</span>
              </label>
              <select
                id="input-partner-id"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                className={`w-full bg-[#f8f9fb] border ${errors.partnerId ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer`}
              >
                <option value="">{loadingPartners ? 'Đang tải đối tác...' : '— Chọn đối tác —'}</option>
                {partners.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.partnerId && (
                <span className="text-xs font-medium text-[#ef4444] mt-1.5 block">{errors.partnerId}</span>
              )}
            </div>
          </div>

          {/* Form Group: Hạng mục danh mục (Category) */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Hạng mục danh mục
            </label>
            <select
              id="input-category-id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer"
            >
              <option value="">— Chọn hạng mục danh mục (không bắt buộc) —</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Form Group: Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Ghi chú nội bộ
            </label>
            <textarea
              id="input-note"
              rows={2}
              placeholder="Nhập ghi chú thêm cho khoản nợ này..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none resize-none"
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
              Hủy bỏ
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
