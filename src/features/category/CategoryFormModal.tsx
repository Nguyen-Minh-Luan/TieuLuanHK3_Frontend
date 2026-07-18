import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { fetchCategoryTree, resetSubmitStatus, createCategory, updateCategory } from '../../store/slices/categorySlice';
import type { CategoryDTO, CategoryTreeNode } from '../../services/categoryService';
import { chartOfAccountService, type ChartOfAccount } from '../../services/chartOfAccountService';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: CategoryDTO | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

/** Flatten tree thành danh sách phẳng có prefix indent để hiển thị trong select */
function flattenTree(
  nodes: CategoryTreeNode[],
  depth = 0,
  excludeId?: number
): { id: number; label: string }[] {
  const result: { id: number; label: string }[] = [];
  for (const node of nodes) {
    if (node.id === excludeId) continue; // loại trừ chính nó khi edit
    const prefix = depth > 0 ? '　'.repeat(depth) + '└ ' : '';
    result.push({ id: node.id!, label: prefix + node.name });
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1, excludeId));
    }
  }
  return result;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  editData,
  onSuccess,
  onError,
}: CategoryFormModalProps) {
  const dispatch = useAppDispatch();
  const { treeItems, submitStatus } = useAppSelector((s) => s.category);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [description, setDescription] = useState('');
  const [budgeting, setBudgeting] = useState<string>('');
  const [tax, setTax] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [accountCode, setAccountCode] = useState<string>('');
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load tree khi mở modal
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCategoryTree());
      chartOfAccountService.getAll().then(setAccounts).catch(console.error);
    }
  }, [isOpen, dispatch]);

  // Điền dữ liệu khi edit
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.name);
        setType(editData.type);
        setDescription(editData.description ?? '');
        setBudgeting(editData.budgeting != null ? String(editData.budgeting) : '');
        setTax(editData.tax != null ? String(editData.tax) : '');
        setParentId(editData.parentId != null ? String(editData.parentId) : '');
        setAccountCode(editData.accountCode ?? '');
      } else {
        setName('');
        setType('EXPENSE');
        setDescription('');
        setBudgeting('');
        setTax('');
        setParentId('');
        setAccountCode('');
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  // Đóng modal sau khi submit thành công
  useEffect(() => {
    if (submitStatus === 'succeeded') {
      dispatch(resetSubmitStatus());
      onSuccess(editData ? 'Đã cập nhật danh mục thành công!' : 'Đã thêm danh mục mới thành công!');
      onClose();
    }
    if (submitStatus === 'failed') {
      dispatch(resetSubmitStatus());
    }
  }, [submitStatus, dispatch, editData, onSuccess, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Vui lòng nhập tên danh mục.';
    if (budgeting && isNaN(Number(budgeting))) errs.budgeting = 'Ngân sách phải là số.';
    if (tax && isNaN(Number(tax))) errs.tax = 'Thuế phải là số.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload: Omit<CategoryDTO, 'id' | 'parentName'> = {
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      budgeting: budgeting ? Number(budgeting) : undefined,
      tax: tax ? Number(tax) : undefined,
      parentId: parentId ? Number(parentId) : undefined,
      accountCode: accountCode || undefined,
    };

    try {
      if (editData?.id) {
        await dispatch(updateCategory({ id: editData.id, data: payload })).unwrap();
      } else {
        await dispatch(createCategory(payload)).unwrap();
      }
    } catch (err: any) {
      onError(err ?? 'Đã xảy ra lỗi!');
    }
  };

  // Danh sách danh mục cha trong dropdown (loại trừ chính nó khi edit)
  const parentOptions = flattenTree(treeItems, 0, editData?.id);
  const isSubmitting = submitStatus === 'loading';

  return (
    <div
      id="category-modal-container"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans"
    >
      <div
        id="category-modal-card"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 border border-[#e2e8f0]/40"
      >
        {/* Close Button */}
        <button
          id="btn-category-modal-close"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-display font-extrabold text-[#003178]">
            {editData ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <p className="text-xs text-[#64748b] font-medium mt-1">
            Phân loại thu nhập và chi phí theo cấu trúc cha–con.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Tên danh mục <span className="text-[#d91c1c]">*</span>
            </label>
            <input
              id="input-category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Chi phí marketing..."
              className={`w-full bg-[#f8f9fb] border ${errors.name ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none`}
            />
            {errors.name && <span className="text-xs text-[#ef4444] mt-1 block">{errors.name}</span>}
          </div>

          {/* Loại & Danh mục cha */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Loại <span className="text-[#d91c1c]">*</span>
              </label>
              <select
                id="input-category-type"
                value={type}
                onChange={(e) => setType(e.target.value as 'INCOME' | 'EXPENSE')}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer"
              >
                <option value="INCOME">Thu nhập (INCOME)</option>
                <option value="EXPENSE">Chi phí (EXPENSE)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Danh mục cha
              </label>
              <select
                id="input-category-parent"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer"
              >
                <option value="">— Không có (danh mục gốc) —</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={String(opt.id)}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ngân sách & Thuế */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Hạn mức ngân sách (VND)
              </label>
              <div className="relative">
                <input
                  id="input-category-budgeting"
                  type="number"
                  min="0"
                  step="100000"
                  placeholder="0"
                  value={budgeting}
                  onChange={(e) => setBudgeting(e.target.value)}
                  className={`w-full bg-[#f8f9fb] border ${errors.budgeting ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-extrabold text-[#0f172a] pl-4 pr-10 py-3 rounded-xl transition-all outline-none`}
                />
                <span className="absolute right-3 top-3.5 text-xs font-bold text-[#94a3b8]">đ</span>
              </div>
              {errors.budgeting && <span className="text-xs text-[#ef4444] mt-1 block">{errors.budgeting}</span>}
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Thuế (%)
              </label>
              <div className="relative">
                <input
                  id="input-category-tax"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className={`w-full bg-[#f8f9fb] border ${errors.tax ? 'border-[#ef4444]' : 'border-transparent'} focus:border-[#003178]/40 focus:bg-white text-sm font-extrabold text-[#0f172a] pl-4 pr-10 py-3 rounded-xl transition-all outline-none`}
                />
                <span className="absolute right-3 top-3.5 text-xs font-bold text-[#94a3b8]">%</span>
              </div>
              {errors.tax && <span className="text-xs text-[#ef4444] mt-1 block">{errors.tax}</span>}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Mô tả
            </label>
            <textarea
              id="input-category-description"
              rows={2}
              placeholder="Nhập mô tả ngắn về danh mục..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none resize-none"
            />
          </div>

          {/* Mã tài khoản */}
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Mã tài khoản (Kế toán)
            </label>
            <select
              id="input-category-account"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
              className="w-full bg-[#f8f9fb] border border-transparent focus:border-[#003178]/40 focus:bg-white text-sm font-semibold text-[#0f172a] px-4 py-3 rounded-xl transition-all outline-none cursor-pointer"
            >
              <option value="">— Không chọn —</option>
              {accounts
                .filter(a => type === 'INCOME' ? ['REVENUE', 'OTHER_INCOME'].includes(a.group) : ['EXPENSE', 'OTHER_EXPENSE'].includes(a.group))
                .map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code} - {opt.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f1f5f9]">
            <button
              id="btn-category-cancel"
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-xs font-bold text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a] transition-all cursor-pointer"
            >
              Hủy bỏ
            </button>



            <button
              id="btn-category-submit"
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-[#003178] to-[#0d47a1] hover:from-[#002255] hover:to-[#0a3881] disabled:opacity-60 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang lưu...' : editData ? 'Lưu thay đổi' : 'Thêm danh mục'}</span>
            </button>
          </div>



        </form>





      </div>
    </div>
  );
}
