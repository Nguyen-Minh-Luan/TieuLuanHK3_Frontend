import { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  PlusCircle,
  Tags,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { Sidebar } from '../../component/Sidebar';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  fetchCategories,
  fetchCategoryTree,
  deleteCategory,
  setParams,
} from '../../store/slices/categorySlice';
import { useDebounce } from '../../hooks/useDebounce';
import CategoryTable from './CategoryTable';
import CategoryFormModal from './CategoryFormModal';
import type { CategoryDTO } from '../../services/categoryService';

export default function CategoryPage() {
  const dispatch = useAppDispatch();
  const { items, totalElements, totalPages, params, status, error } = useAppSelector(
    (s) => s.category
  );

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Tải tree khi mount (dùng cho parentId dropdown trong form)
  useEffect(() => {
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  // Fetch khi params thay đổi hoặc status = idle
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCategories(params));
    }
  }, [status, params, dispatch]);

  // Debounced search → update params
  useEffect(() => {
    dispatch(setParams({ keyword: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch, dispatch]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleTypeFilter = (newType: 'ALL' | 'INCOME' | 'EXPENSE') => {
    setTypeFilter(newType);
    dispatch(setParams({ type: newType === 'ALL' ? undefined : newType, page: 1 }));
  };

  const handleEdit = (cat: CategoryDTO) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = async (cat: CategoryDTO) => {
    if (!cat.id) return;
    if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"? Thao tác này sẽ chuyển danh mục sang trạng thái không hoạt động.`)) {
      try {
        await dispatch(deleteCategory(cat.id)).unwrap();
        triggerToast(`Đã xóa danh mục "${cat.name}" thành công!`, 'success');
      } catch (err: any) {
        triggerToast(err ?? 'Xóa danh mục thất bại!', 'error');
      }
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setParams({ page }));
  };

  return (
    <div
      id="app-root-container"
      className="flex min-h-screen bg-[#f8f9fb] text-[#0f172a] selection:bg-[#003178]/10 select-none font-sans relative antialiased"
    >
      {/* Toast */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#e2e8f0] py-3.5 px-5 rounded-2xl shadow-xl transition-all duration-300 animate-[slideDown_0.2s_ease-out]"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          )}
          <span className="text-xs font-bold text-[#0f172a]">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-[#f1f5f9] rounded-lg text-[#94a3b8] hover:text-[#0f172a] transition-all ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        id="app-main-content-well"
        className="flex-1 min-h-screen bg-[#f8f9fb] px-8 py-8 space-y-8 overflow-y-auto"
      >
        {/* Header Nav Bar */}
        <header id="dashboard-navbar" className="flex items-center justify-between gap-6">
          {/* Search */}
          <div id="nav-search-bar" className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-3 h-4 w-4 text-[#94a3b8]" />
            <input
              id="nav-search-input"
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f1f5f9] placeholder-[#94a3b8] text-sm text-[#0f172a] font-medium pl-11 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#003178]/20 focus:bg-white outline-none transition-all"
            />
          </div>
          {/* Right actions */}
          <div id="nav-actions" className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button
                id="btn-nav-alert"
                title="Thông báo"
                className="p-2 bg-white hover:bg-[#f1f5f9] rounded-xl text-[#64748b] hover:text-[#0f172a] shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full ring-2 ring-white" />
              </button>
              <button
                id="btn-nav-faq"
                title="Trợ giúp"
                className="p-2 bg-white hover:bg-[#f1f5f9] rounded-xl text-[#64748b] hover:text-[#0f172a] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Title & Controls */}
        <section id="category-headline-bar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#003178]/10 rounded-xl">
                <Tags className="w-5 h-5 text-[#003178]" />
              </div>
              <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
                Quản lý danh mục
              </h2>
            </div>
            <p className="text-xs font-medium text-[#64748b] mt-1.5">
              Phân loại và quản lý các hạng mục thu nhập, chi phí theo cấu trúc cha–con.
            </p>
          </div>
          <button
            id="btn-add-category"
            onClick={() => {
              setEditingCategory(null);
              setIsModalOpen(true);
            }}
            className="bg-[#003178] hover:bg-[#00255a] text-white py-3 px-6 rounded-xl flex items-center gap-2 font-display text-xs font-bold transition-all shadow-md hover:shadow-indigo-900/10 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm hạng mục</span>
          </button>
        </section>

        {/* Type Filter Tabs */}
        <section id="category-filter-bar" className="flex items-center gap-2 flex-wrap">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map((t) => (
            <button
              key={t}
              id={`filter-type-${t}`}
              onClick={() => handleTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                typeFilter === t
                  ? t === 'INCOME'
                    ? 'bg-[#f0fdf4] text-[#166534] border border-[#86efac]/40'
                    : t === 'EXPENSE'
                    ? 'bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]/40'
                    : 'bg-[#003178] text-white shadow-sm'
                  : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8f9fb]'
              }`}
            >
              {t === 'ALL' ? 'Tất cả' : t === 'INCOME' ? 'Thu nhập' : 'Chi phí'}
            </button>
          ))}
          {error && status === 'failed' && (
            <span className="text-xs text-[#ef4444] font-medium ml-2">⚠ {error}</span>
          )}
        </section>

        {/* Category Table */}
        <section id="category-table-section">
          <CategoryTable
            items={items}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={params.page ?? 1}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={status === 'loading'}
          />
        </section>
      </main>

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        editData={editingCategory}
        onSuccess={(msg) => triggerToast(msg, 'success')}
        onError={(msg) => triggerToast(msg, 'error')}
      />
    </div>
  );
}
