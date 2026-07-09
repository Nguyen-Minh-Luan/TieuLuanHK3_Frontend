import { useState, useEffect } from 'react';
import { PlusCircle, Handshake, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Sidebar } from '../../component/Sidebar';
import Header from '../../component/Header';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  fetchPartners,
  deletePartnerThunk,
  setParams,
} from '../../store/slices/partnerSlice';
import { useDebounce } from '../../hooks/useDebounce';
import PartnerTable from './PartnerTable';
import PartnerFormModal from './PartnerFormModal';
import type { PartnerDTO } from '../../services/partnerService';

// ─── Loại đối tác filter tabs ─────────────────────────────────────────────────
const TYPE_TABS = [
  { value: 'ALL',      label: 'Tất cả' },
  { value: 'CUSTOMER', label: 'Khách hàng' },
  { value: 'SUPPLIER', label: 'Nhà cung cấp' },
  { value: 'INVESTOR', label: 'Nhà đầu tư' },
  { value: 'PARTNER',  label: 'ĐT chiến lược' },
  { value: 'OTHER',    label: 'Khác' },
] as const;

type TypeFilter = (typeof TYPE_TABS)[number]['value'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function PartnerPage() {
  const dispatch = useAppDispatch();
  const { items, totalElements, totalPages, params, status, error } = useAppSelector(
    (s) => s.partner
  );

  // ─── Local UI state ─────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerDTO | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // ─── Fetch khi params thay đổi hoặc status = idle ──────────────────────────
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPartners(params));
    }
  }, [status, params, dispatch]);

  // ─── Debounced search → update params ──────────────────────────────────────
  useEffect(() => {
    dispatch(setParams({ keyword: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch, dispatch]);

  // ─── Toast auto-dismiss ─────────────────────────────────────────────────────
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const handleTypeFilter = (newType: TypeFilter) => {
    setTypeFilter(newType);
    dispatch(setParams({ type: newType === 'ALL' ? undefined : newType, page: 1 }));
  };

  const handleEdit = (partner: PartnerDTO) => {
    setEditingPartner(partner);
    setIsModalOpen(true);
  };

  const handleDelete = async (partner: PartnerDTO) => {
    if (!partner.id) return;
    if (
      confirm(
        `Bạn có chắc muốn xóa đối tác "${partner.name}"?\nThao tác này không thể hoàn tác.`
      )
    ) {
      try {
        await dispatch(deletePartnerThunk(partner.id)).unwrap();
        triggerToast(`Đã xóa đối tác "${partner.name}" thành công!`, 'success');
      } catch (err: any) {
        triggerToast(err ?? 'Xóa đối tác thất bại!', 'error');
      }
    }
  };

  const handlePageChange = (page: number) => {
    dispatch(setParams({ page }));
  };

  // ─── Tab active style ────────────────────────────────────────────────────────
  const tabClass = (tab: TypeFilter) => {
    const base = 'px-4 py-2 rounded-xl text-xs font-bold transition-all';
    if (typeFilter !== tab) return `${base} bg-white border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8f9fb]`;
    const activeMap: Record<TypeFilter, string> = {
      ALL:      `${base} bg-[#003178] text-white shadow-sm`,
      CUSTOMER: `${base} bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]/40`,
      SUPPLIER: `${base} bg-[#f0fdf4] text-[#166534] border border-[#86efac]/40`,
      INVESTOR: `${base} bg-[#fdf4ff] text-[#7e22ce] border border-[#e9d5ff]/40`,
      PARTNER:  `${base} bg-[#fff7ed] text-[#c2410c] border border-[#ffedd5]/40`,
      OTHER:    `${base} bg-[#f8f9fb] text-[#475569] border border-[#e2e8f0]`,
    };
    return activeMap[tab];
  };

  return (
    <div
      id="app-root-container"
      className="flex min-h-screen bg-surface text-on-surface-custom selection:bg-primary/10 select-none font-sans relative antialiased"
    >
      {/* Toast */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-outline-variant py-3.5 px-5 rounded-2xl shadow-xl transition-all duration-300 animate-[slideDown_0.2s_ease-out]"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-xs font-bold text-on-surface-custom">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-surface-container-high rounded-lg text-outline hover:text-on-surface-custom transition-all ml-1 cursor-pointer"
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
        className="flex-1 flex flex-col min-h-screen bg-surface overflow-hidden"
      >
        {/* Shared Header with search */}
        <Header
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Tìm kiếm tên hoặc email đối tác..."
        />
        <div className="flex-1 px-8 py-8 space-y-8 overflow-y-auto">
        {/* Page Title & Controls */}
        <section id="partner-headline-bar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-[#003178]/10 rounded-xl">
                <Handshake className="w-5 h-5 text-[#003178]" />
              </div>
              <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
                Quản lý đối tác
              </h2>
            </div>
            <p className="text-xs font-medium text-[#64748b] mt-1.5">
              Quản lý danh sách khách hàng, nhà cung cấp và đối tác kinh doanh.
            </p>
          </div>
          <button
            id="btn-add-partner"
            onClick={() => {
              setEditingPartner(null);
              setIsModalOpen(true);
            }}
            className="bg-[#003178] hover:bg-[#00255a] text-white py-3 px-6 rounded-xl flex items-center gap-2 font-display text-xs font-bold transition-all shadow-md hover:shadow-indigo-900/10 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm đối tác</span>
          </button>
        </section>

        {/* Type Filter Tabs */}
        <section id="partner-filter-bar" className="flex items-center gap-2 flex-wrap">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              id={`filter-type-${tab.value}`}
              onClick={() => handleTypeFilter(tab.value)}
              className={tabClass(tab.value)}
            >
              {tab.label}
            </button>
          ))}
          {error && status === 'failed' && (
            <span className="text-xs text-[#ef4444] font-medium ml-2">⚠ {error}</span>
          )}
        </section>

        {/* Partner Table */}
        <section id="partner-table-section">
          <PartnerTable
            items={items}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={params.page ?? 1}
            pageSize={params.size ?? 10}
            onPageChange={handlePageChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={status === 'loading'}
          />
        </section>
        </div>
      </main>

      {/* Form Modal */}
      <PartnerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPartner(null);
        }}
        editData={editingPartner}
        onSuccess={(msg) => triggerToast(msg, 'success')}
        onError={(msg) => triggerToast(msg, 'error')}
      />
    </div>
  );
}
