import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import {
  fetchDebts,
  fetchDebtSummary,
  createDebt,
  updateDebt,
  deleteDebt,
  fetchDebtById,
  setParams,
  clearSelectedDebt,
} from '../../store/slices/debtSlice';
import { useDebounce } from '../../hooks/useDebounce';
import DebtDetailsModal from './DebtDetailsModal';
import NewDebtModal from './NewDebtModal';
import OverviewCards from './OverviewCards';
import DebtTable from './DebtTable';
import OptimizerCard from './OptimizerCard';
import QuickReportCard from './QuickReportCard';
import { Sidebar } from '../../component/Sidebar';
import {
  Search,
  Bell,
  HelpCircle,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import type { DebtDTO, DebtRequest } from './apiTypes';

export default function DebtPage() {
  const dispatch = useAppDispatch();
  const { items, totalElements, totalPages, params, selectedDebt, summary, status } = useAppSelector(
    (s) => s.debt
  );

  // Search input local state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modal dialogs toggles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtDTO | null>(null);

  // Toast Feedback Notifications state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Close toast automatically after 4.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initial loads and refetches when params change
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchDebts(params));
      dispatch(fetchDebtSummary());
    }
  }, [status, params, dispatch]);

  // Debounced search to trigger parameter update
  useEffect(() => {
    dispatch(setParams({ keyword: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch, dispatch]);

  // Handle saving new/modified debt
  const handleSaveDebt = async (submittedData: DebtRequest) => {
    try {
      if (editingDebt?.id) {
        await dispatch(updateDebt({ id: editingDebt.id, data: submittedData })).unwrap();
        triggerToast('Đã lưu thay đổi cho phiếu nợ thành công!', 'success');
      } else {
        await dispatch(createDebt(submittedData)).unwrap();
        triggerToast('Đã khởi tạo và đính kèm khoản nợ mới thành công!', 'success');
      }
      setIsModalOpen(false);
      setEditingDebt(null);
    } catch (err: any) {
      triggerToast(err ?? 'Lưu khoản nợ thất bại!', 'error');
    }
  };

  // Mark debt as fully paid
  // NOTE: Backend không cho phép set paidAmount trực tiếp qua PATCH /debts.
  // Thanh toán nợ phải thực hiện qua luồng tạo giao dịch (Transaction) liên kết debtId.
  // Hàm này thông báo cho user thay vì thực hiện patch không hợp lệ.
  const handleMarkAsPaid = (id: number) => {
    const debtItem = items.find((d) => d.id === id);
    if (!debtItem) return;
    triggerToast(
      `Để ghi nhận thanh toán cho khoản nợ của ${debtItem.partnerName || 'đối tác'}, ` +
      `vui lòng tạo giao dịch mới và liên kết với khoản nợ này.`,
      'info'
    );
  };

  // Delete Debt
  const handleDeleteDebt = async (id: number) => {
    const debtItem = items.find((d) => d.id === id);
    const partnerName = debtItem?.partnerName ?? 'Khoản nợ';

    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khoản nợ của ${partnerName} khỏi hệ thống không?`)) {
      try {
        await dispatch(deleteDebt(id)).unwrap();
        triggerToast('Đã xóa bỏ hoàn toàn phiếu nợ khỏi sổ lưu trữ!', 'info');
      } catch (err: any) {
        triggerToast(err ?? 'Xóa khoản nợ thất bại!', 'error');
      }
    }
  };

  // Edit action
  const handleEditDebt = (debt: DebtDTO) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
  };

  // View details action
  const handleViewDetails = async (debt: DebtDTO) => {
    if (debt.id != null) {
      await dispatch(fetchDebtById(debt.id));
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
      {/* Visual Floating Toast system */}
      {toast && (
        <div
          id="toast-notification"
          className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#e2e8f0] py-3.5 px-5 rounded-2xl shadow-xl transition-all duration-300 animate-[slideDown_0.2s_ease-out]"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
          ) : toast.type === 'info' ? (
            <CheckCircle2 className="w-5 h-5 text-[#3b82f6]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-[#ef4444]" />
          )}
          <span className="text-xs font-bold text-[#0f172a] font-sans">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 hover:bg-[#f1f5f9] rounded-lg text-[#94a3b8] hover:text-[#0f172a] transition-all ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar Navigation - Left anchor */}
      <Sidebar />

      {/* Main content display Area - Right anchor */}
      <main
        id="app-main-content-well"
        className="flex-1 min-h-screen bg-[#f8f9fb] px-8 py-8 space-y-8 overflow-y-auto"
      >
        {/* 1. Header Navigation Bar */}
        <header id="dashboard-navbar" className="flex items-center justify-between gap-6">
          {/* Left Search Bar */}
          <div id="nav-search-bar" className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-3 h-4 w-4 text-[#94a3b8]" />
            <input
              id="nav-search-input"
              type="text"
              placeholder="Tìm kiếm theo tiêu đề nợ hoặc đối tác..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f1f5f9] placeholder-[#94a3b8] text-sm text-[#0f172a] font-medium pl-11 pr-4 py-2.5 rounded-xl border border-transparent focus:border-[#003178]/20 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Right side navigation utilities */}
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
                title="Trợ giúp & Hỗ trợ"
                className="p-2 bg-white hover:bg-[#f1f5f9] rounded-xl text-[#64748b] hover:text-[#0f172a] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 2. Page Title & Add Button */}
        <section id="system-headline-bar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-extrabold text-[#003178] tracking-tight">
              Quản lý nợ
            </h2>
            <p className="text-xs font-medium text-[#64748b] mt-1.5">
              Theo dõi và quản lý các khoản nợ phải thu và nợ phải trả từ API thực tế.
            </p>
          </div>
          <button
            id="btn-add-new-debt"
            onClick={() => {
              setEditingDebt(null);
              setIsModalOpen(true);
            }}
            className="bg-[#003178] hover:bg-[#00255a] text-white py-3 px-6 rounded-xl flex items-center gap-2 font-display text-xs font-bold transition-all shadow-md hover:shadow-indigo-900/10 active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm khoản nợ mới</span>
          </button>
        </section>

        {/* 3. Overview KPI Cards */}
        <section id="metrics-summary">
          <OverviewCards summary={summary} />
        </section>

        {/* 4. Debt Table */}
        <section id="ledger-data-box">
          <DebtTable
            debts={items}
            totalElements={totalElements}
            totalPages={totalPages}
            currentPage={params.page ?? 1}
            onPageChange={handlePageChange}
            onMarkAsPaid={handleMarkAsPaid}
            onDeleteDebt={handleDeleteDebt}
            onEditDebt={handleEditDebt}
            onViewDetails={handleViewDetails}
          />
        </section>

        {/* 5. Bottom analytical cards */}
        <section id="bottom-charts-row" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <OptimizerCard debts={items} />
          </div>
          <div className="md:col-span-1">
            <QuickReportCard debts={items} />
          </div>
        </section>
      </main>

      {/* Modal A: Create & Edit */}
      <NewDebtModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDebt(null);
        }}
        onSave={handleSaveDebt}
        editDebtData={editingDebt}
      />

      {/* Modal B: View Details */}
      {selectedDebt && (
        <DebtDetailsModal
          debt={selectedDebt}
          onClose={() => dispatch(clearSelectedDebt())}
          onMarkAsPaid={handleMarkAsPaid}
        />
      )}
    </div>
  );
}