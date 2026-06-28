import React, { useState, useEffect } from 'react';
import type { Debt } from './types';
import { INITIAL_DEBTS } from './data';
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

const LOCAL_STORAGE_KEY = 'equity_ledger_debts_db_v1';

export default function DebtPage() {
  // 1. Main debts database state
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading debts from localStorage', e);
      }
    }
    return INITIAL_DEBTS;
  });

  // Sync to localstorage on edits
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(debts));
  }, [debts]);

  // 2. Search input state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 3. Modal dialogs toggles
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedDetailsDebt, setSelectedDetailsDebt] = useState<Debt | null>(null);

  // 4. Toast Feedback Notifications state
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

  // Operational Actions:

  // A. Add/Modify Debt
  const handleSaveDebt = (submittedData: Omit<Debt, 'id'> & { id?: string }) => {
    if (submittedData.id) {
      setDebts(prev =>
        prev.map(d => (d.id === submittedData.id ? ({ ...d, ...submittedData } as Debt) : d))
      );
      triggerToast('Đã lưu thay đổi cho phiếu nợ thành công!', 'success');
    } else {
      const newDebtItem: Debt = { ...submittedData, id: `debt-${Date.now()}` };
      setDebts(prev => [newDebtItem, ...prev]);
      triggerToast('Đã khởi tạo và đính kèm khoản nợ mới thành công!', 'success');
    }
    setIsModalOpen(false);
    setEditingDebt(null);
  };

  // B. Pay-off Debt
  const handleMarkAsPaid = (id: string) => {
    setDebts(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'Paid' as const } : d))
    );
    const creditorName = debts.find(d => d.id === id)?.creditor ?? 'Chủ nợ';
    triggerToast(`Đã chuyển tiền thanh toán dứt điểm nghĩa vụ nợ cho ${creditorName}!`, 'success');
  };

  // C. Delete Debt
  const handleDeleteDebt = (id: string) => {
    const creditorName = debts.find(d => d.id === id)?.creditor ?? 'Khoản nợ';
    if (confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khoản nợ của ${creditorName} khỏi công cụ lưu trữ không?`)) {
      setDebts(prev => prev.filter(d => d.id !== id));
      triggerToast('Đã xóa bỏ hoàn toàn phiếu nợ khỏi sổ lưu trữ!', 'info');
    }
  };

  // D. Set editing data and open modal
  const handleEditDebt = (debt: Debt) => {
    setEditingDebt(debt);
    setIsModalOpen(true);
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
          ) : (
            <AlertCircle className="w-5 h-5 text-[#3b82f6]" />
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
              placeholder="Tìm kiếm khoản nợ hoặc mã tham chiếu..."
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

            <div className="h-6 w-[1px] bg-[#cbd5e1]/40" />

            <div id="admin-profile-badge" className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-[#0f172a]">Alex Nguyen</p>
                <p className="text-[9px] font-mono font-bold text-[#64748b] uppercase tracking-wider">
                  ADMINISTRATOR
                </p>
              </div>
              <img
                id="admin-avatar"
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120&h=120"
                alt="Alex Nguyen Avatar"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#003178]/10"
              />
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
              Theo dõi và quản lý các khoản nợ phải trả định kỳ và phát sinh.
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
          <OverviewCards debts={debts} />
        </section>

        {/* 4. Debt Table */}
        <section id="ledger-data-box">
          <DebtTable
            debts={debts}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onMarkAsPaid={handleMarkAsPaid}
            onDeleteDebt={handleDeleteDebt}
            onEditDebt={handleEditDebt}
            onViewDetails={setSelectedDetailsDebt}
          />
        </section>

        {/* 5. Bottom analytical cards */}
        <section id="bottom-charts-row" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <OptimizerCard debts={debts} />
          </div>
          <div className="md:col-span-1">
            <QuickReportCard debts={debts} />
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
      <DebtDetailsModal
        debt={selectedDetailsDebt}
        onClose={() => setSelectedDetailsDebt(null)}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  );
}